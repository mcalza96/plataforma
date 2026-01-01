import { getAssessment } from "@/lib/actions/student/assessment-actions";
import { notFound, redirect } from "next/navigation";
import { ExamShell } from "@/components/assessment/shell/ExamShell";
import { Question } from "@/lib/domain/assessment";
import { cookies } from "next/headers";

interface AssessmentPageProps {
    params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        redirect('/select-profile');
    }

    // 1. Fetch Exam Configuration via Server Action (includes Assignment Validation)
    const exam = await getAssessment(id);

    if (!exam) {
        notFound();
    }

    // 2. Identify/Create Attempt
    const { createServiceRoleClient } = await import("@/lib/infrastructure/supabase/supabase-server");
    const serviceSupabase = await createServiceRoleClient();

    let { data: attempt, error: attemptError } = await serviceSupabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_config_id", id)
        .eq("learner_id", studentId)
        .eq("status", "IN_PROGRESS")
        .single();

    if (!attempt) {
        // Time Identity Injection: Ensure questions have time metadata (Retrocompatibility)
        // If question lacks metadata, we calculate it dynamically using the Domain logic.
        const { calculateMinViableTime } = await import("@/lib/domain/assessment");

        const enhancedQuestions = (exam.questions || []).map((q: any) => ({
            ...q,
            expected_time_seconds: q.expected_time_seconds || 60, // Default 60s
            min_viable_time: q.min_viable_time || calculateMinViableTime(q.stem || ""),
            difficulty_tier: q.difficulty_tier || 'medium' // Default to medium
        }));

        const { data: newAttempt, error: createError } = await serviceSupabase
            .from("exam_attempts")
            .insert({
                exam_config_id: id,
                learner_id: studentId,
                status: "IN_PROGRESS",
                current_state: {},
                config_snapshot: {
                    matrix: exam.config_json,
                    questions: enhancedQuestions
                }
            })
            .select()
            .single();

        if (createError) {
            console.error("Failed to create exam attempt:", createError);
            throw new Error("Failed to create exam attempt");
        }
        attempt = newAttempt;
    }

    // 3. Load & Sanitize Questions (Remove correct answers/feedback from client payload)
    const rawQuestions = (attempt.config_snapshot?.questions || exam.questions || []) as any[];
    const questions: Question[] = rawQuestions.map(q => ({
        ...q,
        options: q.options?.map((o: any) => ({
            id: o.id,
            text: o.text || o.content // Handle both naming conventions
        }))
    }));

    if (questions.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-white p-8">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-xl font-black">Blueprint sin Reactivos</p>
                    <p className="text-sm text-zinc-500">Este examen tiene definida su topología pedagógica pero aún no tiene reactivos generados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0A0A0A]">
            <ExamShell
                questions={questions}
                attemptId={attempt!.id}
                examId={id}
            />
        </div>
    );
}
