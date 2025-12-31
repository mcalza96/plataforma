import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { notFound, redirect } from "next/navigation";
import { ExamShell } from "@/components/assessment/shell/ExamShell";
import { Question } from "@/lib/domain/assessment";

interface AssessmentPageProps {
    params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Exam Configuration
    const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();

    if (examError || !exam) {
        notFound();
    }

    if (exam.status !== 'PUBLISHED') {
        // Only creator can see draft
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id !== exam.creator_id) {
            return redirect('/404'); // Or a "Not Published" specialized page
        }
    }

    // 2. Identify/Create Attempt
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    let { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_config_id", id)
        .eq("learner_id", user.id)
        .eq("status", "IN_PROGRESS")
        .single();

    if (!attempt) {
        const { data: newAttempt, error: createError } = await supabase
            .from("exam_attempts")
            .insert({
                exam_config_id: id,
                learner_id: user.id,
                status: "IN_PROGRESS",
                current_state: {}
            })
            .select()
            .single();

        if (createError) throw new Error("Failed to create exam attempt");
        attempt = newAttempt;
    }

    const questions = (exam.questions || []) as Question[];

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
