import { Learner, Profile } from '../entities/learner';

export type LearnerDTO = {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
};

export interface FamilyDTO extends Profile {
    learners: Learner[];
}

export interface Submission {
    id: string;
    learner_id: string;
    lesson_id: string | null;
    title: string;
    file_url: string;
    category: string;
    is_reviewed: boolean;
    created_at: string;
    lessons?: { title: string };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_url: string;
}

export interface LearnerAchievement {
    unlocked_at: string;
    achievements: Achievement;
}

export interface LearnerStats {
    totalProjects: number;
    hoursPracticed: number;
    completedLections: number;
    skills: { name: string; percentage: number; color: string }[];
}
