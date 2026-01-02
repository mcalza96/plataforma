"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function publishExam(
    config: { title: string; matrix: any; questions?: any[] },
    assignmentConfig: { mode: 'auto_all' | 'segment'; segmentId?: string } = { mode: 'auto_all' }
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Readiness Validation (The Bridge Guard)
    const { calculateReadiness } = await import("@/lib/domain/architect");

    // Ensure matrix has the shape of PartialKnowledgeMap
    const readiness = calculateReadiness(config.matrix);

    if (!readiness.isValid) {
        return {
            success: false,
            error: `Diagnostic Readiness Check Failed: ${!readiness.hasTargetAudience ? "Missing Target Audience. " : ""
                }${readiness.conceptCount < 3 ? "Insufficient Concepts (Min 3). " : ""
                }${readiness.misconceptionCount < 1 ? "Insufficient Misconceptions (Min 1). " : ""
                }`
        };
    }

    // 2. Snapshotting & Item Generation
    let finalQuestions: any[] = [];

    if (config.questions && config.questions.length > 0) {
        // Transform Prototypes to Questions
        finalQuestions = config.questions.map((proto: any) => ({
            id: proto.id || crypto.randomUUID(),
            type: 'CBM', // Enforce CBM type for diagnostics
            stem: proto.stem,
            options: (proto.options || []).map((opt: any, idx: number) => ({
                id: opt.id || `opt-${idx}-${crypto.randomUUID().split('-')[0]}`,
                text: opt.content || opt.text || "Opción sin texto",
                isCorrect: opt.isCorrect,
                isGap: opt.isGap || false,
                rationale: opt.rationale || opt.feedback
            })),
            pedagogicalReasoning: proto.pedagogicalReasoning,
            competencyId: proto.competencyId
        }));
    } else {
        // FALLBACK: Generate Placeholder Questions from Key Concepts
        const keyConcepts = config.matrix?.keyConcepts || [];

        finalQuestions = keyConcepts.map((c: any) => {
            const conceptName = typeof c === 'string' ? c : (c.name || c.title || 'Concepto Indefinido');
            return {
                id: crypto.randomUUID(),
                type: 'CBM',
                stem: `Diagnóstico sobre: ${conceptName}`,
                options: [
                    { id: 'opt-a', text: 'Opción Correcta (Placeholder)', isCorrect: true },
                    { id: 'opt-b', text: 'Distractor Común (Placeholder)', isCorrect: false },
                    { id: 'opt-c', text: 'No lo sé / No estoy seguro', isCorrect: false, isGap: true }
                ],
                competencyId: typeof c === 'object' ? c.id : undefined
            };
        });
    }

    if (finalQuestions.length === 0) {
        finalQuestions.push({
            id: crypto.randomUUID(),
            type: 'CBM',
            stem: `Evaluación de ${config.title}`,
            options: [
                { id: 'opt-1', text: 'Sí, entiendo', isCorrect: true },
                { id: 'opt-2', text: 'No estoy seguro', isCorrect: false, isGap: true }
            ]
        });
    }

    // 3. Immutable Insert (Standalone Aggregate Root)
    const { data, error } = await supabase
        .from("exams")
        .insert({
            title: config.title,
            creator_id: user.id,
            config_json: config.matrix,
            questions: finalQuestions,
            status: "PUBLISHED",
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to publish exam:", error);
        return { success: false, error: error.message };
    }

    // 4. Atomic Assignment Logic (Tenant Isolated)
    try {
        if (assignmentConfig.mode === 'auto_all') {
            const { getStudentRepository } = await import("@/lib/infrastructure/di");
            const studentRepo = getStudentRepository();
            const students = await studentRepo.getStudentsByTeacherId(user.id);

            if (students.length > 0) {
                const assignments = students.map(student => ({
                    exam_id: data.id,
                    student_id: student.id,
                    status: 'ASSIGNED',
                    assigned_at: new Date().toISOString(),
                    origin_context: 'standalone'
                }));

                const { error: assignError } = await supabase
                    .from("exam_assignments")
                    .insert(assignments);

                if (assignError) {
                    console.error("CRITICAL: Failed to auto-assign exam:", assignError);
                }
            }
        }
    } catch (repoError) {
        console.error("Error during assignment phase:", repoError);
    }

    revalidatePath('/admin/exams');

    return {
        success: true,
        examId: data.id,
        url: `/assessment/${data.id}`
    };
}
