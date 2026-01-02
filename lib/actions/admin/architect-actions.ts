"use server";

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { type ArchitectState } from '@/lib/domain/architect';
import { revalidatePath } from 'next/cache';
import { ArchitectService } from '@/lib/application/services/admin/architect-service';

export async function compileDiagnosticProbe(state: ArchitectState) {
    console.log("[ArchitectAction] Compiling diagnostic...");
    const supabase = await createClient();

    try {
        const service = new ArchitectService(supabase);
        const result = await service.compileDiagnostic(state);

        revalidatePath('/admin/architect');
        return { success: true, ...result };
    } catch (error: any) {
        console.error("[ArchitectAction] Compilation failed:", error);
        return { success: false, error: error.message || "Error al compilar el diagnóstico" };
    }
}

export async function generatePrototypes(state: ArchitectState) {
    console.log("[ArchitectAction] Generating prototypes...");
    const supabase = await createClient();

    try {
        const service = new ArchitectService(supabase);
        const prototypes = await service.generatePrototypes(state);
        return { success: true, prototypes };
    } catch (error: any) {
        console.error("[ArchitectAction] Prototype generation failed:", error);
        return { success: false, error: error.message || "Error al generar prototipos" };
    }
}
