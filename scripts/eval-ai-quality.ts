import { z } from 'zod';
import { CompetencyNode } from '../lib/domain/competency';
import { generateProbe } from '../lib/application/services/assessment';

const GoldenSet = [
    {
        competency: new CompetencyNode(
            'comp-001',
            'Concepto de Masa vs Peso',
            'Diferenciar entre la cantidad de materia y la fuerza gravitatoria.',
            'competency',
            {}
        ),
        misconceptions: [
            new CompetencyNode(
                'error-001',
                'Masa y peso son lo mismo',
                'El alumno cree que ambos términos son intercambiables.',
                'misconception',
                {
                    errorLogic: 'Uso coloquial de "pesarse" para medir masa.',
                    refutationStrategy: 'Mostrar objetos iguales en la Tierra vs Luna.'
                }
            )
        ]
    },
    {
        competency: new CompetencyNode(
            'comp-002',
            'Suma de Fracciones',
            'Realizar adiciones de fracciones con distinto denominador.',
            'competency',
            {}
        ),
        misconceptions: [
            new CompetencyNode(
                'error-002',
                'Sumar numeradores y denominadores directamente',
                'El alumno suma linealmente (a/b + c/d = (a+c)/(b+d)).',
                'misconception',
                {
                    errorLogic: 'Aplicación incorrecta de la lógica de adición de naturales.',
                    refutationStrategy: 'Usar representaciones visuales (pizzas/tortas).'
                }
            )
        ]
    }
];

const ProbeValidationSchema = z.object({
    type: z.enum(['multiple_choice_rationale', 'phenomenological_checklist']),
    stem: z.string().min(10),
    options: z.array(z.object({
        content: z.string().min(1),
        isCorrect: z.boolean(),
        feedback: z.string().optional(),
        diagnosesMisconceptionId: z.string().nullable().optional()
    })).min(2),
});

async function runEvaluation() {
    console.log('🚀 Iniciando Evaluación de Calidad de IA (Golden Set)...\n');

    for (const item of GoldenSet) {
        console.log(`Evaluando Competencia: ${item.competency.title}`);

        try {
            const result = await generateProbe(item.competency, item.misconceptions);

            // Validar con Zod
            const validated = ProbeValidationSchema.parse(result);

            console.log('✅ Estructura válida.');
            console.log(`   Pregunta: ${validated.stem.substring(0, 50)}...`);

            const hasDistractor = validated.options.some(o => o.diagnosesMisconceptionId === item.misconceptions[0].id);
            if (hasDistractor) {
                console.log('✅ Distractor crítico detectado y vinculado correctamente.');
            } else {
                console.warn('⚠️ No se detectó el vínculo al distractor crítico esperado.');
            }

        } catch (error: any) {
            console.error(`❌ Error evaluando ${item.competency.title}:`, error.message);
            if (error instanceof z.ZodError) {
                console.error(JSON.stringify(error.flatten(), null, 2));
            }
        }
        console.log('--------------------------------------------------\n');
    }
}

runEvaluation().catch(console.error);
