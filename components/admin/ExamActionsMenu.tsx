'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Eye, Loader, Pencil } from 'lucide-react';
import { deleteExam, updateExamTitle } from '@/lib/actions/assessment/exam-actions';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, which is standard in this stack

interface ExamActionsMenuProps {
    examId: string;
    title: string;
}

export function ExamActionsMenu({ examId, title }: ExamActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!window.confirm(`¿Estás seguro que deseas eliminar el examen "${title}"?\n\nEsta acción borrará permanentemente el examen y todas las entregas asociadas. No se puede deshacer.`)) {
            return;
        }

        startTransition(async () => {
            const result = await deleteExam(examId);
            if (!result.success) {
                alert(result.error);
            } else {
                setIsOpen(false);
            }
        });
    };

    const handleRename = async () => {
        const newTitle = window.prompt("Nuevo nombre para el examen:", title);
        if (!newTitle || newTitle === title) return;

        startTransition(async () => {
            const result = await updateExamTitle(examId, newTitle);
            if (!result.success) {
                alert(result.error);
            } else {
                setIsOpen(false);
            }
        });
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
                {isPending ? <Loader className="animate-spin" size={16} /> : <MoreVertical size={16} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1F1F1F] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        <Link
                            href={`/assessment/${examId}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Eye size={14} />
                            Ver Vista Previa
                        </Link>

                        <button
                            onClick={handleRename}
                            disabled={isPending}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Pencil size={14} />
                            Renombrar
                        </button>

                        <div className="h-px bg-white/5 my-1" />

                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={14} />
                            {isPending ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
