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

    // 1. Session Validation Shield
    if (!studentId) {
        redirect('/select-profile');
    }

    // 2. Fetch Exam Configuration via Server Action 
    // This implicitly checks RLS via getAssessment -> exam_assignments check
    const exam = await getAssessment(id);

    if (!exam) {
        notFound();
    }

    // 3. Identify/Create Attempt (Securely using Service Role for Snapshot Access)
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
        // Time Identity Injection & Readiness Double-Check
        const { calculateMinViableTime } = await import("@/lib/domain/assessment");

        const enhancedQuestions = (exam.questions || []).map((q: any) => ({
            ...q,
            expected_time_seconds: q.expected_time_seconds || 60,
            min_viable_time: q.min_viable_time || calculateMinViableTime(q.stem || ""),
            difficulty_tier: q.difficulty_tier || 'medium'
        }));

        const { data: newAttempt, error: createError } = await serviceSupabase
            .from("exam_attempts")
            .insert({
                exam_config_id: id,
                learner_id: studentId,
                status: "IN_PROGRESS",
                current_state: {},
                config_snapshot: {
                    matrix: exam.config_json, // Immutable snapshot of topology
                    questions: enhancedQuestions // Immutable snapshot of items
                }
            })
            .select()
            .single();

        if (createError) {
            console.error("[Assessment] Failed to create exam attempt snapshot:", createError);
            throw new Error("Failed to initialize diagnostic session.");
        }
        attempt = newAttempt;
    }

    // 4. Payload Sanitization (The Firewall)
    // We strictly filter what goes to the client. NO isCorrect, NO internal metadata.
    const rawQuestions = (attempt.config_snapshot?.questions || exam.questions || []) as any[];

    // Explicit mapping to secured Question type
    const questions: Question[] = rawQuestions.map(q => ({
        id: q.id,
        type: q.type, // Ensure type is passed
        stem: q.stem,
        text: q.text, // Some legacy might use text
        interactiveSegments: q.interactiveSegments, // For Spotting
        items: q.items, // For Ranking
        competencyId: q.competencyId, // Needed for frontend grouping if any? Maybe dangerous? 
        // Actually usually okay, but let's keep it minimal if possible. 
        // The prompt says "Same logic as current but sanitized".
        // We KEEP competencyId for UI context if needed, but definitely NOT isCorrect.
        options: q.options?.map((o: any) => ({
            id: o.id,
            text: o.text || o.content,
            isGap: !!o.isGap // We explicitly PRESERVE isGap as it is a UI state (confianza)
            // isCorrect is STRIPPED
            // trapId / misconceptionId is STRIPPED
        }))
    }));

    if (questions.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-white p-8">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-xl font-black">Sonda de Diagnóstico Vacía</p>
                    <p className="text-sm text-zinc-500">
                        La topología de este examen ha sido cargada, pero no se han generado reactivos válidos.
                        Contacte a su administrador.
                    </p>
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
