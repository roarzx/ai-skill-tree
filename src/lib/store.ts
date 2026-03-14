import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SkillLevel, UserSkill, LearningLog } from './types';

interface AppState {
  userSkills: Record<string, UserSkill>;
  learningLogs: LearningLog[];
  selectedSkillId: string | null;
  nodePositions: Record<string, [number, number, number]>;
  setSelectedSkill: (skillId: string | null) => void;
  updateSkillLevel: (skillId: string, level: SkillLevel) => void;
  updateSkillProgress: (skillId: string, progress: number) => void;
  addLearningLog: (skillId: string, content: string) => void;
  updateNodePosition: (skillId: string, position: [number, number, number]) => void;
  setNodePositions: (positions: Record<string, [number, number, number]>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userSkills: {},
      learningLogs: [],
      selectedSkillId: null,
      nodePositions: {},
      setSelectedSkill: (skillId) => set({ selectedSkillId: skillId }),
      updateNodePosition: (skillId, position) =>
        set((state) => ({
          nodePositions: {
            ...state.nodePositions,
            [skillId]: position,
          },
        })),
      setNodePositions: (positions) => set({ nodePositions: positions }),
      updateSkillLevel: (skillId, level) =>
        set((state) => ({
          userSkills: {
            ...state.userSkills,
            [skillId]: {
              skillId,
              level,
              progress: state.userSkills[skillId]?.progress || 0,
              notes: state.userSkills[skillId]?.notes || '',
              learnedAt: level !== 'not_started' ? new Date().toISOString() : undefined,
            },
          },
        })),
      updateSkillProgress: (skillId, progress) =>
        set((state) => ({
          userSkills: {
            ...state.userSkills,
            [skillId]: {
              skillId,
              level: state.userSkills[skillId]?.level || 'not_started',
              progress,
              notes: state.userSkills[skillId]?.notes || '',
            },
          },
        })),
      addLearningLog: (skillId, content) =>
        set((state) => ({
          learningLogs: [
            {
              id: Date.now().toString(),
              skillId,
              content,
              createdAt: new Date().toISOString(),
            },
            ...state.learningLogs,
          ],
        })),
    }),
    {
      name: 'ai-skill-tree-storage',
    }
  )
);
