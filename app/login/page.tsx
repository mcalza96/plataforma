'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-actions';

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setMessage(null);

        const result = isSignUp ? await signUp(formData) : await signIn(formData);

        if (result && 'error' in result) {
            setError(result.error as string);
            setLoading(false);
        } else if (result && 'success' in result) {
            setMessage(result.success as string);
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#1A1A1A]">
            <div className="w-full max-w-md bg-[#252525] rounded-3xl p-10 shadow-2xl border border-white/5">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-primary/10 p-4 rounded-2xl mb-4 text-primary">
                        <span className="material-symbols-outlined text-4xl">palette</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Procreate Studio</h1>
                    <p className="text-gray-400 text-center font-medium">
                        {isSignUp ? 'Crea una cuenta de padre' : 'Bienvenido de nuevo, Artista'}
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-[0.2em]">Email</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">mail</span>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="tu@email.com"
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-[0.2em]">Contraseña</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">lock</span>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600 font-medium"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in shake duration-300">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-5 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span>{isSignUp ? 'Crear Cuenta' : 'Entrar al Estudio'}</span>
                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    {isSignUp ? (
                        <p className="text-gray-400 font-bold text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="text-primary hover:text-white font-black uppercase tracking-widest text-xs ml-1 transition-colors h-11 px-4"
                            >
                                Inicia sesión
                            </button>
                        </p>
                    ) : (
                        <p className="text-gray-400 font-bold text-sm">
                            ¿No tienes cuenta?{' '}
                            <button
                                onClick={() => setIsSignUp(true)}
                                className="text-primary hover:text-white font-black uppercase tracking-widest text-xs ml-1 transition-colors h-11 px-4"
                            >
                                Regístrate
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
