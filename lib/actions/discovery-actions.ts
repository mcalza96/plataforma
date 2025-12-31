"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";

/**
 * Carga el contexto actual del draft exam desde Supabase
 * Si no existe, crea uno nuevo
 * Esto es la "Única Fuente de Verdad" para el estado del Blueprint
 */
export async function loadDraftExam(examId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized", context: null };
    }

    // Intentar recuperar el exam draft existente
    const { data, error } = await supabase
        .from("exams")
        .select("config_json")
        .eq("creator_id", user.id)
        .eq("status", "DRAFT")
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

    if (error) {
        console.error("Failed to load draft exam:", error);
        return { success: false, error: error.message, context: null };
    }

    // Si no existe, crear uno nuevo
    if (!data) {
        console.log("[loadDraftExam] No draft found, creating new one...");
        const { data: newExam, error: createError } = await supabase
            .from("exams")
            .insert({
                creator_id: user.id,
                status: "DRAFT",
                title: "Nuevo Examen de Diagnóstico",
                config_json: {}
            })
            .select("config_json")
            .single();

        if (createError) {
            console.error("Failed to create draft exam:", createError);
            return { success: false, error: createError.message, context: null };
        }

        return { success: true, context: newExam?.config_json || {} };
    }

    return { success: true, context: data?.config_json || {} };
}

export async function saveDiscoveryContext(examId: string, context: any) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Update the exam draft with the latest discovery context
    // We'll store it in config_json or a dedicated discovery_context column
    const { error } = await supabase
        .from("exams")
        .update({
            config_json: context,
            updated_at: new Date().toISOString()
        })
        .eq("creator_id", user.id)
        .eq("status", "DRAFT"); // Only update if it's still a draft

    if (error) {
        console.error("Failed to save discovery context:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
