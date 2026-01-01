'use client';

import { useState, useTransition } from 'react';
import { toggleExamAssignment } from '@/lib/actions/assessment/exam-actions';
import { Student } from '@/lib/domain/entities/learner';

interface ExamAssignmentManagerProps {
    examId: string;
    students: Student[];
    initialAssignments: string[]; // List of student IDs assigned to this exam
}

export default function ExamAssignmentManager({ examId, students, initialAssignments }: ExamAssignmentManagerProps) {
    const [assignments, setAssignments] = useState(new Set(initialAssignments));
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (studentId: string) => {
        const isActive = !assignments.has(studentId);

        // Optimistic update
        const next = new Set(assignments);
        if (isActive) next.add(studentId);
        else next.delete(studentId);
        setAssignments(next);

        startTransition(async () => {
            try {
                await toggleExamAssignment(examId, studentId, isActive);
            } catch (error) {
                // Revert on error
                setAssignments(new Set(initialAssignments)); // Simple revert to initial, could be better
                console.error("Assignment failed", error);
            }
        });
    };

    if (students.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${assignments.size > 0
                    ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                <span className="material-symbols-outlined text-sm">
                    {assignments.size > 0 ? 'assignment_turned_in' : 'assignment_add'}
                </span>
                {assignments.size > 0 ? `${assignments.size} Asignados` : 'Asignar'}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#1F1F1F] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Estudiantes</span>
                            <span className="text-[9px] text-gray-500 font-mono">{students.length} Total</span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {students.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleToggle(student.id)}
                                    disabled={isPending}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${assignments.has(student.id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                                        <span className={`text-xs font-medium ${assignments.has(student.id) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                            {student.display_name}
                                        </span>
                                    </div>
                                    {assignments.has(student.id) && (
                                        <span className="material-symbols-outlined text-xs text-emerald-500">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
