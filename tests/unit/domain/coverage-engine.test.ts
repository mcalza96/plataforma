/**
 * Tests Unitarios para el Coverage Engine
 * 
 * Valida que las reglas de oro se apliquen correctamente
 * y que el motor calcule las tareas pendientes de forma determinista.
 */

import { describe, it, expect } from 'vitest';
import {
    calculateCoverage,
    isDiagnosticComplete,
    getNextTask,
    calculateCoveragePercentage,
} from '../../../lib/domain/diagnosis/coverage-engine';
import {
    registerConcept,
    registerMisconception,
    registerProbe,
    getNextObjective,
} from '../../../lib/domain/diagnosis/session-manager';
import {
    createEmptySession,
    createCompetencyNode,
    createMisconception,
} from '../../../lib/domain/diagnosis/types';

describe('Coverage Engine - Reglas de Oro', () => {
    // ============================================================================
    // ESCENARIO 1: Sesión vacía → Debe pedir conceptos
    // ============================================================================

    it('Escenario 1: Sesión vacía debe solicitar exploración de conceptos', () => {
        const session = createEmptySession('session-1', 'student-1', 'Álgebra Lineal');

        const tasks = calculateCoverage(session);

        // Debe haber exactamente 1 tarea
        expect(tasks).toHaveLength(1);

        // Debe ser de tipo EXPLORE_CONCEPTS
        expect(tasks[0].type).toBe('EXPLORE_CONCEPTS');

        // Debe tener prioridad crítica
        expect(tasks[0].priority).toBe('critical');

        // El diagnóstico NO está completo
        expect(isDiagnosticComplete(session)).toBe(false);

        // La cobertura debe ser 0%
        expect(calculateCoveragePercentage(session)).toBe(0);
    });

    // ============================================================================
    // ESCENARIO 2: Se agrega un Misconception → Debe generar trampa
    // ============================================================================

    it('Escenario 2: Agregar misconception debe solicitar reactivo CBM', () => {
        // Crear sesión con conceptos suficientes
        let session = createEmptySession('session-2', 'student-2', 'Cálculo I');

        // Agregar conceptos (mínimo 3 para pasar la regla de exploración)
        const concept1 = createCompetencyNode('c1', 'Límites', 'Concepto de límite');
        const concept2 = createCompetencyNode('c2', 'Derivadas', 'Concepto de derivada', ['c1']);
        const concept3 = createCompetencyNode('c3', 'Integrales', 'Concepto de integral', ['c2']);

        session = registerConcept(session, concept1);
        session = registerConcept(session, concept2);
        session = registerConcept(session, concept3);

        // Agregar un misconception
        const error = createMisconception(
            'err-1',
            'Confunde límite con valor',
            'El estudiante cree que el límite es igual al valor de la función',
            'c1',
            'high'
        );

        session = registerMisconception(session, error);

        const tasks = calculateCoverage(session);

        // Debe haber tareas pendientes
        expect(tasks.length).toBeGreaterThan(0);

        // Debe haber una tarea de GENERATE_TRAP para el error
        const trapTask = tasks.find(
            (t) => t.type === 'GENERATE_TRAP' && t.targetId === 'err-1'
        );
        expect(trapTask).toBeDefined();

        // Debe tener prioridad crítica (porque no está validado)
        expect(trapTask?.priority).toBe('critical');

        // También debe haber tareas de GENERATE_MASTERY para los conceptos
        const masteryTasks = tasks.filter((t) => t.type === 'GENERATE_MASTERY');
        expect(masteryTasks).toHaveLength(3);
    });

    // ============================================================================
    // ESCENARIO 3: Se registra un Probe → La lista de tareas debe reducirse
    // ============================================================================

    it('Escenario 3: Registrar probe debe eliminar la tarea correspondiente', () => {
        // Crear sesión con conceptos
        let session = createEmptySession('session-3', 'student-3', 'Física I');

        const concept1 = createCompetencyNode('c1', 'Cinemática');
        const concept2 = createCompetencyNode('c2', 'Dinámica');
        const concept3 = createCompetencyNode('c3', 'Energía');

        session = registerConcept(session, concept1);
        session = registerConcept(session, concept2);
        session = registerConcept(session, concept3);

        // Calcular tareas antes de registrar probe
        const tasksBefore = calculateCoverage(session);
        const masteryTasksBefore = tasksBefore.filter((t) => t.type === 'GENERATE_MASTERY');
        expect(masteryTasksBefore).toHaveLength(3);

        // Registrar un probe de maestría para c1
        session = registerProbe(session, {
            targetId: 'c1',
            targetType: 'concept',
            probeId: 'probe-1',
            probeType: 'MASTERY',
            administered: false,
        });

        // Calcular tareas después de registrar probe
        const tasksAfter = calculateCoverage(session);
        const masteryTasksAfter = tasksAfter.filter((t) => t.type === 'GENERATE_MASTERY');

        // Debe haber una tarea menos
        expect(masteryTasksAfter).toHaveLength(2);

        // No debe haber tarea para c1
        const c1Task = tasksAfter.find(
            (t) => t.type === 'GENERATE_MASTERY' && t.targetId === 'c1'
        );
        expect(c1Task).toBeUndefined();
    });

    // ============================================================================
    // ESCENARIO 4: Diagnóstico completo → Sin tareas pendientes
    // ============================================================================

    it('Escenario 4: Diagnóstico completo debe devolver lista vacía', () => {
        // Crear sesión con conceptos
        let session = createEmptySession('session-4', 'student-4', 'Química');

        const concept1 = createCompetencyNode('c1', 'Átomos');
        const concept2 = createCompetencyNode('c2', 'Moléculas');
        const concept3 = createCompetencyNode('c3', 'Reacciones');

        session = registerConcept(session, concept1);
        session = registerConcept(session, concept2);
        session = registerConcept(session, concept3);

        // Registrar probes de maestría para todos los conceptos
        session = registerProbe(session, {
            targetId: 'c1',
            targetType: 'concept',
            probeId: 'probe-1',
            probeType: 'MASTERY',
            administered: true,
        });

        session = registerProbe(session, {
            targetId: 'c2',
            targetType: 'concept',
            probeId: 'probe-2',
            probeType: 'MASTERY',
            administered: true,
        });

        session = registerProbe(session, {
            targetId: 'c3',
            targetType: 'concept',
            probeId: 'probe-3',
            probeType: 'MASTERY',
            administered: true,
        });

        const tasks = calculateCoverage(session);

        // No debe haber tareas pendientes
        expect(tasks).toHaveLength(0);

        // El diagnóstico está completo
        expect(isDiagnosticComplete(session)).toBe(true);

        // La cobertura debe ser 100%
        expect(calculateCoveragePercentage(session)).toBe(100);
    });

    // ============================================================================
    // ESCENARIO 5: Regla de Profundidad → Conceptos con muchas dependencias
    // ============================================================================

    it('Escenario 5: Concepto con >3 dependencias debe solicitar RANKING', () => {
        let session = createEmptySession('session-5', 'student-5', 'Programación');

        // Crear cadena de dependencias
        const c1 = createCompetencyNode('c1', 'Variables');
        const c2 = createCompetencyNode('c2', 'Condicionales', undefined, ['c1']);
        const c3 = createCompetencyNode('c3', 'Bucles', undefined, ['c1']);
        const c4 = createCompetencyNode('c4', 'Funciones', undefined, ['c1', 'c2']);
        const c5 = createCompetencyNode('c5', 'POO', undefined, ['c1', 'c2', 'c3', 'c4']);

        session = registerConcept(session, c1);
        session = registerConcept(session, c2);
        session = registerConcept(session, c3);
        session = registerConcept(session, c4);
        session = registerConcept(session, c5);

        const tasks = calculateCoverage(session);

        // Debe haber una tarea de GENERATE_RANKING para c5
        const rankingTask = tasks.find(
            (t) => t.type === 'GENERATE_RANKING' && t.targetId === 'c5'
        );
        expect(rankingTask).toBeDefined();
        expect(rankingTask?.priority).toBe('low');
    });

    // ============================================================================
    // ESCENARIO 6: Priorización correcta de tareas
    // ============================================================================

    it('Escenario 6: Las tareas deben estar ordenadas por prioridad', () => {
        let session = createEmptySession('session-6', 'student-6', 'Matemáticas');

        // Agregar conceptos
        const c1 = createCompetencyNode('c1', 'Suma');
        const c2 = createCompetencyNode('c2', 'Resta');
        const c3 = createCompetencyNode('c3', 'Multiplicación', undefined, ['c1', 'c2']);
        const c4 = createCompetencyNode('c4', 'División', undefined, ['c1', 'c2', 'c3']);

        session = registerConcept(session, c1);
        session = registerConcept(session, c2);
        session = registerConcept(session, c3);
        session = registerConcept(session, c4);

        // Agregar misconception
        const error = createMisconception(
            'err-1',
            'Error en división',
            'Confunde dividendo con divisor',
            'c4',
            'critical'
        );
        session = registerMisconception(session, error);

        const tasks = calculateCoverage(session);

        // La primera tarea debe ser la de mayor prioridad (GENERATE_TRAP)
        expect(tasks[0].type).toBe('GENERATE_TRAP');
        expect(tasks[0].priority).toBe('critical');

        // Las tareas de maestría deben venir después
        const masteryTaskIndex = tasks.findIndex((t) => t.type === 'GENERATE_MASTERY');
        expect(masteryTaskIndex).toBeGreaterThan(0);
    });
});

describe('Session Manager - API del Agente', () => {
    // ============================================================================
    // Test de validación de dependencias
    // ============================================================================

    it('Debe rechazar conceptos con dependencias inexistentes', () => {
        let session = createEmptySession('session-7', 'student-7', 'Test');

        const conceptWithInvalidDep = createCompetencyNode(
            'c1',
            'Concepto',
            undefined,
            ['dep-inexistente']
        );

        expect(() => {
            registerConcept(session, conceptWithInvalidDep);
        }).toThrow('La dependencia "dep-inexistente" no existe');
    });

    // ============================================================================
    // Test de getNextObjective
    // ============================================================================

    it('getNextObjective debe devolver instrucciones claras', () => {
        let session = createEmptySession('session-8', 'student-8', 'Biología');

        // Sesión vacía → Debe pedir exploración
        let objective = getNextObjective(session);
        expect(objective).toContain('Exploración');
        expect(objective).toContain('Biología');

        // Agregar conceptos
        const c1 = createCompetencyNode('c1', 'Células');
        const c2 = createCompetencyNode('c2', 'Tejidos');
        const c3 = createCompetencyNode('c3', 'Órganos');

        session = registerConcept(session, c1);
        session = registerConcept(session, c2);
        session = registerConcept(session, c3);

        // Ahora debe pedir reactivos de maestría
        objective = getNextObjective(session);
        expect(objective).toContain('Maestría');

        // Agregar misconception
        const error = createMisconception(
            'err-1',
            'Error en células',
            'Confunde procariotas con eucariotas',
            'c1',
            'high'
        );
        session = registerMisconception(session, error);

        // Ahora debe pedir trampa (prioridad más alta)
        objective = getNextObjective(session);
        expect(objective).toContain('Trampa');
        expect(objective).toContain('CBM');
    });

    // ============================================================================
    // Test de duplicados
    // ============================================================================

    it('Debe rechazar conceptos duplicados', () => {
        let session = createEmptySession('session-9', 'student-9', 'Test');

        const concept = createCompetencyNode('c1', 'Concepto');

        session = registerConcept(session, concept);

        expect(() => {
            registerConcept(session, concept);
        }).toThrow('ya existe en el mapa');
    });

    it('Debe rechazar probes duplicados', () => {
        let session = createEmptySession('session-10', 'student-10', 'Test');

        const concept = createCompetencyNode('c1', 'Concepto');
        session = registerConcept(session, concept);

        const probe = {
            targetId: 'c1',
            targetType: 'concept' as const,
            probeId: 'probe-1',
            probeType: 'MASTERY' as const,
            administered: false,
        };

        session = registerProbe(session, probe);

        expect(() => {
            registerProbe(session, probe);
        }).toThrow('Ya existe un probe');
    });
});
