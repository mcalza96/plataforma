import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="size-48 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-dashed border-amber-500/20">
                    <span className="material-symbols-outlined text-8xl text-amber-500/40">brush_off</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Error 404
                </div>
            </div>

            <div className="space-y-3">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">¡Ups! Se nos perdió el pincel</h1>
                <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Parece que esta página no existe en nuestro lienzo. ¿Quizás el artista la borró sin querer?
                </p>
            </div>

            <Link
                href="/dashboard"
                className="px-10 py-4 bg-amber-500 text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all hover:bg-amber-400"
            >
                Regresar a la Misión
            </Link>
        </div>
    );
}
