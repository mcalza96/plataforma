import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { ExportButton } from "@/components/admin/ExportButton";
import Link from "next/link";
import { ChevronRight, FileJson, Rocket } from "lucide-react";
import { getStudentRepository } from "@/lib/infrastructure/di";
import ExamAssignmentManager from "@/components/admin/ExamAssignmentManager";

export default async function AdminExamsPage() {
    const supabase = await createClient();

    const { data: exams, error } = await supabase
        .from("exams")
        .select(`
            *,
            exam_assignments (
                student_id
            )
        `)
        .order("created_at", { ascending: false });

    // Fetch students for the current teacher to enable assignments
    const { data: { user } } = await supabase.auth.getUser();
    let students: any[] = [];
    if (user) {
        const studentRepo = getStudentRepository();
        students = await studentRepo.getStudentsByTeacherId(user.id);
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#1A1A1A]/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Gestión Pedagógica</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Invernadero de Exámenes</h1>
                    <p className="text-gray-400 text-sm max-w-md">Administra tus instrumentos de evaluación y descarga reportes detallados para la UBB.</p>
                </div>

                <Link
                    href="/admin/exam-builder"
                    className="flex items-center gap-2 bg-amber-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                >
                    <Rocket size={16} />
                    NUEVO EXAMEN
                </Link>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {exams?.map((exam) => (
                    <div
                        key={exam.id}
                        className="group bg-[#1F1F1F] border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                                <FileJson size={28} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-black text-white italic uppercase">{exam.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${exam.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-400'
                                        }`}>
                                        {exam.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-600 font-mono">
                                        ID: {exam.id.split('-')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Assignment Tool */}
                            <ExamAssignmentManager
                                examId={exam.id}
                                students={students}
                                initialAssignments={exam.exam_assignments?.map((a: any) => a.student_id) || []}
                            />

                            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

                            <ExportButton examId={exam.id} variant="outline" className="flex-1 md:flex-initial" />
                            <Link
                                href={`/admin/submissions?examId=${exam.id}`}
                                className="size-11 flex items-center justify-center border border-white/5 bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}

                {(!exams || exams.length === 0) && (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No hay exámenes diseñados todavía.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
