# 🎯 Armería de Diagnóstico - TeacherOS

Sistema de evaluación universitaria de **Caja Blanca** con telemetría forense y navegación no lineal.

## 🚀 Inicio Rápido

```bash
# Ejecutar servidor de desarrollo
npm run dev

# Visitar página de demostración
http://localhost:3000/assessment-demo
```

## 📦 Componentes Disponibles

### Legos (Instrumentos de Medición)

```typescript
import { LegoCBM, LegoRanking, LegoSpotting } from '@/components/assessment';
```

#### 1. **LegoCBM** - Confidence-Based Marking
Pregunta de selección múltiple con validación de certeza.

```typescript
<LegoCBM
  questionId="q1"
  stem="¿Cuál es la respuesta correcta?"
  options={[
    { id: 'a', text: 'Opción A' },
    { id: 'b', text: 'Opción B' },
  ]}
  onAnswer={(payload) => console.log(payload)}
/>
```

#### 2. **LegoRanking** - Ordenamiento Drag & Drop
Lista reordenable con @dnd-kit.

```typescript
<LegoRanking
  questionId="q2"
  stem="Ordena los siguientes elementos:"
  items={[
    { id: 'i1', text: 'Primero' },
    { id: 'i2', text: 'Segundo' },
  ]}
  onAnswer={(payload) => console.log(payload)}
/>
```

#### 3. **LegoSpotting** - Detección de Errores
Identificación de errores en texto/código.

```typescript
<LegoSpotting
  questionId="q3"
  stem="Encuentra el error:"
  text="const x = 5 + '5'"
  interactiveSegments={[
    { id: 's1', startIndex: 14, endIndex: 17 }
  ]}
  onAnswer={(payload) => console.log(payload)}
/>
```

### Shell de Navegación

```typescript
import { ExamShell } from '@/components/assessment';
import type { Question } from '@/lib/domain/assessment';

const questions: Question[] = [
  // Array de preguntas CBM, Ranking, o Spotting
];

<ExamShell 
  questions={questions}
  onComplete={(answers) => {
    // Procesar respuestas con telemetría
  }}
/>
```

## 📊 Estructura de Datos

### Question Types

```typescript
type Question = CBMQuestion | RankingQuestion | SpottingQuestion;

interface CBMQuestion {
  id: string;
  type: 'CBM';
  stem: string;
  options: Array<{ id: string; text: string }>;
}

interface RankingQuestion {
  id: string;
  type: 'RANKING';
  stem: string;
  items: Array<{ id: string; text: string }>;
}

interface SpottingQuestion {
  id: string;
  type: 'SPOTTING';
  stem: string;
  text: string;
  interactiveSegments: Array<{
    id: string;
    startIndex: number;
    endIndex: number;
  }>;
}
```

### Answer Payload (con Telemetría)

```typescript
interface AnswerPayload {
  questionId: string;
  value: any;              // ID opción, array ordenado, o segment ID
  isGap: boolean;          // true si presionó "No sé"
  telemetry: {
    timeMs: number;        // Tiempo en millisegundos
    hesitationCount: number; // Cambios de respuesta
    focusLostCount: number;  // Pérdida de foco
    confidence?: 'LOW' | 'MEDIUM' | 'HIGH'; // Solo CBM
  };
}
```

## 🎨 Personalización

### Estilos
Los componentes usan Tailwind CSS v4 con la paleta Dark Mode de TeacherOS:
- Fondo: `#1A1A1A`
- Superficies: `#252525`
- Acentos: `amber-500`

### Hook de Telemetría

```typescript
import { useTelemetry } from '@/components/assessment';

const { start, logInteraction, setConfidenceLevel, captureSnapshot } = useTelemetry();

// Iniciar tracking
useEffect(() => {
  start();
}, []);

// Registrar interacción
logInteraction('CHANGE');

// Capturar snapshot final
const telemetry = captureSnapshot();
```

## 🔧 Integración con Backend

```typescript
// Ejemplo de endpoint
app.post('/api/diagnostic/submit', async (req, res) => {
  const { answers } = req.body as { answers: AnswerPayload[] };
  
  // Analizar telemetría
  const analysis = answers.map(a => ({
    questionId: a.questionId,
    isCorrect: validateAnswer(a.value),
    cognitiveLoad: a.telemetry.hesitationCount > 2 ? 'HIGH' : 'LOW',
    metacognition: a.telemetry.confidence === 'HIGH' && !validateAnswer(a.value) 
      ? 'OVERCONFIDENT' 
      : 'CALIBRATED'
  }));
  
  // Guardar en DB
  await saveAssessmentResults(analysis);
  
  res.json({ success: true });
});
```

## ♿ Accesibilidad

- ✅ Todos los botones tienen `aria-label`
- ✅ Estados interactivos con `aria-pressed`
- ✅ Navegación por teclado en LegoRanking
- ✅ Indicadores visuales claros

## 📝 Licencia

Parte del proyecto TeacherOS - Sistema de diagnóstico educativo.
