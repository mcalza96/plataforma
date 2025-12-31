const { calculateReadiness } = require('./lib/domain/architect');

const testCases = [
    {
        name: 'Empty context',
        context: {},
        expectedIsValid: false
    },
    {
        name: 'Valid context (3 concepts, 1 error)',
        context: {
            targetAudience: 'Students',
            keyConcepts: ['C1', 'C2', 'C3'],
            identifiedMisconceptions: [{ error: 'E1', refutation: 'R1' }]
        },
        expectedIsValid: true
    }
];

testCases.forEach(tc => {
    const readiness = calculateReadiness(tc.context);
    console.log(`[${readiness.isValid === tc.expectedIsValid ? 'PASS' : 'FAIL'}] ${tc.name}`);
});
