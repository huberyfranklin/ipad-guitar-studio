// lib/supabase/coursesApi.ts
import { supabase, isSupabaseConfigured } from './client';
import { Grade } from '@/types/guitar';
import { INITIAL_GRADES } from '@/lib/mockData';

export type UserLessonStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * 取得完整課程樹狀資料 (Grade -> Module -> Lessons)，並關聯使用者的進度
 */
export async function getRoadmapWithProgress(userId?: string): Promise<Grade[]> {
  if (!isSupabaseConfigured || !supabase) {
    // 若尚未填寫 Supabase 憑證，自動 Fallback 至示範資料
    return INITIAL_GRADES;
  }

  try {
    // 1. 抓取 grades, modules, lessons (依照 order_index 排序)
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades')
      .select(`
        id,
        title,
        description,
        order_index,
        modules (
          id,
          grade_id,
          title,
          order_index,
          lessons (
            id,
            module_id,
            title,
            summary,
            steps,
            chords_used,
            rhythm_pattern,
            practice_goals,
            order_index
          )
        )
      `)
      .order('order_index', { ascending: true });

    if (gradesError) {
      console.warn('載入 Supabase 課程失敗，切換為 Mock 資料:', gradesError.message);
      return INITIAL_GRADES;
    }

    if (!gradesData || gradesData.length === 0) {
      return INITIAL_GRADES;
    }

    // 2. 若有傳入 userId，查詢其學習進度記錄
    let userProgressMap: Record<string, UserLessonStatus> = {};
    if (userId) {
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, status')
        .eq('user_id', userId);

      if (progressData) {
        progressData.forEach((row) => {
          userProgressMap[row.lesson_id] = row.status as UserLessonStatus;
        });
      }
    }

    // 3. 組合進度至 lessons 物件中
    const formattedGrades: Grade[] = (gradesData as unknown as Grade[]).map((grade) => ({
      ...grade,
      modules: (grade.modules || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((mod) => ({
          ...mod,
          lessons: (mod.lessons || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson) => ({
              ...lesson,
              status: userProgressMap[lesson.id] || 'not_started',
            })),
        })),
    }));

    return formattedGrades;
  } catch (err) {
    console.error('getRoadmapWithProgress 例外:', err);
    return INITIAL_GRADES;
  }
}

/**
 * 更新或建立使用者的課堂學習進度 (打卡完成或標記為進行中)
 */
export async function updateLessonProgress(
  lessonId: string,
  status: UserLessonStatus,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // 離線 / 展示模式直接回傳成功
    return { success: true };
  }

  try {
    // 若無傳入 userId，嘗試取得當前登入使用者
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: userData } = await supabase.auth.getUser();
      targetUserId = userData.user?.id;
    }

    if (!targetUserId) {
      console.warn('未登入使用者，進度僅保留於前端工作記憶體中。');
      return { success: true };
    }

    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert(
        {
          user_id: targetUserId,
          lesson_id: lessonId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return { success: false, error: message };
  }
}
