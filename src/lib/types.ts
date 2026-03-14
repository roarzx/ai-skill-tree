export type SkillLevel = 'not_started' | 'learning' | 'mastered' | 'expert';

export interface Skill {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  category: string;
  parentId: string | null;
  resources: string[];
  children?: Skill[];
}

export interface UserSkill {
  skillId: string;
  level: SkillLevel;
  progress: number;
  notes: string;
  learnedAt?: string;
}

export interface LearningLog {
  id: string;
  skillId: string;
  content: string;
  createdAt: string;
}
