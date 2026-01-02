import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { StudentStats, StudentAchievement } from '../../domain/dtos/learner';
import { createClient } from './supabase-server';

export class SupabaseStatsRepository implements IStatsRepository {
    async getStudentFullStats(studentId: string): Promise<StudentStats> {
        const supabase = await createClient();

        // 1. Total Diagnostics (Submissions)
        const { count: totalDiagnostics } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', studentId);

        return {
            totalProjects: totalDiagnostics || 0,
            hoursPracticed: 0,
            completedLections: 0,
            skills: []
        };
    }

    async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learner_achievements')
            .select(`
                unlocked_at,
                achievements(*)
            `)
            .eq('learner_id', studentId);

        if (error) {
            console.error('Error fetching achievements in repository:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            unlocked_at: item.unlocked_at,
            achievements: Array.isArray(item.achievements) ? item.achievements[0] : item.achievements
        })) as StudentAchievement[];
    }

    async getStudentFrontier(studentId: string): Promise<any[]> {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('get_student_frontier', {
            p_learner_id: studentId
        });

        if (error) {
            console.error('Error fetching student frontier:', error);
            return [];
        }

        return data as any[];
    }

    async getGlobalStats(teacherId?: string): Promise<{
        totalStudents: number;
        totalSubmissions: number;
        totalCourses: number;
    }> {
        const supabase = await createClient();

        let studentsQuery = supabase.from('learners').select('*', { count: 'exact', head: true });
        let submissionsQuery = supabase.from('submissions').select('*', { count: 'exact', head: true });
        let coursesQuery = supabase.from('courses').select('*', { count: 'exact', head: true });

        if (teacherId) {
            studentsQuery = studentsQuery.eq('teacher_id', teacherId);
            // Assuming submissions have learner_id and learners have teacher_id
            // This would require a join or a subquery if submissions don't have teacher_id
            // For now, let's keep it simple or use in()
            const { data: teacherStudents } = await supabase.from('learners').select('id').eq('teacher_id', teacherId);
            const studentIds = teacherStudents?.map(s => s.id) || [];
            submissionsQuery = submissionsQuery.in('learner_id', studentIds);
            coursesQuery = coursesQuery.eq('creator_id', teacherId);
        }

        const [
            { count: totalStudents },
            { count: totalSubmissions },
            { count: totalCourses }
        ] = await Promise.all([
            studentsQuery,
            submissionsQuery,
            coursesQuery
        ]);

        return {
            totalStudents: totalStudents || 0,
            totalSubmissions: totalSubmissions || 0,
            totalCourses: totalCourses || 0
        };
    }
    async getCalibrationData(examId: string): Promise<any[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('exam_attempts')
            .select('learner_id, results_cache')
            .eq('exam_id', examId)
            .eq('status', 'evaluated');

        if (error) {
            console.error('Error fetching calibration data:', error);
            return [];
        }

        return data || [];
    }
}
