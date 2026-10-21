'use client';

import React from 'react';
import { Grade } from '@/types/guitar';
import { BookOpen, CheckCircle, Clock, CircleDot, PlayCircle, Award } from 'lucide-react';

interface RoadmapViewProps {
  grades: Grade[];
  onSelectLesson: (lessonId: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ grades, onSelectLesson }) => {
  // 計算總進度
  const allLessons = grades.flatMap((g) => g.modules.flatMap((m) => m.lessons));
  const completedLessons = allLessons.filter((l) => l.status === 'completed');
  const progressPercent = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 select-none">
      {/* 頂部大型看板 (針對 iPad 寬螢幕設計) */}
      <header className="max-w-6xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>iPad 互動吉他學院</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                吉他指板探險地圖
              </h1>
              <p className="mt-2 text-slate-300 text-sm max-w-xl">
                無影片依賴，透過互動式指板物理發聲與精準時鐘節奏引擎，一步步建立扎實肌肉記憶。
              </p>
            </div>

            {/* 進度環 / 進度卡片 */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 min-w-[240px] flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-slate-800"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-indigo-500 transition-all duration-700"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-white">{progressPercent}%</span>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">總學習進度</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {completedLessons.length} / {allLessons.length} 課堂
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 關卡地圖內容區 (Grid 排版) */}
      <main className="max-w-6xl mx-auto space-y-12 pb-16">
        {grades.map((grade) => (
          <section key={grade.id} className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-baseline justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">{grade.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{grade.description}</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {grade.modules.length} 個模組
              </span>
            </div>

            <div className="space-y-8">
              {grade.modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-base">
                    <BookOpen className="w-5 h-5" />
                    <span>{module.title}</span>
                  </div>

                  {/* 課堂卡片陣列 (iPad 橫向 2~3 欄網格) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {module.lessons.map((lesson) => {
                      const status = lesson.status || 'not_started';
                      const isCompleted = status === 'completed';
                      const isInProgress = status === 'in_progress';

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={`group relative rounded-xl p-5 border cursor-pointer transition-all duration-200 active:scale-98 flex flex-col justify-between ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-700'
                              : isInProgress
                              ? 'bg-indigo-950/20 border-indigo-700/60 hover:border-indigo-500 shadow-md shadow-indigo-950/50'
                              : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            {/* 頂部標籤列 */}
                            <div className="flex items-center justify-between mb-3">
                              {/* 狀態徽章 */}
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                                  <CheckCircle className="w-3 h-3" /> 已通關
                                </span>
                              ) : isInProgress ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                                  <Clock className="w-3 h-3" /> 進行中
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                                  <CircleDot className="w-3 h-3" /> 尚未開始
                                </span>
                              )}

                              {/* 步驟數 */}
                              <span className="text-[11px] text-slate-400 font-medium">
                                {lesson.steps.length} 步驟
                              </span>
                            </div>

                            {/* 標題與摘要 */}
                            <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {lesson.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {lesson.summary}
                            </p>
                          </div>

                          {/* 底部和弦標籤與進入按鈕 */}
                          <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {lesson.chords_used.map((chord) => (
                                <span
                                  key={chord}
                                  className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                                >
                                  {chord}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                              <span>開始</span>
                              <PlayCircle className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
