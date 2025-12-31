'use server';

import { CompetencyNode } from '../../domain/competency';
import { DiagnosticProbe } from '../../domain/assessment';
import { generateProbe } from '../services/assessment';

interface GenerateDiagnosticInput {
    competency: CompetencyNode;
    misconceptions: CompetencyNode[];
}

/**
 * Use Case: Generate a diagnostic probe for a given competency.
 * Orchestrates retrieval of context (done by caller or here) and AI generation.
 */
export async function generateDiagnosticUseCase(input: GenerateDiagnosticInput): Promise<Partial<DiagnosticProbe>> {
    try {
        // 1. Validar que la competencia tenga sentido evaluarla
        if (!input.competency.id) {
            throw new Error('ID de competencia requerido para generar diagnóstico.');
        }

        // 2. Llamar al servicio de generación con IA
        // El prompt ya está configurado para actuar como psicometrista experto
        const probe = await generateProbe(input.competency, input.misconceptions);

        // 3. Devolver para revisión humana (Human-in-the-loop)
        // No guardamos automáticamente en este paso para permitir ajustes del profesor.
        return probe;
    } catch (error: any) {
        console.error('Error in GenerateDiagnosticUseCase:', error);
        throw new Error(`No se pudo generar el diagnóstico: ${error.message}`);
    }
}
