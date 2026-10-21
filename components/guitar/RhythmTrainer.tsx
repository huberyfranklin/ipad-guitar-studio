'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RhythmBeat } from '@/types/guitar';
import { guitarAudio } from '@/lib/audio/guitarSynth';
import { Play, Square, Plus, Minus, Volume2, Timer } from 'lucide-react';

interface RhythmTrainerProps {
  pattern: RhythmBeat[];
  defaultBpm?: number;
  className?: string;
}

export const RhythmTrainer: React.FC<RhythmTrainerProps> = ({
  pattern,
  defaultBpm = 75,
  className = '',
}) => {
  const [bpm, setBpm] = useState(defaultBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countInValue, setCountInValue] = useState<number | null>(null); // 4 拍預備倒數 (1, 2, 3, 4)
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(-1);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const isPlayingRef = useRef(isPlaying);
  const bpmRef = useRef(bpm);
  isPlayingRef.current = isPlaying;
  bpmRef.current = bpm;

  // Web Audio 精準時鐘排程 (Lookahead Scheduler 支援 4 拍 Count-in)
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isPlaying && pattern.length > 0) {
      guitarAudio.initAudio();
      const ctx = guitarAudio.getContext();

      const secondsPerBeat = 60.0 / bpmRef.current;
      let nextBeatTime = ctx ? ctx.currentTime + 0.08 : 0;
      let countInStep = 1; // 1, 2, 3, 4 預備拍
      let isCountingIn = true;
      let rhythmBeatCounter = 0;

      const schedule = () => {
        if (!isPlayingRef.current || !ctx) return;

        while (nextBeatTime < ctx.currentTime + 0.12) {
          if (isCountingIn) {
            // 播放倒數鈴聲
            guitarAudio.playCountInBeep(nextBeatTime, countInStep);
            const currentStep = countInStep;
            const delayMs = Math.max(0, (nextBeatTime - ctx.currentTime) * 1000);

            setTimeout(() => {
              if (isPlayingRef.current) {
                setCountInValue(currentStep);
              }
            }, delayMs);

            countInStep++;
            if (countInStep > 4) {
              isCountingIn = false;
              // 倒數結束後清除視覺
              setTimeout(() => {
                if (isPlayingRef.current) {
                  setCountInValue(null);
                }
              }, delayMs + (secondsPerBeat * 1000) * 0.9);
            }
          } else {
            // 正式刷弦拍子排程
            const beatIndex = rhythmBeatCounter % pattern.length;
            const beatData = pattern[beatIndex];

            guitarAudio.playClick(nextBeatTime, beatData.accent);

            const delayMs = Math.max(0, (nextBeatTime - ctx.currentTime) * 1000);
            setTimeout(() => {
              if (isPlayingRef.current) {
                setCurrentBeatIndex(beatIndex);
              }
            }, delayMs);

            rhythmBeatCounter++;
          }

          nextBeatTime += secondsPerBeat;
        }

        timerId = setTimeout(schedule, 25);
      };

      schedule();
    } else {
      setCurrentBeatIndex(-1);
      setCountInValue(null);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [isPlaying, pattern]);

  // Tap Tempo 測速計算
  const handleTap = () => {
    const now = performance.now();
    const newTaps = [...tapTimes, now].filter((t) => now - t < 3000);
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        setBpm(calculatedBpm);
      }
    }
  };

  const togglePlay = async () => {
    await guitarAudio.initAudio();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none ${className}`}>
      {/* 控制列 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-white text-base">節奏刷弦脈動</span>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/80">
            空白鍵暫停/播放
          </span>
        </div>

        {/* BPM 控制器 */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setBpm((prev) => Math.max(40, prev - 5))}
            className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-white font-mono font-bold text-lg w-12 text-center">{bpm}</span>
          <span className="text-xs text-slate-400 mr-1">BPM</span>
          <button
            onClick={() => setBpm((prev) => Math.min(220, prev + 5))}
            className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 刷弦動態節奏流 / 倒數起拍預備區 */}
      <div className="relative mb-4">
        {/* 倒數 4 拍遮罩層 (Count-in Overlay) */}
        {countInValue !== null && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-4 z-20 border border-indigo-500/40 animate-in fade-in duration-150">
            <Timer className="w-6 h-6 text-indigo-400 animate-pulse" />
            <span className="text-slate-300 font-bold text-sm tracking-wide">預備倒數：</span>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-150 ${
                    num === countInValue
                      ? 'bg-indigo-600 text-white scale-125 shadow-lg shadow-indigo-500/50'
                      : num < countInValue
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 節奏流卡片陣列 */}
        <div className="grid grid-flow-col auto-cols-fr gap-3">
          {pattern.map((beat, idx) => {
            const isActive = currentBeatIndex === idx;
            const isDown = beat.direction === 'down';
            const isUp = beat.direction === 'up';

            return (
              <div
                key={`beat-${idx}`}
                className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-100 ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div
                  className={`text-2xl font-black ${
                    isActive
                      ? 'text-white'
                      : isDown
                      ? 'text-sky-400'
                      : isUp
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {isDown && '↓'}
                  {isUp && '↑'}
                  {beat.direction === 'rest' && '—'}
                </div>
                <span
                  className={`text-xs mt-1 font-semibold ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {beat.label}
                </span>
                {beat.accent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部大型觸控按鈕列 (iPad 練琴大尺寸按鈕) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={togglePlay}
          className={`py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-base shadow-md active:scale-98 transition-all ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>停止節拍</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>啟動 (4拍倒數起跑)</span>
            </>
          )}
        </button>

        <button
          onClick={handleTap}
          className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-base active:bg-slate-600 active:scale-98 transition-all"
        >
          Tap Tempo 手動測速
        </button>
      </div>
    </div>
  );
};
