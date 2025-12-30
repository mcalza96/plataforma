'use client';

import { PedagogicalTooltip } from './PedagogicalTooltip';

const GLOSSARY: Record<string, string> = {
    'ZPD': 'Zona de Desarrollo Próximo: La brecha entre lo que el alumno puede hacer solo y lo que puede hacer con guía.',
    'Andamiaje': 'Scaffolding: Estructuras de soporte temporal que ayudan al alumno a alcanzar nuevos niveles de competencia.',
    'Refutación': 'Estrategia para confrontar al alumno con su error lógico mediante un contraejemplo directo.',
    'Misconception': 'Un error conceptual profundo, no un simple despiste. Requiere desaprender para corregir.',
    'Bloom': 'Taxonomía de niveles cognitivos, desde recordar hasta crear.',
    'Metacognición': 'La capacidad del alumno de reflexionar sobre su propio proceso de pensamiento.'
};

export function TextWithGlossary({ text }: { text: string }) {
    if (!text) return null;

    // Split text by boundaries but keep delimiters to reconstruct, focusing on words
    // Simple approach: Split by space and check match. For robust solution, use regex replace with callback.

    // Regex matches any key in glossary, ensuring word boundaries
    const regex = new RegExp(`\\b(${Object.keys(GLOSSARY).join('|')})\\b`, 'gi');

    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) => {
                // Check if this part matches a glossary term (case insensitive)
                const match = Object.keys(GLOSSARY).find(k => k.toLowerCase() === part.toLowerCase());

                if (match) {
                    return (
                        <PedagogicalTooltip key={i} term={match} definition={GLOSSARY[match]}>
                            {part}
                        </PedagogicalTooltip>
                    );
                }
                return part;
            })}
        </span>
    );
}
