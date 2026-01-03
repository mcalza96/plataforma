import Link from 'next/link';
import { getAuthUser } from '@/lib/infrastructure/auth-utils';
import Header from '@/components/layout/header';
import Image from 'next/image';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const user = await getAuthUser();

  const cookieStore = await cookies();
  const studentId = cookieStore.get('learner_id')?.value;

  if (studentId) {
    return redirect('/student');
  }
  else {
    // If no student ID in cookie, strictly we might want to set one or go to a setup page.
    // But per request "remove select profile", we send to /student and let it handle empty state
    // or maybe /student handles auto-onboarding.
    return redirect('/student');
  }

  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary/30">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Inteligencia Educativa en tiempo real</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              Decisiones basadas en <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">evidencia real.</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Transformamos la telemetría de aprendizaje en <span className="text-white font-bold">insights pedagógicos accionables</span>. La plataforma líder en análisis de datos para instituciones de vanguardia.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href={user ? "/student" : "/login"}
                className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl transition-all shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                {user ? 'Ir al Dashboard' : 'Acceso Plataforma'}
                <span className="material-symbols-outlined font-bold">analytics</span>
              </Link>
              <Link
                href="https://www.jitdata.cl"
                className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-2xl transition-all border border-white/10"
              >
                Saber más de JIT Data
              </Link>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl rotate-[-2deg] group-hover:rotate-0 transition-all duration-700 bg-surface/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="flex gap-2">
                  <div className="h-2 w-16 bg-primary rounded-full" />
                  <div className="h-2 w-8 bg-white/10 rounded-full" />
                  <div className="h-2 w-12 bg-white/10 rounded-full" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sincronizando Telemetría de Cohorte...</p>
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-9xl text-white/5">monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.4em]">El Desafío Educativo</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter">¿Sabes qué está pasando realmente en el aula?</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              La mayoría de los sistemas educativos solo ven el <span className="text-white font-bold">resultado final</span>. En JIT Data, analizamos el <span className="text-white font-bold italic">proceso cognitivo</span> paso a paso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-surface/20 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">query_stats</span>
              <h4 className="text-xl font-bold">Puntos Ciegos</h4>
              <p className="text-slate-500 text-sm">Identificamos lagunas conceptuales antes de que se conviertan en fracasos escolares mediante algoritmos predictivos.</p>
            </div>
            <div className="p-8 rounded-3xl bg-surface/20 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-secondary">psychology_alt</span>
              <h4 className="text-xl font-bold">Carga Cognitiva</h4>
              <p className="text-slate-500 text-sm">Medimos la frustración y la vacilación en tiempo real, permitiendo intervenciones precisas del docente.</p>
            </div>
            <div className="p-8 rounded-3xl bg-surface/20 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-slate-400">speed</span>
              <h4 className="text-xl font-bold">Latencia de Respuesta</h4>
              <p className="text-slate-500 text-sm">Nuestra telemetría captura micro-interacciones móviles para inferir el estado de salud de la cohorte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2024 JIT Data Analytics. Optimización del aprendizaje mediante análisis de datos.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="https://www.jitdata.cl" className="hover:text-white transition-colors">Web Oficial</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
        </div>
      </footer>
    </div>
  );
}
