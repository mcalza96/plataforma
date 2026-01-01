import { Student, Profile } from '../entities/learner';

export type StudentDTO = {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
};

export interface TeacherTenantDTO extends Profile {
    students: Student[];
}

export interface Submission {
    id: string;
    student_id: string;
    lesson_id: string | null;
    title: string;
    file_url: string;
    category: string;
    is_reviewed: boolean;
    created_at: string;
    student?: StudentDTO;
    lesson?: { title: string };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_url: string;
}

export interface StudentAchievement {
    unlocked_at: string;
    achievements: Achievement;
}

import { StudentProgress } from '../entities/course';
export type { StudentProgress };

export interface StudentStats {
    totalProjects: number;
    hoursPracticed: number;
    completedLections: number;
    skills: { name: string; percentage: number; color: string }[];
}

export interface KnowledgeDelta {
    category: string;
    initial: number;
    current: number;
}

export interface LearningFrontier {
    id: string;
    description: string;
    mastery_score: number;
    recommended_content: string[];
}
export interface StandaloneExamAssignment {
    assignmentId: string;
    examId: string;
    examTitle: string;
    subject: string;
    targetAudience: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    assignedAt: string;
    originContext: 'standalone' | 'manual_intervention';
}
