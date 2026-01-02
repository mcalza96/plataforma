'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';
import { SessionForensicView } from './forensic/SessionForensicView';
import { MetacognitiveMirror } from './analytics/metacognition/MetacognitiveMirror';
import { useTeacherDashboard } from './hooks/use-teacher-dashboard';
import FacultyHeader from './dashboard/FacultyHeader';
import { CognitiveHealthSection } from './dashboard/CognitiveHealthSection';
import { ForensicAuditSection } from './dashboard/ForensicAuditSection';
import TeacherIntegrityAlertFeed from './analytics/TeacherIntegrityAlertFeed';
import QuickActionsCTA from './dashboard/QuickActionsCTA';
import EngineeringLabWidget from './dashboard/EngineeringLabWidget';
import TacticalStudentBridge from './TacticalStudentBridge';
import StudentSelector from './dashboard/StudentSelector';

import { TeacherIntegrityAlert } from '@/lib/actions/teacher/analytics/integrity-actions';

interface TeacherDashboardViewProps {
    teacherName: string;
    cohortSize: number;
    analytics: TeacherAnalyticsResult | null;
    integrityAlerts: TeacherIntegrityAlert[];
    draftExams: Array<{
        id: string;
        title: string;
        updated_at: string;
    }>;
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
    integrityAlerts,
    draftExams,
    selectedStudent,
    cohortList
}: TeacherDashboardViewProps) {
    // Note: useTeacherDashboard hook removed - no longer needed for student-specific context
    const [isForensicOpen, setIsForensicOpen] = React.useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);

    const handleOpenForensic = (attemptId: string) => {
        setSelectedAttemptId(attemptId);
        setIsForensicOpen(true);
    };

    const closeForensic = () => {
        setIsForensicOpen(false);
        setSelectedAttemptId(null);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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

            <FacultyHeader teacherName={teacherName} cohortSize={cohortSize} />

            {/* Student Selector in header area */}
            <div className="mb-6 flex justify-end">
                <StudentSelector students={cohortList} selectedStudentId={selectedStudent?.id} />
            </div>

            {/* Conditional: Show TacticalStudentBridge OR Cohort Dashboard */}
            {selectedStudent ? (
                <TacticalStudentBridge
                    student={selectedStudent}
                    onClose={() => {/* Will be handled by router */ }}
                />
            ) : (
                <>
                    {/* Quick Actions - Proactive CTAs */}
                    <QuickActionsCTA />

                    {/* Engineering Lab - Draft Exams Status */}
                    <EngineeringLabWidget draftExams={draftExams} />

                    {/* Hero Section: Integrity Alert Feed */}
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mb-12">
                        <TeacherIntegrityAlertFeed alerts={integrityAlerts} />
                    </motion.div>

                    <CognitiveHealthSection analytics={analytics} />

                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mb-24">
                        <MetacognitiveMirror />
                    </motion.div>

                    <ForensicAuditSection
                        totalProjects={0}
                        isSearching={false}
                        onOpenForensic={handleOpenForensic}
                    />
                </>
            )}
        </motion.main>
    );
}
