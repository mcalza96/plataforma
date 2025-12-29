'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/auth-actions';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await signInWithMagicLink(email);
            setMessage({ type: 'success', text: '¡Enlace enviado! Revisa tu correo electrónico.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al enviar el enlace.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-dark relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex bg-primary/10 p-4 rounded-2xl text-primary mb-6">
                        <span className="material-symbols-outlined text-4xl">palette</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-3">
                        Bienvenido, Artista
                    </h1>
                    <p className="text-gray-400">
                        Ingresa tu email para acceder a tu estudio creativo.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface border border-white/5 p-8 rounded-2xl shadow-2xl space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                            className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-pulse">Enviando...</span>
                        ) : (
                            <>
                                <span>Enviar Enlace Mágico</span>
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                            </>
                        )}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                    ¿No tienes una cuenta? <span className="text-primary hover:underline cursor-pointer">Contáctanos</span>
                </p>
            </div>
        </main>
    );
}
