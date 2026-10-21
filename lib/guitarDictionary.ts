// lib/guitarDictionary.ts
import { ChordDefinition } from '@/types/guitar';

export const CHORD_DICTIONARY: Record<string, ChordDefinition> = {
  // A 系列
  A: {
    name: 'A',
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    rootString: 5,
  },
  Am: {
    name: 'Am',
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    rootString: 5,
  },
  A7: {
    name: 'A7',
    frets: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 1, 0, 2, 0],
    rootString: 5,
  },

  // C 系列
  C: {
    name: 'C',
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    rootString: 5,
  },
  Cadd9: {
    name: 'Cadd9',
    frets: [-1, 3, 2, 0, 3, 3],
    fingers: [0, 2, 1, 0, 3, 4],
    rootString: 5,
  },

  // D 系列
  D: {
    name: 'D',
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    rootString: 4,
  },
  Dm: {
    name: 'Dm',
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    rootString: 4,
  },
  Dsus4: {
    name: 'Dsus4',
    frets: [-1, -1, 0, 2, 3, 3],
    fingers: [0, 0, 0, 1, 2, 3],
    rootString: 4,
  },

  // E 系列
  E: {
    name: 'E',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    rootString: 6,
  },
  Em: {
    name: 'Em',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    rootString: 6,
  },
  E7: {
    name: 'E7',
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    rootString: 6,
  },

  // G 系列
  G: {
    name: 'G',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    rootString: 6,
  },
  G7: {
    name: 'G7',
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    rootString: 6,
  },

  // B 系列 (入門常用開放 B7)
  B7: {
    name: 'B7',
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
    rootString: 5,
  },

  // F 系列 (包含大 F 完整封閉與小 F 簡易指法)
  F: {
    name: 'F',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    rootString: 6,
    barre: {
      fret: 1,
      fromString: 6,
      toString: 1,
    },
  },
  'F (Easy)': {
    name: 'F (Easy)',
    frets: [-1, -1, 3, 2, 1, 1],
    fingers: [0, 0, 3, 2, 1, 1],
    rootString: 4,
    barre: {
      fret: 1,
      fromString: 2,
      toString: 1,
    },
  },
};
