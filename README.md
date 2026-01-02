# TeacherOS - Plataforma de Inteligencia Pedagógica

TeacherOS es una infraestructura de "Cognitive Engineering" diseñada para transformar la evaluación educativa en un proceso forense y adaptativo.

## Arquitectura Base (Pilares)

El proyecto se organiza en torno a 4 pilares fundamentales que guían la toma de decisiones algorítmicas:

### 1. 🪞 Mirror (Inteligencia & Telemetría)
- **Propósito**: Visualizar la salud cognitiva del aula.
- **Componentes**: `TeacherDashboard`, `StudentReport`, `InferenceEngine`.
- **Métricas**: ECE (Expected Calibration Error), Entropía de Respuesta.

### 2. 👤 Shadow (Ingeniería Forense de Errores)
- **Propósito**: Identificar y desinfectar malentendidos conceptuales.
- **Componentes**: `ForensicLedger`, `MisconceptionExtractor`, `ShadowWorkFlow`.
- **Acción**: Mutaciones automáticas del grafo de conocimiento ante la detección de sesgos persistentes.

### 3. 🧗 Adventure (Descubrimiento & Orquestación)
- **Propósito**: Descubrir el modelo mental del experto y trazar rutas de aprendizaje.
- **Componentes**: `DiscoveryService` (Arquitecto Curricular), `AIOrchestratorService`, `PathPlanner`.
- **Mecánica**: Entrevistas socráticas para la co-creación de Blueprints de evaluación.

### 4. ⚓ Anchor (Grafo de Conocimiento & Persistencia)
- **Propósito**: Estabilidad y verdad única del dominio.
- **Componentes**: `KnowledgeGraphService`, `SupabaseRepository`, `IRT-Calibration`.

## Stack Tecnológico
- **Frontend**: Next.js 16 (App Router), TailwindCSS, Framer Motion.
- **IA**: Vercel AI SDK (centralizado vía `AIProvider`), Groq/OpenAI.
- **Persistencia**: Supabase (PostgreSQL, Auth, RLS).

## Calibración Empírica
La plataforma utiliza un motor de calibración basado en IRT (Item Response Theory) que detecta automáticamente ítems ambiguos (`HIGH_SLIP`) o distractores inútiles basándose en el comportamiento real de la cohorte.
