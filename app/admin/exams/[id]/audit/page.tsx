import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { getCohortAnalytics } from "@/lib/actions/admin/admin-analytics-actions";
import { AuditKPIs } from "@/components/admin/analytics/AuditKPIs";
import { CohortHeatmap } from "@/components/admin/analytics/CohortHeatmap";
import { CatedraRecommendation } from "@/components/admin/analytics/CatedraRecommendation";
import { FileBarChart, Printer, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function FacultyAuditPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth & Role check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
        redirect("/");
    }

    // 2. Fetch Aggregated Data
    const analytics = await getCohortAnalytics(id);
    if (!analytics) return notFound();

    const totalStudents = analytics.heatMap.length;

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href="/admin/exams"
                            className="bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-lg transition-all border border-zinc-700"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <FileBarChart size={16} />
                            <span>Centro de Auditoría de Facultad</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Informe de Integridad de Cohorte</h1>
                            <p className="text-zinc-500 text-lg flex items-center gap-2">
                                <span className="text-blue-400 font-semibold">{analytics.examTitle}</span>
                                <span>•</span>
                                <span>{totalStudents} Estudiantes Auditados</span>
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 border border-zinc-700 shadow-lg">
                                <Share2 size={18} />
                                Compartir
                            </button>
                            <button className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-white/5">
                                <Printer size={18} />
                                Imprimir Reporte
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Top Layer: KPIs */}
                    <AuditKPIs kpis={analytics.kpis} totalStudents={totalStudents} />

                    {/* Middle Layer: Executive Recommendation */}
                    <CatedraRecommendation data={analytics} />

                    {/* Matrix Layer: Heatmap */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <FileBarChart size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Distribución de Nodos de Fricción</h2>
                        </div>
                        <CohortHeatmap data={analytics} />
                    </section>

                </div>

                {/* Footer / Meta */}
                <footer className="mt-20 pt-8 border-t border-zinc-800 flex justify-between items-center text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                    <p>TeacherOS Faculty Intelligence Unit • 2026</p>
                    <p>Generado: {new Date().toLocaleString()}</p>
                </footer>
            </div>
        </div>
    );
}
