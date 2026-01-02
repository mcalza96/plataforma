import { useState } from 'react';
import { getLatestCompletedAttempt } from '@/lib/actions/teacher/forensic-actions';

export function useTeacherDashboard(studentId: string) {
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [isForensicOpen, setIsForensicOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleOpenForensic = async () => {
        setIsSearching(true);
        try {
            const attemptId = await getLatestCompletedAttempt(studentId);
            if (attemptId) {
                setSelectedAttemptId(attemptId);
                setIsForensicOpen(true);
            } else {
                alert("No se encontraron sesiones completadas para este alumno.");
            }
        } catch (error) {
            console.error("Forensic search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const closeForensic = () => {
        setIsForensicOpen(false);
        setSelectedAttemptId(null);
    };

    return {
        selectedAttemptId,
        isForensicOpen,
        isSearching,
        handleOpenForensic,
        closeForensic
    };
}
