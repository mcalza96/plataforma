'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';
import dynamic from 'next/dynamic';
import FacultyHeader from './dashboard/FacultyHeader';
import { CognitiveHealthSection } from './dashboard/CognitiveHealthSection';
import StudentSelector from './dashboard/StudentSelector';

// Dynamic imports for heavy components
const TacticalStudentBridge = dynamic(() => import('./TacticalStudentBridge'), {
    loading: () => <div className="animate-pulse bg-surface/20 rounded-2xl h-96 w-full" />
});

const MetacognitiveMirror = dynamic(() => import('./analytics/metacognition/MetacognitiveMirror').then(mod => mod.MetacognitiveMirror), {
    loading: () => <div className="animate-pulse bg-surface/20 rounded-3xl h-[600px] w-full" />
});

interface TeacherDashboardViewProps {
    teacherName: string;
    cohortSize: number;
    analytics: TeacherAnalyticsResult | null;
    selectedStudent: {
        id: string;
        display_name: string;
        level: number;
        avatar_url?: string;
    } | null;
    cohortList: Array<{
        id: string;
        display_name: string;
        level: number;
    }>;
}

/**
 * TeacherDashboardView: Institutional control center.
 * Refactored to use useTeacherDashboard hook and specialized sub-components.
 */
export default function TeacherDashboardView({
    teacherName,
    cohortSize,
    analytics,
    selectedStudent,
    cohortList
}: TeacherDashboardViewProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03, // Hyper-fast cascading
                type: 'spring' as const,
                stiffness: 400,
                damping: 40
            }
        }
    };

    // Empty state for analytics
    const hasAnalyticsData = analytics && Object.keys(analytics).length > 0;


    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-7xl mx-auto w-full px-6 py-12"
        >
            <FacultyHeader teacherName={teacherName} cohortSize={cohortSize} />

            {/* Student Selector in header area */}
            <div className="mb-6 flex justify-end">
                <StudentSelector students={cohortList} selectedStudentId={selectedStudent?.id} />
            </div>

            {/* Conditional Rendering: Individual Student vs Cohort Health */}
            {selectedStudent ? (
                <TacticalStudentBridge
                    student={selectedStudent}
                    onClose={() => {/* Handled by router */ }}
                />
            ) : (
                <div className="space-y-16">
                    <CognitiveHealthSection analytics={analytics} />

                    <motion.div
                        variants={{
                            hidden: { y: 10, opacity: 0 },
                            visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                        }}
                        className="mb-24"
                    >
                        <MetacognitiveMirror />
                    </motion.div>
                </div>
            )}
        </motion.main>
    );
}
