import { redirect } from 'next/navigation';
import { getStudentLatestDiagnostic } from '@/lib/actions/teacher/student-diagnostic-actions';
import { getStudentById } from '@/lib/data/learner';
import TacticalStudentBridge from '@/components/teacher/TacticalStudentBridge';

interface TriagePageProps {
    params: {
        id: string;
    };
}

/**
 * Student Detail Page - Cognitive Digital Twin View
 * 
 * This is a Server Component that fetches the latest diagnostic result
 * and renders the TacticalStudentBridge orchestrator.
 */
export default async function TriagePage({ params }: TriagePageProps) {
    const studentId = params.id;

    // Fetch student profile and latest diagnostic in parallel
    const [student, diagnostic] = await Promise.all([
        getStudentById(studentId),
        getStudentLatestDiagnostic(studentId)
    ]);

    if (!student) {
        return redirect('/admin/users');
    }

    if (!diagnostic) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-gray-600">psychology_off</span>
                    <h2 className="text-xl font-bold text-white">
                        No hay datos de diagnóstico disponibles
                    </h2>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">
                        Este estudiante no ha completado ninguna evaluación todavía.
                        El Gemelo Digital Cognitivo se activará tras la primera sesión de diagnóstico.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <TacticalStudentBridge
                student={{
                    id: student.id,
                    display_name: student.display_name,
                    level: student.level || 1,
                    avatar_url: student.avatar_url
                }}
                onClose={() => { }}
            />
        </div>
    );
}
