'use client';

import React, { useState, useEffect } from 'react';
import { RoadmapView } from '@/components/guitar/RoadmapView';
import { InteractiveLessonStudio } from '@/components/guitar/InteractiveLessonStudio';
import { Grade } from '@/types/guitar';
import { INITIAL_GRADES } from '@/lib/mockData';
import { getRoadmapWithProgress, updateLessonProgress } from '@/lib/supabase/coursesApi';
import { Loader2 } from 'lucide-react';

export default function CoursesPage() {
  const [grades, setGrades] = useState<Grade[]>(INITIAL_GRADES);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化載入課程與進度資料
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getRoadmapWithProgress();
        if (isMounted) {
          setGrades(data);
        }
      } catch (err) {
        console.error('載入課程失敗:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 當前選中的 Lesson
  const activeLesson = grades
    .flatMap((g) => g.modules.flatMap((m) => m.lessons))
    .find((l) => l.id === activeLessonId);

  // 標示課堂為完成並更新狀態至 Supabase
  const handleCompleteLesson = async (lessonId: string) => {
    // 1. 先樂觀更新前端 UI 狀態
    setGrades((prevGrades) =>
      prevGrades.map((grade) => ({
        ...grade,
        modules: grade.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, status: 'completed' } : lesson
          ),
        })),
      }))
    );

    // 2. 異步呼叫 Supabase 寫入資料庫
    await updateLessonProgress(lessonId, 'completed');

    // 3. 稍後優雅返回地圖
    setTimeout(() => {
      setActiveLessonId(null);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">正在載入 iPad 吉他工作台...</span>
      </div>
    );
  }

  if (activeLesson) {
    return (
      <InteractiveLessonStudio
        lesson={activeLesson}
        onBackToMap={() => setActiveLessonId(null)}
        onCompleteLesson={handleCompleteLesson}
      />
    );
  }

  return (
    <RoadmapView
      grades={grades}
      onSelectLesson={(lessonId) => setActiveLessonId(lessonId)}
    />
  );
}
