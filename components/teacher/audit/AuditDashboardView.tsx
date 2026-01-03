'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FacultyHeader from '../dashboard/FacultyHeader';
import TeacherIntegrityAlertFeed from '../analytics/TeacherIntegrityAlertFeed';
import { ForensicAuditSection } from '../dashboard/ForensicAuditSection';
import { SessionForensicView } from '../forensic/SessionForensicView';
import { TeacherIntegrityAlert } from '@/lib/actions/teacher/analytics/integrity-actions';

interface AuditDashboardViewProps {
    teacherName: string;
    cohortSize: number;
    integrityAlerts: TeacherIntegrityAlert[];
}

export default function AuditDashboardView({
    teacherName,
    cohortSize,
    integrityAlerts
}: AuditDashboardViewProps) {
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

            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <span className="material-symbols-outlined text-amber-500">security</span>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Centro de Auditoría Forense</h2>
                </div>

                <p className="text-gray-400 text-sm mb-12 max-w-2xl px-2">
                    Supervisa la integridad de las evaluaciones y detecta patrones conductuales de riesgo como la duda tóxica o la adivinanza mecánica.
                </p>

                {/* Hero Section: Integrity Alert Feed */}
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mb-12">
                    <TeacherIntegrityAlertFeed alerts={integrityAlerts} />
                </motion.div>

                <ForensicAuditSection
                    totalProjects={integrityAlerts.length > 0 ? 1 : 0} // Placeholder logic for now
                    isSearching={false}
                    onOpenForensic={() => {/* Default search logic */ }}
                />
            </div>
        </motion.main>
    );
}
