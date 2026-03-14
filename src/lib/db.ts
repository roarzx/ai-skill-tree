import Dexie, { Table } from 'dexie';

export interface SkillTree {
  id?: number;
  name: string;
  description: string;
  skills: string; // JSON string of skills data
  createdAt: string;
  updatedAt: string;
}

export interface UserSkillRecord {
  id?: number;
  treeId: number;
  skillId: string;
  level: 'not_started' | 'learning' | 'mastered' | 'expert';
  progress: number;
  notes: string;
  learnedAt?: string;
}

export interface LearningLogRecord {
  id?: number;
  treeId: number;
  skillId: string;
  content: string;
  createdAt: string;
}

class SkillTreeDatabase extends Dexie {
  skillTrees!: Table<SkillTree>;
  userSkills!: Table<UserSkillRecord>;
  learningLogs!: Table<LearningLogRecord>;

  constructor() {
    super('ai-skill-tree-db');
    this.version(1).stores({
      skillTrees: '++id, name, createdAt',
      userSkills: '++id, treeId, skillId, level',
      learningLogs: '++id, treeId, skillId, createdAt',
    });
  }
}

export const db = new SkillTreeDatabase();

// Helper functions
export async function createSkillTree(name: string, description: string, skillsJson: string): Promise<number> {
  const now = new Date().toISOString();
  return await db.skillTrees.add({
    name,
    description,
    skills: skillsJson,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getAllSkillTrees(): Promise<SkillTree[]> {
  return await db.skillTrees.orderBy('createdAt').reverse().toArray();
}

export async function getSkillTree(id: number): Promise<SkillTree | undefined> {
  return await db.skillTrees.get(id);
}

export async function updateSkillTree(id: number, updates: Partial<SkillTree>): Promise<void> {
  await db.skillTrees.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSkillTree(id: number): Promise<void> {
  await db.transaction('rw', [db.skillTrees, db.userSkills, db.learningLogs], async () => {
    await db.skillTrees.delete(id);
    await db.userSkills.where('treeId').equals(id).delete();
    await db.learningLogs.where('treeId').equals(id).delete();
  });
}

export async function saveUserSkill(
  treeId: number,
  skillId: string,
  level: 'not_started' | 'learning' | 'mastered' | 'expert',
  progress: number,
  notes: string
): Promise<void> {
  const existing = await db.userSkills
    .where({ treeId, skillId })
    .first();
  
  if (existing) {
    await db.userSkills.update(existing.id!, {
      level,
      progress,
      notes,
      learnedAt: level !== 'not_started' ? new Date().toISOString() : undefined,
    });
  } else {
    await db.userSkills.add({
      treeId,
      skillId,
      level,
      progress,
      notes,
      learnedAt: level !== 'not_started' ? new Date().toISOString() : undefined,
    });
  }
}

export async function getUserSkills(treeId: number): Promise<UserSkillRecord[]> {
  return await db.userSkills.where('treeId').equals(treeId).toArray();
}

export async function addLearningLog(
  treeId: number,
  skillId: string,
  content: string
): Promise<number> {
  return await db.learningLogs.add({
    treeId,
    skillId,
    content,
    createdAt: new Date().toISOString(),
  });
}

export async function getLearningLogs(treeId: number): Promise<LearningLogRecord[]> {
  return await db.learningLogs
    .where('treeId')
    .equals(treeId)
    .reverse()
    .sortBy('createdAt');
}

// Export all data
export async function exportAllData(): Promise<string> {
  const trees = await getAllSkillTrees();
  const allUserSkills = await db.userSkills.toArray();
  const allLogs = await db.learningLogs.toArray();
  
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    skillTrees: trees,
    userSkills: allUserSkills,
    learningLogs: allLogs,
  }, null, 2);
}

// Import data
export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  
  await db.transaction('rw', [db.skillTrees, db.userSkills, db.learningLogs], async () => {
    // Clear existing data
    await db.skillTrees.clear();
    await db.userSkills.clear();
    await db.learningLogs.clear();
    
    // Import new data
    if (data.skillTrees) {
      await db.skillTrees.bulkAdd(data.skillTrees);
    }
    if (data.userSkills) {
      await db.userSkills.bulkAdd(data.userSkills);
    }
    if (data.learningLogs) {
      await db.learningLogs.bulkAdd(data.learningLogs);
    }
  });
}
