'use client';

import { ExamShell } from '@/components/assessment';
import type { Question, AnswerPayload } from '@/lib/domain/assessment';

// Mock data for demonstration
const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'CBM',
    stem: '¿Cuál es la complejidad temporal del algoritmo de búsqueda binaria?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(1)' },
    ],
  },
  {
    id: 'q2',
    type: 'RANKING',
    stem: 'Ordena los siguientes pasos del ciclo de vida de un componente React (de primero a último):',
    items: [
      { id: 'r1', text: 'componentDidMount' },
      { id: 'r2', text: 'constructor' },
      { id: 'r3', text: 'render' },
      { id: 'r4', text: 'componentWillUnmount' },
    ],
  },
  {
    id: 'q3',
    type: 'SPOTTING',
    stem: 'Identifica el error en el siguiente código JavaScript:',
    text: 'const numbers = [1, 2, 3];\nfor (let i = 0; i <= numbers.length; i++) {\n  console.log(numbers[i]);\n}',
    interactiveSegments: [
      { id: 's1', startIndex: 32, endIndex: 37 }, // 'let i'
      { id: 's2', startIndex: 45, endIndex: 47 }, // '<=' (el error)
      { id: 's3', startIndex: 48, endIndex: 62 }, // 'numbers.length'
    ],
  },
  {
    id: 'q4',
    type: 'CBM',
    stem: '¿Qué patrón de diseño se utiliza para crear una única instancia de una clase?',
    options: [
      { id: 'a', text: 'Factory' },
      { id: 'b', text: 'Singleton' },
      { id: 'c', text: 'Observer' },
      { id: 'd', text: 'Strategy' },
    ],
  },
  {
    id: 'q5',
    type: 'SPOTTING',
    stem: 'Encuentra el error lógico en esta ecuación matemática:',
    text: 'Si x + 5 = 10, entonces x = 10 - 5 = 15',
    interactiveSegments: [
      { id: 's1', startIndex: 3, endIndex: 4 },   // 'x'
      { id: 's2', startIndex: 7, endIndex: 8 },   // '5'
      { id: 's3', startIndex: 37, endIndex: 39 }, // '15' (el error)
    ],
  },
];

export default function AssessmentDemoPage() {
  const handleComplete = (answers: AnswerPayload[]) => {
    console.log('🎯 Examen completado. Respuestas:', answers);

    // Display results in a nice format
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8';
    resultsDiv.innerHTML = `
      <div class="bg-[#252525] border border-amber-500/30 rounded-2xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-white mb-6">📊 Resultados del Examen</h2>
        <div class="space-y-4">
          ${answers.map((answer, index) => `
            <div class="bg-[#1A1A1A] border border-white/10 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-amber-500">Pregunta ${index + 1}</span>
                ${answer.isGap
        ? '<span class="text-red-400 text-sm">❓ No sé</span>'
        : '<span class="text-green-400 text-sm">✓ Respondida</span>'
      }
              </div>
              <div class="text-sm text-gray-400 space-y-1">
                <p>⏱️ Tiempo: ${(answer.telemetry.timeMs / 1000).toFixed(1)}s</p>
                <p>🔄 Vacilaciones: ${answer.telemetry.hesitationCount}</p>
                <p>👁️ Pérdida de foco: ${answer.telemetry.focusLostCount}</p>
                ${answer.telemetry.confidence
        ? `<p>💪 Confianza: ${answer.telemetry.confidence}</p>`
        : ''
      }
              </div>
            </div>
          `).join('')}
        </div>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          class="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl transition-all"
        >
          Cerrar
        </button>
      </div>
    `;
    document.body.appendChild(resultsDiv);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <ExamShell questions={mockQuestions} onComplete={handleComplete} />
    </div>
  );
}
