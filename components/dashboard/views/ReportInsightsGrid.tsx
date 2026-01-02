import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DiagnosticResult } from '@/lib/domain/assessment';
import { KnowledgeGraph } from '@/lib/domain/analytics-types';
import { TrafficLightGraph } from '../insights/TrafficLightGraph';
import { PrescriptionCard } from '../insights/PrescriptionCard';
import { LandingProfile } from '../insights/LandingProfile';
import { CognitiveMirror } from '../../assessment/results/CognitiveMirror';
import { NextStepsCard } from '../NextStepsCard';
import { KnowledgeMap } from '../KnowledgeMap';

interface ReportInsightsGridProps {
    result: DiagnosticResult;
    graph: KnowledgeGraph;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const ReportInsightsGrid = ({ result, graph }: ReportInsightsGridProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visualization */}
        <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-7 space-y-8">
            <CognitiveMirror calibration={result.calibration} />
            <KnowledgeMap graph={graph} />
            <TrafficLightGraph diagnoses={result.competencyDiagnoses} />
            <LandingProfile profile={result.behaviorProfile} />
        </motion.div>

        {/* Right Column: Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-5 space-y-8">
            <PrescriptionCard diagnoses={result.competencyDiagnoses} />
            <NextStepsCard attemptId={result.attemptId} />
        </motion.div>
    </div>
);
