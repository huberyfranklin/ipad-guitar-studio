-- ==============================================================================
-- Grade 1 完整課程擴充 Migration 腳本 (Grade 1 Full Curriculum Migration)
-- 涵蓋開放和弦：A, D, E, Em, C, G, Dm，搭配 4/4 拍、8-Beat、16-Beat 與 3/4 慢搖滾節奏
-- ==============================================================================

DO $$
DECLARE
    g1_id UUID;
    m1_id UUID;
    m2_id UUID;
    m3_id UUID;
BEGIN
    -- 1. 取得 Grade 1 ID (若不存在則新建)
    SELECT id INTO g1_id FROM grades WHERE order_index = 1 LIMIT 1;
    IF g1_id IS NULL THEN
        INSERT INTO grades (title, description, order_index)
        VALUES ('Grade 1: 吉他入門奠基', '建立標準按弦手型與常用開放和弦，掌握 8-Beat 與 3/4 拍節奏律動', 1)
        RETURNING id INTO g1_id;
    END IF;

    -- ==========================================================================
    -- Module 1: 基礎名曲雙和弦與八分音符 (A & D 和弦)
    -- ==========================================================================
    SELECT id INTO m1_id FROM modules WHERE grade_id = g1_id AND order_index = 1 LIMIT 1;
    IF m1_id IS NULL THEN
        INSERT INTO modules (grade_id, title, order_index)
        VALUES (g1_id, 'Module 1: 基礎名曲雙和弦與八分音符 (A & D 和弦)', 1)
        RETURNING id INTO m1_id;
    END IF;

    -- 清理 Module 1 舊資料以重新規範
    DELETE FROM lessons WHERE module_id = m1_id;

    -- M1-Lesson 1: A 和弦
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m1_id,
        'Lesson 1: A 和弦核心按法與八分音符刷弦',
        '掌握標準 3 指 A 和弦、避免消音並跟上 75 BPM 刷弦律動。',
        '[
            {
                "step_num": 1,
                "title": "食指就位：第 4 弦第 2 格",
                "content": "使用食指 (1指) 指尖按壓在第 4 弦 (D 弦) 第 2 格，靠近琴桁金屬條，手腕放鬆微向前拱。",
                "target_chord": "A",
                "highlight_strings": [4],
                "common_mistake": "食指趴下悶到下方的第 3 弦。"
            },
            {
                "step_num": 2,
                "title": "中指與無名指擠入：第 3、2 弦",
                "content": "將中指 (2指) 放在第 3 弦第 2 格，無名指 (3指) 放在第 2 弦第 2 格。三指緊密排列在同一品格中。",
                "target_chord": "A",
                "highlight_strings": [2, 3, 4],
                "common_mistake": "無名指容易離琴桁太遠，導致發出打品雜音。"
            },
            {
                "step_num": 3,
                "title": "全音撥響與悶音確認",
                "content": "大拇指微碰第 6 弦防止發聲 (X)，從第 5 弦 (A 根音) 開始往下刷過所有弦，確認每一根弦皆清脆共鳴。",
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
            "在 75 BPM 下維持節奏刷弦連續 1 分鐘不中斷",
            "手型放開後能在 1.5 秒內盲按精準復位"
        ]'::jsonb,
        1
    );

    -- M1-Lesson 2: D 和弦與切換
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m1_id,
        'Lesson 2: D 和弦三角形指型與切換樞紐',
        '學習高音 1、2、3 弦三角形按法，掌握開放 D 和弦與精確刷弦範疇。',
        '[
            {
                "step_num": 1,
                "title": "食指與中指支架：第 3 弦與第 1 弦第 2 格",
                "content": "食指按第 3 弦第 2 格，中指按第 1 弦第 2 格，構成上下對稱的支撐點。",
                "target_chord": "D",
                "highlight_strings": [1, 3],
                "common_mistake": "手指過於傾斜導致第 1 弦無法清脆發聲。"
            },
            {
                "step_num": 2,
                "title": "無名指延伸：第 2 弦第 3 格",
                "content": "無名指微往前跨到第 2 弦第 3 格，構成正三角形指型。第 4 弦為空弦根音 (D)。",
                "target_chord": "D",
                "highlight_strings": [2, 4],
                "common_mistake": "第 5、6 弦容易誤撥，記住大拇指或右手撥弦應避開前兩弦。"
            },
            {
                "step_num": 3,
                "title": "A 到 D 和弦錨點切換",
                "content": "觀察無名指（2弦）：A 和弦在第 2 格，切換到 D 和弦只需滑動到第 3 格，以此作為移動錨點。",
                "target_chord": "D",
                "highlight_strings": [1, 2, 3, 4],
                "common_mistake": "切換時整隻手掌騰空浮起，失去琴頸定位感。"
            }
        ]'::jsonb,
        '["A", "D"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "down", "label": "3", "accent": true},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "down", "label": "4", "accent": false}
        ]'::jsonb,
        '[
            "D 和弦下刷時嚴格控制只刷第 1 至 4 弦",
            "在 60 BPM 下完成 A 與 D 和弦每小節切換連續 8 小節",
            "切換時拍子無停頓、雜音率低於 10%"
        ]'::jsonb,
        2
    );

    -- ==========================================================================
    -- Module 2: E 族系開放和弦與 4/4 拍民謠刷弦 (E & Em 和弦)
    -- ==========================================================================
    SELECT id INTO m2_id FROM modules WHERE grade_id = g1_id AND order_index = 2 LIMIT 1;
    IF m2_id IS NULL THEN
        INSERT INTO modules (grade_id, title, order_index)
        VALUES (g1_id, 'Module 2: E 族系開放和弦與 4/4 拍民謠刷弦 (E & Em 和弦)', 2)
        RETURNING id INTO m2_id;
    END IF;

    DELETE FROM lessons WHERE module_id = m2_id;

    -- M2-Lesson 1: Em 和弦 (史上最友善和弦)
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m2_id,
        'Lesson 3: Em 和弦與六線全弦震撼共鳴',
        '吉他入門最純粹的兩指和弦，感受 6 條弦全部振動的飽滿低頻。',
        '[
            {
                "step_num": 1,
                "title": "中指與無名指重音門閂",
                "content": "中指按第 5 弦第 2 格，無名指按第 4 弦第 2 格，兩指指尖垂直立於琴面。",
                "target_chord": "Em",
                "highlight_strings": [4, 5],
                "common_mistake": "中指碰觸第 6 弦導致低音 E 悶音。"
            },
            {
                "step_num": 2,
                "title": "六線全刷與右手釋放",
                "content": "Em 和弦不需悶任何一條弦！大膽放鬆手腕從第 6 弦刷到底，確認 1、2、3 開放弦自然延音。",
                "target_chord": "Em",
                "highlight_strings": [1, 2, 3, 4, 5, 6],
                "common_mistake": "右手刷弦太用力導致琴弦打品。"
            }
        ]'::jsonb,
        '["Em"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "down", "label": "3", "accent": true},
            {"direction": "down", "label": "4", "accent": false}
        ]'::jsonb,
        '[
            "Em 和弦 6 條弦單獨撥響皆清晰飽滿",
            "完成 Em 到 A 和弦 1 分鐘盲按切換達 35 次"
        ]'::jsonb,
        1
    );

    -- M2-Lesson 2: E 和弦與經典下下上下民謠刷弦
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m2_id,
        'Lesson 4: E 和弦轉換與經典民謠刷弦節奏 (Folk Strum)',
        '在 Em 基礎上加上食指蛻變成 E 大和弦，學習最常用吉他刷弦節奏。',
        '[
            {
                "step_num": 1,
                "title": "食指畫龍點睛：第 3 弦第 1 格",
                "content": "保持中指與無名指在第 5、4 弦第 2 格，食指精準按在第 3 弦第 1 格，由小調轉為大調明亮聲響。",
                "target_chord": "E",
                "highlight_strings": [3],
                "common_mistake": "食指未立起導致悶到第 2 弦。"
            },
            {
                "step_num": 2,
                "title": "經典刷弦手感：空刷概念",
                "content": "下、下、上、空、上、下。手腕保持像鐘擺一般上下均勻晃動，不上刷時手臂也要自然經過琴面。",
                "target_chord": "E",
                "highlight_strings": [1, 2, 3, 4, 5, 6],
                "common_mistake": "停頓時右手完全僵硬停下，導致拍子拖延。"
            }
        ]'::jsonb,
        '["E", "Em"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "up", "label": "3", "accent": false},
            {"direction": "down", "label": "&", "accent": false},
            {"direction": "up", "label": "4", "accent": false}
        ]'::jsonb,
        '[
            "E 與 Em 自由切換無阻礙",
            "跟隨 70 BPM 節拍器完成 8 小節經典民謠刷弦不掉拍"
        ]'::jsonb,
        2
    );

    -- ==========================================================================
    -- Module 3: 流行歌四大開放和弦與 3/4 慢搖滾 (C, G, Dm 和弦)
    -- ==========================================================================
    SELECT id INTO m3_id FROM modules WHERE grade_id = g1_id AND order_index = 3 LIMIT 1;
    IF m3_id IS NULL THEN
        INSERT INTO modules (grade_id, title, order_index)
        VALUES (g1_id, 'Module 3: 流行歌四大開放和弦與慢搖滾律動 (C, G, Dm 和弦)', 3)
        RETURNING id INTO m3_id;
    END IF;

    DELETE FROM lessons WHERE module_id = m3_id;

    -- M3-Lesson 1: C 和弦階梯指型
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m3_id,
        'Lesson 5: C 大和弦階梯指型與跨品擴張',
        '橫跨前 3 品的斜向階梯指型，吉他手手指柔韌度與獨立性的第一道門檻。',
        '[
            {
                "step_num": 1,
                "title": "食指第一階：第 2 弦第 1 格",
                "content": "食指按在第 2 弦第 1 格，指腹注意不要下陷。",
                "target_chord": "C",
                "highlight_strings": [2],
                "common_mistake": "食指悶到第 1 弦高音 E。"
            },
            {
                "step_num": 2,
                "title": "中指第二階：第 4 弦第 2 格",
                "content": "中指斜跨到第 4 弦第 2 格，讓出第 3 弦 (G 空弦)。",
                "target_chord": "C",
                "highlight_strings": [4],
                "common_mistake": "中指肉墊不小心靠到第 3 弦。"
            },
            {
                "step_num": 3,
                "title": "無名指第三階根音：第 5 弦第 3 格",
                "content": "無名指充分伸展到第 5 弦第 3 格 (C 根音)，指腹頂部順便輕碰第 6 弦將其消音 (X)。",
                "target_chord": "C",
                "highlight_strings": [5],
                "common_mistake": "手腕沒有向前推，導致無名指按不到琴桁邊緣。"
            }
        ]'::jsonb,
        '["C", "Am"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "&", "accent": false},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "down", "label": "3", "accent": true},
            {"direction": "up", "label": "&", "accent": false}
        ]'::jsonb,
        '[
            "第 1 弦與第 3 弦開放弦清脆發聲",
            "無名指自然悶住第 6 弦",
            "C 到 Am 和弦無痛轉換 (僅移動無名指)"
        ]'::jsonb,
        1
    );

    -- M3-Lesson 2: G 和弦大跨度
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m3_id,
        'Lesson 6: G 和弦開闊按法與熱門進程切換',
        '橫跨第 6 弦與第 1 弦的開闊手型，掌握流行名曲的萬能基石。',
        '[
            {
                "step_num": 1,
                "title": "低音支柱：中指 6 弦與食指 5 弦",
                "content": "中指按第 6 弦第 3 格 (G 根音)，食指按第 5 弦第 2 格，構成紮實低音。",
                "target_chord": "G",
                "highlight_strings": [5, 6],
                "common_mistake": "食指無力趴下悶到第 4 弦。"
            },
            {
                "step_num": 2,
                "title": "高音鎖定：無名指 (或小指) 第 1 弦第 3 格",
                "content": "無名指跨到第 1 弦第 3 格。2、3、4 弦皆為開放弦，聲音極具開闊感。",
                "target_chord": "G",
                "highlight_strings": [1],
                "common_mistake": "手掌過於緊繃，導致虎口貼死琴頸。"
            }
        ]'::jsonb,
        '["G", "C", "D", "Em"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "up", "label": "3", "accent": false},
            {"direction": "down", "label": "&", "accent": false},
            {"direction": "up", "label": "4", "accent": false}
        ]'::jsonb,
        '[
            "G 和弦全部 6 條弦撥響無啞音",
            "挑戰完成 G - Em - C - D 萬能和弦循環進行"
        ]'::jsonb,
        2
    );

    -- M3-Lesson 3: Dm 和弦與 3/4 拍華爾滋慢搖滾
    INSERT INTO lessons (
        module_id, title, summary, steps, chords_used, rhythm_pattern, practice_goals, order_index
    ) VALUES (
        m3_id,
        'Lesson 7: Dm 小調和弦與 3/4 拍慢搖滾 (Slow Rock)',
        '憂鬱淒美的小調色彩，搭配三拍子 (澎-恰-恰) 經典節奏體驗。',
        '[
            {
                "step_num": 1,
                "title": "食指第 1 弦第 1 格，中指第 3 弦第 2 格",
                "content": "食指按在第 1 弦第 1 格，中指按第 3 弦第 2 格。",
                "target_chord": "Dm",
                "highlight_strings": [1, 3],
                "common_mistake": "食指與中指距離太近互相推擠。"
            },
            {
                "step_num": 2,
                "title": "無名指第 2 弦第 3 格，4 弦開放根音",
                "content": "無名指落在第 2 弦第 3 格。彈奏時右手只刷第 1 至 4 弦。",
                "target_chord": "Dm",
                "highlight_strings": [2, 4],
                "common_mistake": "誤刷到第 5、6 弦造成聲音渾濁。"
            }
        ]'::jsonb,
        '["Dm", "Am", "E"]'::jsonb,
        '[
            {"direction": "down", "label": "1", "accent": true},
            {"direction": "down", "label": "2", "accent": false},
            {"direction": "up", "label": "&", "accent": false},
            {"direction": "down", "label": "3", "accent": false},
            {"direction": "up", "label": "&", "accent": false}
        ]'::jsonb,
        '[
            "Dm 和弦高音 1、2、3 弦共鳴清晰",
            "精準掌握 3/4 拍「重 - 輕 - 輕」律動循環"
        ]'::jsonb,
        3
    );

END $$;
