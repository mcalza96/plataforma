import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import Header from '@/components/layout/header';
import Image from 'next/image';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white selection:bg-primary/30">
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-violet/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Inscripciones Abiertas 2024</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              Transforma su talento en <br />
              <span className="bg-gradient-to-r from-primary via-neon-violet to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">maestría digital.</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              La primera academia de arte digital para niños de 9 a 12 años que combina el rigor del arte clásico con la tecnología de
              <span className="text-white font-bold"> Procreate®</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary-hover text-white font-black text-lg rounded-2xl transition-all shadow-[0_10px_30px_rgba(13,147,242,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                {user ? 'Volver a Misión Control' : 'Empezar Misión'}
                <span className="material-symbols-outlined font-bold">rocket_launch</span>
              </Link>
              <Link
                href="#metodo"
                className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-2xl transition-all border border-white/10"
              >
                Conocer el Método
              </Link>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl rotate-[-2deg] group-hover:rotate-0 transition-all duration-700 bg-neutral-900">
              {/* Procreate UI Mockup Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 space-y-2">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-primary animate-pulse"></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Lección en Progreso: Luces y Sombras</p>
              </div>
              {/* Replace with actual asset if available */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-9xl text-white/10">brush</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-neon-violet uppercase tracking-[0.4em]">El Desafío</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter">¿Sigue dibujando como un niño de 6 años?</h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Muchos niños de 9 a 12 años sufren la <span className="text-white font-bold italic">"Crisis del Realismo"</span>: su ojo mejora,
              pero su mano no sabe cómo replicar lo que imaginan. Sin el guía adecuado, abandonan el dibujo para siempre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">heart_broken</span>
              <h4 className="text-xl font-bold">Frustración Creativa</h4>
              <p className="text-gray-500 text-sm">Quieren resultados profesionales pero se sienten bloqueados por la complejidad de las herramientas digitales.</p>
            </div>
            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-neon-violet">smart_toy</span>
              <h4 className="text-xl font-bold">El Espejismo de la IA</h4>
              <p className="text-gray-500 text-sm">La IA genera imágenes, pero no enseña a crear. En Alpha Studio, valoramos el esfuerzo real del artista.</p>
            </div>
            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 text-left space-y-4">
              <span className="material-symbols-outlined text-4xl text-yellow-500">model_training</span>
              <h4 className="text-xl font-bold">Falta de Estructura</h4>
              <p className="text-gray-500 text-sm">Youtube está lleno de tutoriales, pero falta una ruta clara de aprendizaje técnico paso a paso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE LEGO METHOD */}
      <section id="metodo" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white shadow-2xl rounded-3xl rotate-[-3deg] flex items-center justify-center">
                  <span className="material-symbols-outlined text-neutral-900 text-6xl">grid_view</span>
                </div>
                <div className="aspect-square bg-primary shadow-2xl rounded-3xl rotate-[3deg] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl">play_circle</span>
                </div>
                <div className="aspect-square bg-neon-violet shadow-2xl rounded-3xl rotate-[2deg] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl">layers</span>
                </div>
                <div className="aspect-square bg-neutral-800 shadow-2xl rounded-3xl rotate-[-4deg] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl">trophy</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Nuestro Método</h2>
              <h3 className="text-5xl font-black tracking-tighter leading-none">Aprendizaje <br /> <span className="text-amber-500">Estilo LEGO®</span></h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                No creemos en clases de 1 hora que aburren. Dividimos cada obra maestra en <span className="text-white font-bold italic">Pasos Atómicos</span> de 3 minutos.
                El niño completa piezas pequeñas hasta que, sin darse cuenta, ha construido una ilustración de nivel profesional.
              </p>
              <ul className="space-y-4">
                {[
                  'Doble Pantalla: Video 70% | Pasos 30%',
                  'Barras de progreso visuales y gratificantes',
                  'Pinceles exclusivos para cada misión',
                  'Feedback humano de instructores reales'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-bold">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HUMAN VS AI */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-black">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-block px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-black uppercase tracking-widest">
            Certificación de Autoría Humana
          </div>
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Aquí el proceso es el <span className="italic">Premio.</span></h3>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            En la era del "Prompting", aprender a dibujar es un superpoder. Exigimos la subida del <span className="text-white font-bold">Time-lapse de Procreate</span> para cada entrega.
            No solo vemos el resultado final, celebramos cada trazo que tomó llegar ahí.
          </p>

          <div className="pt-12">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="bg-white text-black px-12 py-6 rounded-2xl font-black text-xl hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95 inline-flex"
            >
              ¡Quiero Unirme a la Academia!
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2024 Procreate Alpha Studio. Diseñado para la próxima generación de artistas.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
          <Link href="https://instagram.com" className="hover:text-white transition-colors">Instagram</Link>
        </div>
      </footer>
    </div>
  );
}
