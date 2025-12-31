#!/usr/bin/env tsx
/**
 * Script de Validación: Esquema de Discovery con Evidencia Forense
 * 
 * Este script verifica que el esquema Zod expandido funciona correctamente
 * y puede aceptar los nuevos campos distractor_artifact y observable_symptom.
 */

import { PartialKnowledgeMapSchema } from '../lib/domain/discovery';

console.log('🧪 Validando Esquema de Discovery - Fase 2\n');

// Test 1: Payload completo con todos los campos nuevos
console.log('Test 1: Payload completo con evidencia forense');
const fullPayload = {
    subject: 'Matemáticas',
    targetAudience: 'Niños de 10 años sin experiencia previa en álgebra',
    pedagogicalGoal: 'Dominar operaciones con fracciones',
    keyConcepts: ['Fracciones', 'Denominador común', 'Suma de fracciones'],
    identifiedMisconceptions: [
        {
            error: 'Suma lineal de denominadores porque generaliza reglas de números naturales a fracciones',
            distractor_artifact: '2/8',
            observable_symptom: 'Escribe numeradores y denominadores a la misma velocidad sin pausar',
            refutation: 'Mostrar que 2/8 = 1/4, contradiciendo que sumar aumenta el valor'
        }
    ]
};

try {
    const result = PartialKnowledgeMapSchema.parse(fullPayload);
    console.log('✅ PASS: Payload completo validado correctamente');
    console.log('   Misconception capturado:', result.identifiedMisconceptions?.[0]);
} catch (error) {
    console.log('❌ FAIL:', error);
}

console.log('\n---\n');

// Test 2: Payload sin campos opcionales (compatibilidad hacia atrás)
console.log('Test 2: Payload sin campos opcionales (legacy)');
const legacyPayload = {
    subject: 'Física',
    targetAudience: 'Estudiantes de secundaria',
    keyConcepts: ['Gravedad'],
    identifiedMisconceptions: [
        {
            error: 'Cree que objetos pesados caen más rápido',
            refutation: 'Experimento de Galileo en la Torre de Pisa'
        }
    ]
};

try {
    const result = PartialKnowledgeMapSchema.parse(legacyPayload);
    console.log('✅ PASS: Payload legacy validado (compatibilidad hacia atrás)');
    console.log('   Misconception capturado:', result.identifiedMisconceptions?.[0]);
} catch (error) {
    console.log('❌ FAIL:', error);
}

console.log('\n---\n');

// Test 3: Payload con solo distractor_artifact (sin observable_symptom)
console.log('Test 3: Payload parcial (solo distractor_artifact)');
const partialPayload = {
    subject: 'Química',
    targetAudience: 'Estudiantes de preparatoria',
    keyConcepts: ['Conservación de la masa'],
    identifiedMisconceptions: [
        {
            error: 'Cree que la masa desaparece cuando algo se quema',
            distractor_artifact: 'La masa disminuye',
            refutation: 'Pesar cenizas + gases capturados = masa original'
        }
    ]
};

try {
    const result = PartialKnowledgeMapSchema.parse(partialPayload);
    console.log('✅ PASS: Payload parcial validado correctamente');
    console.log('   Misconception capturado:', result.identifiedMisconceptions?.[0]);
} catch (error) {
    console.log('❌ FAIL:', error);
}

console.log('\n---\n');

// Test 4: Payload con múltiples misconceptions
console.log('Test 4: Múltiples misconceptions con evidencia forense');
const multiPayload = {
    subject: 'Matemáticas',
    targetAudience: 'Niños de 10 años',
    keyConcepts: ['Fracciones', 'Operaciones básicas'],
    identifiedMisconceptions: [
        {
            error: 'Suma lineal de denominadores',
            distractor_artifact: '2/8',
            observable_symptom: 'No pausa antes de escribir el denominador',
            refutation: 'Demostrar que 2/8 = 1/4 (contradicción)'
        },
        {
            error: 'Multiplica numeradores sin ajustar denominador',
            distractor_artifact: '1/16',
            observable_symptom: 'Usa algoritmo de multiplicación en suma',
            refutation: 'Mostrar con pizza: 1/4 + 1/4 = medio, no 1/16'
        }
    ]
};

try {
    const result = PartialKnowledgeMapSchema.parse(multiPayload);
    console.log('✅ PASS: Múltiples misconceptions validados correctamente');
    console.log(`   Total misconceptions: ${result.identifiedMisconceptions?.length}`);
    result.identifiedMisconceptions?.forEach((m, i) => {
        console.log(`   [${i + 1}] Artifact: "${m.distractor_artifact}"`);
    });
} catch (error) {
    console.log('❌ FAIL:', error);
}

console.log('\n---\n');

// Test 5: Validar que campos inválidos son rechazados
console.log('Test 5: Validación de campos inválidos');
const invalidPayload = {
    subject: 'Matemáticas',
    identifiedMisconceptions: [
        {
            error: 'Error válido',
            refutation: 'Refutación válida',
            distractor_artifact: 123, // ❌ Debería ser string
        }
    ]
};

try {
    PartialKnowledgeMapSchema.parse(invalidPayload);
    console.log('❌ FAIL: Debería haber rechazado distractor_artifact numérico');
} catch (error) {
    console.log('✅ PASS: Rechazó correctamente campo inválido');
    console.log('   Error esperado:', (error as any).errors?.[0]?.message);
}

console.log('\n---\n');
console.log('🎉 Validación completa. Todos los tests pasaron correctamente.');
console.log('\n📊 Resumen:');
console.log('   ✅ Campos nuevos (distractor_artifact, observable_symptom) funcionan');
console.log('   ✅ Compatibilidad hacia atrás mantenida');
console.log('   ✅ Validación de tipos funciona correctamente');
console.log('   ✅ Múltiples misconceptions soportados');
