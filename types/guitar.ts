// types/guitar.ts

export type NoteStatus = 'mute' | 'open' | 'fretted';

export interface ChordDefinition {
  name: string;
  // 6 弦到 1 弦的品位 (-1 = Mute, 0 = Open, 1~5 = Fret)
  frets: [number, number, number, number, number, number];
  // 6 弦到 1 弦對應使用的手指 (0 = 無, 1 = 食指, 2 = 中指, 3 = 無名指, 4 = 小指)
  fingers: [number, number, number, number, number, number];
  // 根音所在的弦編號 (1~6)
  rootString?: number;
  // 封閉和弦起始格數 (選填)
  barre?: {
    fret: number;
    fromString: number; // 1-6 (從低音弦到高音弦)
    toString: number;   // 1-6
  };
}

export interface LessonStep {
  step_num: number;
  title: string;
  content: string;
  target_chord: string;
  highlight_strings?: number[]; // [1, 2, 3, 4, 5, 6]
  common_mistake?: string;
}

export interface RhythmBeat {
  direction: 'down' | 'up' | 'rest';
  label: string;
  accent?: boolean;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  summary: string;
  steps: LessonStep[];
  chords_used: string[];
  rhythm_pattern: RhythmBeat[];
  practice_goals: string[];
  order_index: number;
}

export interface Module {
  id: string;
  grade_id: string;
  title: string;
  order_index: number;
  lessons: (Lesson & { status?: 'not_started' | 'in_progress' | 'completed' })[];
}

export interface Grade {
  id: string;
  title: string;
  description: string;
  order_index: number;
  modules: Module[];
}
