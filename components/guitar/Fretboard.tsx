'use client';

import React, { useState } from 'react';
import { ChordDefinition } from '@/types/guitar';
import { guitarAudio } from '@/lib/audio/guitarSynth';
import { RotateCw, Volume2 } from 'lucide-react';

interface FretboardProps {
  chord?: ChordDefinition;
  highlightStrings?: number[]; // [1, 2, 3, 4, 5, 6]
  fretCount?: number;
  className?: string;
}

export type FretboardPerspective = 'player' | 'audience';

/**
 * 專為 iPad 水平橫放設計的 6 弦吉他指板 (SVG)
 * 支援「吉他手第一人稱視角 (Player)」與「面對面教學視角 (Audience)」無縫切換。
 */
export const Fretboard: React.FC<FretboardProps> = ({
  chord,
  highlightStrings = [],
  fretCount = 4,
  className = '',
}) => {
  // perspective:
  // 'player': 第 6 弦 (低音 E) 在上方，第 1 弦 (高音 E) 在下方（低頭看琴頸的視角）
  // 'audience': 第 1 弦 (高音 E) 在上方，第 6 弦 (低音 E) 在下方（看對面老師彈琴的視角）
  const [perspective, setPerspective] = useState<FretboardPerspective>('player');

  // SVG 尺寸配置
  const width = 640;
  const height = 280;
  const paddingLeft = 70;  // 留給 Nut 與 Open/Mute 標記
  const paddingRight = 30;
  const paddingTop = 45;
  const paddingBottom = 45;

  const boardWidth = width - paddingLeft - paddingRight;
  const boardHeight = height - paddingTop - paddingBottom;

  const stringCount = 6;
  const stringSpacing = boardHeight / (stringCount - 1);
  const fretWidth = boardWidth / fretCount;

  // 取得物理弦號 (1~6):
  // 在 player 視角下: row 0 是第 6 弦，row 5 是第 1 弦
  // 在 audience 視角下: row 0 是第 1 弦，row 5 是第 6 弦
  const getPhysicalStringNum = (rowIdx: number): number => {
    return perspective === 'player' ? 6 - rowIdx : rowIdx + 1;
  };

  // 琴弦粗細：依據物理弦號決定 (6 弦最粗 4.5px，1 弦最細 1.5px)
  const getStringThickness = (stringNum: number) => {
    return 1.5 + (stringNum - 1) * 0.6;
  };

  // 點擊單音發聲 (stringNumber: 1~6, fret: 0~fretCount)
  const handleNoteClick = async (stringNumber: number, fret: number) => {
    await guitarAudio.initAudio();
    // 轉成 guitarAudio 內部索引: 6弦 -> 0, 1弦 -> 5
    const internalStringIdx = 6 - stringNumber;
    guitarAudio.pluckString(internalStringIdx, fret);
  };

  const togglePerspective = () => {
    setPerspective((prev) => (prev === 'player' ? 'audience' : 'player'));
  };

  // 計算封閉和弦 (Barre) 在 SVG 中的 Y 座標範圍
  const getBarreCoords = () => {
    if (!chord?.barre) return null;
    const { fret, fromString, toString } = chord.barre;
    if (fret > fretCount) return null;

    // 找到 fromString 與 toString 對應的 row 索引
    const getRowByStringNum = (strNum: number) => {
      return perspective === 'player' ? 6 - strNum : strNum - 1;
    };

    const rowA = getRowByStringNum(fromString);
    const rowB = getRowByStringNum(toString);
    const minY = paddingTop + Math.min(rowA, rowB) * stringSpacing;
    const maxY = paddingTop + Math.max(rowA, rowB) * stringSpacing;
    const x = paddingLeft + (fret - 0.5) * fretWidth;

    return { x, minY, maxY };
  };

  const barreCoords = getBarreCoords();

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none ${className}`}>
      {/* 標題與操作提示 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white tracking-wide">
            {chord ? `${chord.name} 和弦指型` : '自由指板互動區'}
          </span>
          <button
            onClick={togglePerspective}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>視角：{perspective === 'player' ? '自己視角 (低頭看)' : '老師視角 (面對面)'}</span>
          </button>
        </div>

        {/* 撥弦試聽快捷鍵 */}
        <div className="flex items-center gap-2">
          {chord && (
            <>
              <button
                onClick={() => guitarAudio.strumChord(chord.frets, true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>下刷</span>
                <span className="text-xs opacity-75">↓</span>
              </button>
              <button
                onClick={() => guitarAudio.playArpeggio(chord.frets)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 active:scale-95 transition-all"
              >
                分解撥弦
              </button>
            </>
          )}
        </div>
      </div>

      {/* SVG 指板本體 */}
      <div className="w-full overflow-hidden flex justify-center items-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px]"
          style={{ touchAction: 'manipulation' }}
        >
          {/* 指板深色木紋底板 */}
          <rect
            x={paddingLeft}
            y={paddingTop - 10}
            width={boardWidth}
            height={boardHeight + 20}
            rx={8}
            fill="#1e222d"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* 品位鑲嵌圓點 (Position Inlay Markers) 3, 5 品 */}
          {[3, 5].map((fret) => {
            if (fret <= fretCount) {
              const markerX = paddingLeft + (fret - 0.5) * fretWidth;
              const markerY = paddingTop + boardHeight / 2;
              return (
                <circle
                  key={`inlay-${fret}`}
                  cx={markerX}
                  cy={markerY}
                  r="6"
                  fill="#475569"
                  opacity="0.6"
                />
              );
            }
            return null;
          })}

          {/* 琴桁 (Frets 金屬條) */}
          {Array.from({ length: fretCount + 1 }).map((_, i) => {
            const x = paddingLeft + i * fretWidth;
            const isNut = i === 0;
            return (
              <g key={`fret-${i}`}>
                <line
                  x1={x}
                  y1={paddingTop - 10}
                  x2={x}
                  y2={paddingTop + boardHeight + 10}
                  stroke={isNut ? '#e2e8f0' : '#64748b'}
                  strokeWidth={isNut ? 7 : 3}
                  strokeLinecap="round"
                />
                {!isNut && (
                  <text
                    x={x - fretWidth / 2}
                    y={height - 12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="13"
                    fontWeight="600"
                  >
                    {i} 格
                  </text>
                )}
              </g>
            );
          })}

          {/* 封閉和弦 Barre 壓條視覺 */}
          {barreCoords && (
            <g>
              <line
                x1={barreCoords.x}
                y1={barreCoords.minY}
                x2={barreCoords.x}
                y2={barreCoords.maxY}
                stroke="#6366f1"
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1={barreCoords.x}
                y1={barreCoords.minY}
                x2={barreCoords.x}
                y2={barreCoords.maxY}
                stroke="#4f46e5"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* 6 條琴弦渲染 */}
          {Array.from({ length: stringCount }).map((_, rowIdx) => {
            const y = paddingTop + rowIdx * stringSpacing;
            const physicalStrNum = getPhysicalStringNum(rowIdx);
            const isHighlighted = highlightStrings.includes(physicalStrNum);
            const thickness = getStringThickness(physicalStrNum);
            const chordFretIndex = 6 - physicalStrNum; // chord.frets [6弦, 5弦, ..., 1弦]
            const chordFret = chord ? chord.frets[chordFretIndex] : -1;
            const fingerNum = chord ? chord.fingers[chordFretIndex] : 0;
            const isRoot = chord?.rootString === physicalStrNum;

            return (
              <g key={`string-row-${rowIdx}`}>
                {/* 弦名稱與根音標記 */}
                <text
                  x={18}
                  y={y + 4}
                  fill={isRoot ? '#fbbf24' : isHighlighted ? '#38bdf8' : '#64748b'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {physicalStrNum}弦{isRoot ? ' (R)' : ''}
                </text>

                {/* Nut 左邊的 Open (O) 或 Mute (X) 狀態標記 */}
                {chord && (
                  <g>
                    {chordFret === -1 && (
                      <text
                        x={paddingLeft - 22}
                        y={y + 5}
                        fill="#ef4444"
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ✕
                      </text>
                    )}
                    {chordFret === 0 && (
                      <circle
                        cx={paddingLeft - 22}
                        cy={y}
                        r="6"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                    )}
                  </g>
                )}

                {/* 琴弦本體 */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke={isHighlighted ? '#60a5fa' : isRoot ? '#fef08a' : '#94a3b8'}
                  strokeWidth={isHighlighted ? thickness + 1.5 : thickness}
                  opacity={isHighlighted ? 1 : 0.75}
                />

                {/* 和弦按壓點 (圓點與手指編號) */}
                {chord && chordFret > 0 && chordFret <= fretCount && (
                  <g
                    className="cursor-pointer"
                    onClick={() => handleNoteClick(physicalStrNum, chordFret)}
                  >
                    {/* 呼吸發光陰影 */}
                    <circle
                      cx={paddingLeft + (chordFret - 0.5) * fretWidth}
                      cy={y}
                      r="16"
                      fill={isRoot ? '#f59e0b' : '#6366f1'}
                      opacity="0.3"
                      className="animate-pulse"
                    />
                    {/* 主要實心點 */}
                    <circle
                      cx={paddingLeft + (chordFret - 0.5) * fretWidth}
                      cy={y}
                      r="13"
                      fill={isRoot ? '#d97706' : '#4f46e5'}
                      stroke={isRoot ? '#fcd34d' : '#818cf8'}
                      strokeWidth="2.5"
                    />
                    {/* 手指編號 (1~4) */}
                    {fingerNum > 0 && (
                      <text
                        x={paddingLeft + (chordFret - 0.5) * fretWidth}
                        y={y + 4.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        {fingerNum}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 底部輔助說明 */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            空弦 (O)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold">✕</span>
            悶音 (X)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-[10px] text-slate-950 flex items-center justify-center font-black">
              R
            </span>
            和弦根音 (Root)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-[10px] text-white flex items-center justify-center font-bold">
              1
            </span>
            指法 (1~4指)
          </span>
        </div>
        <span className="italic opacity-60">點擊品位圓點可單獨試音</span>
      </div>
    </div>
  );
};
