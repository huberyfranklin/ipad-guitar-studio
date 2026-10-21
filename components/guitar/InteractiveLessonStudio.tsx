'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lesson, ChordDefinition } from '@/types/guitar';
import { Fretboard } from '@/components/guitar/Fretboard';
import { RhythmTrainer } from '@/components/guitar/RhythmTrainer';
import { CHORD_DICTIONARY } from '@/lib/guitarDictionary';
import { guitarAudio } from '@/lib/audio/guitarSynth';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  Keyboard
} from 'lucide-react';

interface InteractiveLessonStudioProps {
  lesson: Lesson;
  onBackToMap: () => void;
  onCompleteLesson: (lessonId: string) => Promise<void>;
}

export const InteractiveLessonStudio: React.FC<InteractiveLessonStudioProps> = ({
  lesson,
  onBackToMap,
  onCompleteLesson,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedGoals, setCheckedGoals] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = lesson.steps[currentStepIdx] || lesson.steps[0];
  const targetChord: ChordDefinition | undefined = CHORD_DICTIONARY[step?.target_chord || 'A'];

  // 切換目標達成勾選
  const toggleGoal = (idx: number) => {
    setCheckedGoals((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allGoalsChecked =
    lesson.practice_goals.length > 0 &&
    lesson.practice_goals.every((_, idx) => checkedGoals[idx]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onCompleteLesson(lesson.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = useCallback(() => {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStepIdx((prev) => Math.min(lesson.steps.length - 1, prev + 1));
  }, [lesson.steps.length]);

  // 藍牙踩踏板 / 鍵盤熱鍵支援 (吉他手雙手練琴必備)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在 input/textarea 觸發
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        // 藍牙翻頁踏板標準訊號：PageUp / ArrowLeft 為上一頁；PageDown / ArrowRight 為下一頁
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevStep();
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          handleNextStep();
          break;
        case 's':
        case 'S':
          // 按 'S' 快捷試聽和弦 (Strum)
          if (targetChord) {
            e.preventDefault();
            guitarAudio.strumChord(targetChord.frets, true);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevStep, handleNextStep, targetChord]);

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* 頂部導覽列 (iPad Studio Header) */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>課程地圖</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{lesson.title}</h1>
            <p className="text-xs text-slate-400">{lesson.summary}</p>
          </div>
        </div>

        {/* 踏板提示與步驟進度標記 */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>支援藍牙踏板 [← / →] 翻頁 | [S] 試聽</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">步驟</span>
            {lesson.steps.map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  i === currentStepIdx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : i < currentStepIdx
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* iPad 專屬雙欄並排主工作區 (60% 左側指板與節奏 / 40% 右側教學卡片與驗收) */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* 左側 7/12 (約 58%~60%)：視覺化工作區 */}
        <section className="col-span-7 flex flex-col gap-5 overflow-y-auto pr-1">
          {/* 互動吉他指板 */}
          <Fretboard
            chord={targetChord}
            highlightStrings={step?.highlight_strings || []}
            fretCount={4}
          />

          {/* 節奏刷弦脈動區 (含 4 拍 Count-in) */}
          {lesson.rhythm_pattern && lesson.rhythm_pattern.length > 0 && (
            <RhythmTrainer pattern={lesson.rhythm_pattern} defaultBpm={75} />
          )}
        </section>

        {/* 右側 5/12 (約 40%~42%)：步驟卡片與檢核打卡區 */}
        <section className="col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto">
          <div className="space-y-5">
            {/* 步驟標題卡片 */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  STEP {step.step_num} OF {lesson.steps.length}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  和弦：{step.target_chord}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{step.title}</h2>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">{step.content}</p>
            </div>

            {/* 常見錯誤警示框 */}
            {step.common_mistake && (
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 flex gap-3 text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-normal">
                  <span className="font-bold block text-amber-300 mb-0.5">⚠️ 常犯錯誤提醒：</span>
                  {step.common_mistake}
                </div>
              </div>
            )}

            {/* 達標驗收 Checklist */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                本課檢核目標 (達標後打勾)
              </h3>
              <div className="space-y-2">
                {lesson.practice_goals.map((goal, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleGoal(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      checkedGoals[idx]
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors ${
                        checkedGoals[idx] ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'
                      }`}
                    >
                      {checkedGoals[idx] && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="text-xs leading-relaxed font-medium">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 底部按鈕控制區 */}
          <div className="pt-6 border-t border-slate-800 space-y-3 shrink-0">
            {/* 上一步 / 下一步 (加大觸控面積) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={currentStepIdx === 0}
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <ChevronLeft className="w-4 h-4" />
                上一步
              </button>

              <button
                disabled={currentStepIdx === lesson.steps.length - 1}
                onClick={handleNextStep}
                className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors active:scale-98"
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 完成課堂並儲存至 Supabase */}
            <button
              onClick={handleFinish}
              disabled={isSubmitting || !allGoalsChecked}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                allGoalsChecked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? '正在記錄進度...' : allGoalsChecked ? '完成本課並打卡' : '請先勾選完成所有目標'}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
