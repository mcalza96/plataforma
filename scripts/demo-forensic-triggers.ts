#!/usr/bin/env tsx
/**
 * Script de Demostración: Comportamiento del Agente con Forensic Triggers
 * 
 * Este script simula el flujo conversacional para demostrar cómo el agente
 * ahora detecta errores al vuelo y genera checklists fenomenológicos.
 */

console.log('🎭 Demostración: Forensic Triggers y Observable Checklists\n');
console.log('='.repeat(80));

// Escenario 1: Detección de Error Durante Concept Extraction
console.log('\n📍 ESCENARIO 1: Forensic Trigger en Concept Extraction\n');

console.log('❌ ANTES (Comportamiento Pasivo):');
console.log('─'.repeat(80));
console.log('👤 Usuario: "Lo fundamental son las fracciones, a veces suman directo los números de abajo..."');
console.log('🤖 Agente:  "Entendido. ¿Y qué otro concepto es importante además de las fracciones?"');
console.log('   ⚠️  Problema: Ignoró completamente la mención del error\n');

console.log('✅ AHORA (Comportamiento Agresivo):');
console.log('─'.repeat(80));
console.log('👤 Usuario: "Lo fundamental son las fracciones, a veces suman directo los números de abajo..."');
console.log('🤖 Agente:  "¡Espera! Has mencionado que \'suman directo los números de abajo\'. Eso es CRÍTICO');
console.log('            para el diagnóstico. Si les ponemos \'1/4 + 1/4\', ¿escriben \'2/8\'?');
console.log('            Confírmame el error exacto para diseñar la trampa del examen."');
console.log('   ✨ Solución: Interrupción inmediata y captura del artifact\n');

console.log('🔍 Palabras Clave Detectadas:');
console.log('   • "suman directo" → Descripción de error específico');
console.log('   • Trigger: FORENSIC_INTERRUPT');
console.log('   • Acción: ABORT concept_extraction → JUMP TO shadow_work\n');

// Escenario 2: Generación de Síntomas Observables
console.log('\n' + '='.repeat(80));
console.log('\n📍 ESCENARIO 2: Checklist del Observador en Shadow Work\n');

console.log('❌ ANTES (Captura Incompleta):');
console.log('─'.repeat(80));
console.log('👤 Usuario: "Sí, escriben 2/8."');
console.log('🤖 Agente:  "Perfecto, registrado. ¿Hay algún otro error común?"');
console.log('   ⚠️  Problema: No generó información para el observador externo\n');

console.log('✅ AHORA (Captura Completa con Checklist Fenomenológico):');
console.log('─'.repeat(80));
console.log('👤 Usuario: "Sí, escriben 2/8."');
console.log('🤖 Agente:  "Perfecto. Ahora, para el padre que supervisa: ¿Cómo se ve un niño');
console.log('            cometiendo este error? ¿Lo hace rápido y seguro, o duda?');
console.log('            ¿Escribe los números a la misma velocidad sin pausar?');
console.log('            Necesitamos una señal visual para que el padre pueda detectarlo."\n');

console.log('👤 Usuario: "Lo hacen rápido, sin pensar. Escriben todo seguido."');
console.log('🤖 Agente:  [Registra en updateContext]\n');

console.log('📦 Payload Capturado:');
console.log(JSON.stringify({
    identifiedMisconceptions: [
        {
            error: 'Suma lineal de denominadores porque generaliza reglas de números naturales',
            distractor_artifact: '2/8',
            observable_symptom: 'Escribe numeradores y denominadores a la misma velocidad sin pausar para pensar en el MCM',
            refutation: 'Mostrar que 2/8 = 1/4, contradiciendo que sumar aumenta el valor'
        }
    ]
}, null, 2));

// Escenario 3: Múltiples Interrupciones
console.log('\n' + '='.repeat(80));
console.log('\n📍 ESCENARIO 3: Múltiples Forensic Triggers\n');

console.log('👤 Usuario: "Los conceptos clave son suma, resta y multiplicación. Pero se equivocan');
console.log('            cuando ven números negativos, creen que dos negativos dan positivo en la suma."');
console.log('\n🔍 Análisis del Agente:');
console.log('   • Detecta: "se equivocan" → TRIGGER 1');
console.log('   • Detecta: "creen que" → TRIGGER 2');
console.log('   • Detecta: descripción de error específico → TRIGGER 3');
console.log('   • Acción: INTERRUPT IMMEDIATELY\n');

console.log('🤖 Agente:  "¡Espera! Has mencionado que \'creen que dos negativos dan positivo en la suma\'.');
console.log('            Eso es crítico. Si les ponemos \'(-2) + (-3)\', ¿escriben \'+5\' o \'5\'?');
console.log('            Dame el artifact exacto."\n');

console.log('👤 Usuario: "Escriben +5 o simplemente 5."');
console.log('🤖 Agente:  "Perfecto. Ahora, ¿qué señal visual delata este error? ¿Cuentan con los dedos?');
console.log('            ¿Hacen gestos de \'cancelar\' los signos negativos?"\n');

// Resumen de Mejoras
console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMEN DE MEJORAS IMPLEMENTADAS\n');

console.log('✅ Protocolo de Interrupción Forense:');
console.log('   • Detecta 15+ palabras clave de error');
console.log('   • Aborta fase actual inmediatamente');
console.log('   • Captura artifact literal en <2 turnos\n');

console.log('✅ Sub-rutina de Checklist del Observador:');
console.log('   • Genera observable_symptom obligatoriamente');
console.log('   • Ofrece 7+ opciones guía de comportamientos');
console.log('   • Crea "Señales de Humo" para observadores externos\n');

console.log('✅ Mentalidad del Agente:');
console.log('   • "Un error detectado vale más que 10 conceptos listados"');
console.log('   • Obsesión por evidencia forense específica');
console.log('   • Lenguaje de colaboración ("nosotros diseñamos")\n');

console.log('='.repeat(80));
console.log('\n🎉 Fase 3 Implementada Exitosamente\n');

console.log('📋 Próximos Pasos:');
console.log('   1. Probar el agente en una sesión real de discovery');
console.log('   2. Verificar que detecta errores al vuelo');
console.log('   3. Confirmar que genera observable_symptoms');
console.log('   4. Validar que el payload incluye todos los campos\n');
