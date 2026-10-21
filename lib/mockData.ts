// lib/mockData.ts
import { Grade } from '@/types/guitar';

export const INITIAL_GRADES: Grade[] = [
  {
    id: 'g1',
    title: 'Grade 1: 吉他入門奠基',
    description: '建立標準按弦手型與 8-Beat 基本刷弦節奏',
    order_index: 1,
    modules: [
      {
        id: 'm1',
        grade_id: 'g1',
        title: 'Module 1: 基礎開放和弦與首批名曲手型',
        order_index: 1,
        lessons: [
          {
            id: 'l1',
            module_id: 'm1',
            title: 'A 和弦核心按法與八分音符刷弦',
            summary: '掌握標準 3 指 A 和弦、避免消音並跟上 75 BPM 刷弦律動。',
            order_index: 1,
            status: 'in_progress',
            chords_used: ['A'],
            steps: [
              {
                step_num: 1,
                title: '食指就位：第 4 弦第 2 格',
                content: '使用食指 (1指) 指尖按壓在第 4 弦 (D 弦) 第 2 格，靠近琴桁金屬條，注意手腕自然放鬆。',
                target_chord: 'A',
                highlight_strings: [4],
                common_mistake: '食指趴下悶到下方的第 3 弦。',
              },
              {
                step_num: 2,
                title: '中指與無名指擠入：第 3、2 弦',
                content: '將中指 (2指) 放在第 3 弦第 2 格，無名指 (3指) 緊隨其後放在第 2 弦第 2 格。三隻手指需緊密排列在同一品格中。',
                target_chord: 'A',
                highlight_strings: [2, 3, 4],
                common_mistake: '無名指容易離琴桁太遠，導致發出打品雜音。',
              },
              {
                step_num: 3,
                title: '全音撥響與悶音確認',
                content: '大拇指輕觸第 6 弦防止發聲 (X)，從第 5 弦 (A 開放弦) 開始往下刷過所有弦，確認每一根弦皆清脆共鳴。',
                target_chord: 'A',
                highlight_strings: [1, 2, 3, 4, 5],
                common_mistake: '第 1 弦 (高音 E) 常被無名指肉墊碰到而悶音。',
              },
            ],
            rhythm_pattern: [
              { direction: 'down', label: '1', accent: true },
              { direction: 'down', label: '&', accent: false },
              { direction: 'up', label: '2', accent: false },
              { direction: 'up', label: '&', accent: false },
              { direction: 'down', label: '3', accent: true },
            ],
            practice_goals: [
              '單音測試：第 1 至 5 弦皆無消音與打品雜音',
              '在 75 BPM 下維持節奏刷弦連續 1 分鐘不中斷',
              '手型放開後能在 1.5 秒內盲按精準復位',
            ],
          },
          {
            id: 'l2',
            module_id: 'm1',
            title: 'D 和弦指法與三角指型切換',
            summary: '學習 1、2、3 弦三角形按法，掌握開放 D 和弦與精確刷弦範疇。',
            order_index: 2,
            status: 'not_started',
            chords_used: ['D'],
            steps: [
              {
                step_num: 1,
                title: '食指與中指：第 3 弦與第 1 弦第 2 格',
                content: '食指按第 3 弦第 2 格，中指按第 1 弦第 2 格，構成上下對稱支撐。',
                target_chord: 'D',
                highlight_strings: [1, 3],
                common_mistake: '手腕向外扭轉過多造成手指疲勞。',
              },
              {
                step_num: 2,
                title: '無名指延伸：第 2 弦第 3 格',
                content: '無名指按在第 2 弦第 3 格，構成清晰的正三角形指型。第 4 弦為根音 D 開放弦。',
                target_chord: 'D',
                highlight_strings: [2],
                common_mistake: '第 5、6 弦容易誤彈，造成低音渾濁。',
              },
            ],
            rhythm_pattern: [
              { direction: 'down', label: '1', accent: true },
              { direction: 'down', label: '2', accent: false },
              { direction: 'down', label: '3', accent: true },
              { direction: 'down', label: '4', accent: false },
            ],
            practice_goals: [
              '第 5、6 弦確實悶音不彈',
              'A 和弦與 D 和弦切換達 30 次/分',
            ],
          },
        ],
      },
    ],
  },
];
