import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('Error loading .env.local:', result.error);
    }
} else {
    console.error('.env.local file not found!');
}

// Manual fallback for loading GROQ_API_KEY if dotenv fails
// This is necessary because of some environment quirks with dotenv/tsx in this context
if (!process.env.GROQ_API_KEY && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const groqLine = envContent.split('\n').find(line => line.includes('GROQ_API_KEY='));
    if (groqLine) {
        const parts = groqLine.split('=');
        if (parts.length >= 2) {
            // Handle potential quotes
            let val = parts.slice(1).join('=');
            val = val.replace(/^["'](.*)["']$/, '$1').trim();
            process.env.GROQ_API_KEY = val;
            console.log('Manually loaded GROQ_API_KEY');
        }
    }
}

console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);

import { classifyIntent } from '../lib/ai/router';

async function testRouter() {
    const testCases: { messages: { role: 'user' | 'assistant' | 'system'; content: string }[], lessonId?: string }[] = [
        { messages: [{ role: 'user', content: "Hola, ¿cómo estás?" }] }, // CHAT
        { messages: [{ role: 'user', content: "Quiero crear una lección sobre teoría del color" }] }, // CANVAS_ACTION
        { messages: [{ role: 'user', content: "¿Por qué mis alumnos no entienden la perspectiva?" }] }, // PEDAGOGICAL_QUERY
        { messages: [{ role: 'user', content: "Cuéntame sobre la luz y la sombra" }] }, // PEDAGOGICAL_QUERY
        {
            messages: [
                { role: 'user', content: "Dime los pasos de lección para dibujar anatomía" },
                { role: 'assistant', content: "Claro, puedo ayudarte con eso..." },
                { role: 'user', content: "y enséñame cómo estructurar el curso completo" }
            ]
        }, // CANVAS_ACTION (Continuity)
        {
            messages: [
                { role: 'user', content: "¿Cómo explico la perspectiva?" },
                { role: 'assistant', content: "Puedes usar puntos de fuga..." },
                { role: 'user', content: "pero a veces se confunden con los horizontes" }
            ]
        }, // PEDAGOGICAL_QUERY (Continuity)
        { messages: [{ role: 'user', content: "Buenos días" }] }, // CHAT
    ];

    console.log("🚀 Starting Refined AI Router Test...\n");

    for (const testCase of testCases) {
        const lastQuery = testCase.messages[testCase.messages.length - 1].content;
        console.time(`Query: "${lastQuery.substring(0, 20)}..."`);
        const result = await classifyIntent(testCase.messages, testCase.lessonId);
        console.timeEnd(`Query: "${lastQuery.substring(0, 20)}..."`);
        console.log(`> History Length: ${testCase.messages.length}`);
        console.log(`> Last Query: "${lastQuery}"`);
        console.log(`> Result: ${result.intent}`);
        console.log(`> Reason: ${result.reasoning}`);
        console.log('-----------------------------------');
    }

    console.log("\n✅ Test Complete");
}

testRouter();
