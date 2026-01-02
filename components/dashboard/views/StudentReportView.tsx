'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DiagnosticResult } from '@/lib/domain/assessment';
import { useStudentReport } from '../hooks/use-student-report';
import { ReportHeader } from './ReportHeader';
import { ReportSummarySection } from './ReportSummarySection';
import { ReportInsightsGrid } from './ReportInsightsGrid';

interface StudentReportViewProps {
    result: DiagnosticResult;
    matrix: any;
    studentName?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

/**
 * StudentReportView
 * Refactored to use useStudentReport hook and specialized sub-components.
 */
export const StudentReportView: React.FC<StudentReportViewProps> = ({
    result,
    matrix,
    studentName = 'Estudiante'
}) => {
    const { narrative, graph } = useStudentReport(result, matrix);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 md:p-8 lg:p-12 selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto relative z-10"
            >
                <ReportHeader studentName={studentName} attemptId={result.attemptId} />

                <ReportSummarySection
                    narrative={narrative}
                    overallScore={result.overallScore}
                    diagnosisCount={result.competencyDiagnoses.length}
                />

                <ReportInsightsGrid result={result} graph={graph} />
            </motion.div>
        </div>
    );
};
