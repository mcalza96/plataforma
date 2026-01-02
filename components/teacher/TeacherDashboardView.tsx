'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';
import { SessionForensicView } from './forensic/SessionForensicView';
import { MetacognitiveMirror } from './analytics/metacognition/MetacognitiveMirror';
import { useTeacherDashboard } from './hooks/use-teacher-dashboard';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { CognitiveHealthSection } from './dashboard/CognitiveHealthSection';
import { ForensicAuditSection } from './dashboard/ForensicAuditSection';

interface TeacherDashboardViewProps {
    student: {
        id: string;
        display_name: string;
        level: number;
        avatar_url?: string;
    };
    stats: {
        totalProjects: number;
    };
    analytics: TeacherAnalyticsResult | null;
}

/**
 * TeacherDashboardView: Institutional control center.
 * Refactored to use useTeacherDashboard hook and specialized sub-components.
 */
export default function TeacherDashboardView({
    student,
    stats,
    analytics
}: TeacherDashboardViewProps) {
    const {
        selectedAttemptId,
        isForensicOpen,
        isSearching,
        handleOpenForensic,
        closeForensic
    } = useTeacherDashboard(student.id);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-7xl mx-auto w-full px-6 py-12"
        >
            {/* Forensic Audit Modal */}
            {isForensicOpen && selectedAttemptId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-6xl animate-in zoom-in-95 duration-200">
                        <SessionForensicView
                            attemptId={selectedAttemptId}
                            onClose={closeForensic}
                        />
                    </div>
                </div>
            )}

            <DashboardHeader student={student} />

            <CognitiveHealthSection analytics={analytics} />

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mb-24">
                <MetacognitiveMirror />
            </motion.div>

            <ForensicAuditSection
                totalProjects={stats.totalProjects}
                isSearching={isSearching}
                onOpenForensic={handleOpenForensic}
            />
        </motion.main>
    );
}
