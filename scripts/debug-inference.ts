
import 'dotenv/config';
import { evaluateSession } from '../lib/domain/evaluation/inference-engine';

// Mock Data representing a realistic attempt state
const MOCK_ATTEMPT_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';
const MOCK_STUDENT_ID = 'a111c7c6-df45-4c7b-a3b6-1a77466449ed';

const MOCK_RESPONSES: any[] = [
    {
        questionId: 'q1',
        selectedOptionId: 'opt-1',
        isCorrect: true,
        confidence: 'HIGH',
        telemetry: {
            timeMs: 5000,
            expectedTime: 10,
            hesitationCount: 0,
            hoverTimeMs: 0
        }
    },
    {
        questionId: 'q2',
        selectedOptionId: 'opt-2',
        isCorrect: false,
        confidence: 'LOW',
        telemetry: {
            timeMs: 1000, // FAST
            expectedTime: 10,
            hesitationCount: 2,
            hoverTimeMs: 0
        }
    }
];

const MOCK_Q_MATRIX: any[] = [
    {
        questionId: 'q1',
        competencyId: 'comp-1',
        isTrap: false,
        trapOptionId: null,
        idDontKnowOptionId: null
    },
    {
        questionId: 'q2',
        competencyId: 'comp-2',
        isTrap: true,
        trapOptionId: 'opt-2',
        idDontKnowOptionId: null
    }
];

async function testInference() {
    console.log("Testing Inference Engine...");
    try {
        const result = evaluateSession(
            MOCK_ATTEMPT_ID,
            MOCK_STUDENT_ID,
            MOCK_RESPONSES,
            MOCK_Q_MATRIX
        );
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("INFERENCE CRASH:", error);
    }
}

testInference();
