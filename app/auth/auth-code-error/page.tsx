import Link from 'next/link';

export default function AuthCodeError() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#1A1A1A] text-white">
            <div className="bg-[#252525] border border-white/5 p-8 rounded-2xl shadow-2xl text-center max-w-md">
                <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                <h1 className="text-2xl font-bold mb-2">Enlace expirado</h1>
                <p className="text-gray-400 mb-8">
                    El enlace de acceso ya no es válido. Esto puede pasar si ya hiciste clic en él o si pasó mucho tiempo.
                </p>
                <Link
                    href="/login"
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all inline-block w-full text-center"
                >
                    Volver a intentar
                </Link>
            </div>
        </main>
    );
}
