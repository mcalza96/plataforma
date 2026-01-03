'use client';

interface CelebrationOverlayProps {
    isVisible: boolean;
}

/**
 * Visual effects for lesson completion.
 */
export default function CelebrationOverlay({ isVisible }: CelebrationOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 pointer-events-none overflow-hidden">
            <div className="relative z-10 text-center animate-bounce-snappy">
                <span className="material-symbols-outlined text-[120px] text-primary drop-shadow-[0_0_50px_rgba(13,147,242,0.8)]">emoji_events</span>
                <h2 className="text-5xl font-black text-white mt-6 uppercase tracking-tighter drop-shadow-lg leading-none">¡Objetivo Logrado!</h2>
                <p className="text-primary font-bold tracking-[0.3em] uppercase mt-4 text-sm">Análisis Completado</p>
            </div>
            {/* CSS Particles */}
            <div className="absolute inset-0 particles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: i % 2 === 0 ? '#0d93f2' : '#a855f7',
                        width: `${Math.random() * 10 + 4}px`,
                        height: `${Math.random() * 10 + 4}px`,
                    } as any}></div>
                ))}
            </div>
            <style jsx>{`
                .particles {
                    perspective: 1000px;
                }
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: float 4s infinite linear;
                }
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
