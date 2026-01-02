"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
    id: string;
    display_name: string;
    level: number;
}

interface StudentSelectorProps {
    students: Student[];
    selectedStudentId?: string;
}

/**
 * StudentSelector: Professional cohort navigation dropdown
 * Allows searching and selecting students for forensic audit
 */
export default function StudentSelector({ students, selectedStudentId }: StudentSelectorProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    const filteredStudents = students.filter(student =>
        student.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.includes(searchTerm)
    );

    const handleSelectStudent = (studentId: string) => {
        router.push(`/teacher-dashboard?studentId=${studentId}`);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative">
            {/* Selector Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-blue-500">groups</span>
                <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sujeto</p>
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">
                        {selectedStudent?.display_name || 'Vista de Cohorte'}
                    </p>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-[#252525] border border-white/10 rounded-xl shadow-2xl z-20">
                        {/* Search */}
                        <div className="p-3 border-b border-white/5">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                        </div>

                        {/* Student List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {/* Return to Cohort View */}
                            <button
                                onClick={() => {
                                    router.push('/teacher-dashboard');
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-colors ${!selectedStudentId ? 'bg-white/10' : ''}`}
                            >
                                <span className="material-symbols-outlined text-emerald-500">dashboard</span>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-bold text-white">Vista de Cohorte</p>
                                    <p className="text-xs text-gray-500">Métricas agregadas</p>
                                </div>
                            </button>

                            {filteredStudents.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => handleSelectStudent(student.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-colors ${selectedStudentId === student.id ? 'bg-white/10' : ''}`}
                                >
                                    <span className="material-symbols-outlined text-blue-500">person</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-white">{student.display_name}</p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            Nivel {student.level}
                                        </p>
                                    </div>
                                    {selectedStudentId === student.id && (
                                        <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                    )}
                                </button>
                            ))}

                            {filteredStudents.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500">No se encontraron estudiantes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
