-- ==============================================================================
-- 專用互動式吉他教學 App (iPad Studio 版) - Supabase 資料庫建表腳本
-- ==============================================================================

-- 1. 啟用 UUID 擴充
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 建立自動更新 updated_at 的通用 Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 等級 / 年級表 (Grades)
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 模組表 (Modules)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 課堂表 (Lessons)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    chords_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    rhythm_pattern JSONB NOT NULL DEFAULT '[]'::jsonb,
    practice_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 使用者課堂進度表 (User Lesson Progress)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

-- 7. 綁定 updated_at 自動更新 Trigger
DROP TRIGGER IF EXISTS set_user_lesson_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER set_user_lesson_progress_updated_at
BEFORE UPDATE ON user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. 啟用 Row Level Security (RLS)
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 9. RLS 安全策略配置
-- 所有人皆可讀取公開課程內容
CREATE POLICY "Public read grades" ON grades FOR SELECT USING (true);
CREATE POLICY "Public read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);

-- 學生僅能讀取與修改自己的學習進度
CREATE POLICY "Users can manage own progress" ON user_lesson_progress
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_modules_grade_id ON modules(grade_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_lesson_progress(user_id);

-- ==============================================================================
-- 範例示範資料 (Seed Data)
-- ==============================================================================
DO $$
DECLARE
    g1_id UUID;
    m1_id UUID;
    l1_id UUID;
BEGIN
    -- 插入 Grade 1
    INSERT INTO grades (title, description, order_index)
    VALUES ('Grade 1: 吉他入門奠基', '建立標準按弦手型與 8-Beat 基本刷弦節奏', 1)
    RETURNING id INTO g1_id;

    -- 插入 Module 1
    INSERT INTO modules (grade_id, title, order_index)
    VALUES (g1_id, 'Module 1: 基礎開放和弦與首批名曲手型', 1)
    RETURNING id INTO m1_id;

    -- 插入 Lesson 1
    INSERT INTO lessons (
        module_id,
        title,
        summary,
        steps,
        chords_used,
        rhythm_pattern,
        practice_goals,
        order_index
    ) VALUES (
        m1_id,
        'A 和弦核心按法與八分音符刷弦',
        '掌握標準 3 指 A 和弦、避免消音並跟上 75 BPM 刷弦律動。',
        '[
            {
                "step_num": 1,
                "title": "食指就位：第 4 弦第 2 格",
                "content": "使用食指 (1指) 指尖按壓在第 4 弦 (D 弦) 第 2 格，靠近琴桁金屬條，注意手腕自然放鬆。",
                "target_chord": "A",
                "highlight_strings": [4],
                "common_mistake": "食指趴下悶到下方的第 3 弦。"
            },
            {
                "step_num": 2,
                "title": "中指與無名指擠入：第 3、2 弦",
                "content": "將中指 (2指) 放在第 3 弦第 2 格，無名指 (3指) 緊隨其後放在第 2 弦第 2 格。三隻手指需緊密排列在同一品格中。",
                "target_chord": "A",
                "highlight_strings": [2, 3, 4],
                "common_mistake": "無名指容易離琴桁太遠，導致發出打品雜音。"
            },
            {
                "step_num": 3,
                "title": "全音撥響與悶音確認",
                "content": "大拇指輕觸第 6 弦防止發聲 (X)，從第 5 弦 (A 開放弦) 開始往下刷過所有弦，確認每一根弦皆清脆共鳴。",
                "target_chord": "A",
                "highlight_strings": [1, 2, 3, 4, 5],
                "common_mistake": "第 1 弦 (高音 E) 常被無名指肉墊碰到而悶音。"
            }
        ]'::jsonb,
        '["A"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "&", "accent": false},
            {"direction": "up", "label": "2", "accent": false},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "down", "label": "3", "accent": true}
        ]'::jsonb,
        '[
            "單音測試：第 1 至 5 弦皆無消音與打品雜音",
            "在 70 BPM 下維持節奏刷弦連續 1 分鐘不中斷",
            "手型放開後能在 1.5 秒內盲按精準復位"
        ]'::jsonb,
        1
    ) RETURNING id INTO l1_id;
END $$;
