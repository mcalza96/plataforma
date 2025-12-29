import LegoProgressBar from './LegoProgressBar';
import Link from 'next/link';

interface CourseCardProps {
    id: string;
    title: string;
    category: string;
    thumbnailUrl: string;
    completedSteps: number;
    totalSteps: number;
    status: 'En Progreso' | 'Nuevo' | 'Pausado';
}

export default function CourseCard({
    id,
    title,
    category,
    thumbnailUrl,
    completedSteps,
    totalSteps,
    status
}: CourseCardProps) {
    const variant = status === 'Nuevo' ? 'secondary' : 'primary';
    const statusColors = {
        'En Progreso': 'bg-primary/90',
        'Nuevo': 'bg-secondary/90',
        'Pausado': 'bg-[#223949]/90 border border-white/10'
    };

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-dark border border-[#223949] shadow-lg hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${thumbnailUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#182934] via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide backdrop-blur-sm shadow-md ${statusColors[status]}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-5 text-left">
                <div>
                    <h3 className={`text-white text-xl font-bold leading-tight mb-1 transition-colors ${variant === 'secondary' ? 'group-hover:text-secondary' : 'group-hover:text-primary'}`}>
                        {title}
                    </h3>
                    <p className="text-[#90b2cb] text-sm">Módulo: {category}</p>
                </div>

                <LegoProgressBar
                    completedSteps={completedSteps}
                    totalSteps={totalSteps}
                    variant={variant}
                />

                <Link
                    href={`/lessons/${id}`}
                    className={`w-full mt-2 py-2 rounded-lg bg-[#223949] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 group/btn ${variant === 'secondary' ? 'hover:bg-secondary' : 'hover:bg-primary'}`}
                >
                    <span>{status === 'Nuevo' ? 'Empezar' : 'Continuar'}</span>
                    <span className="material-symbols-outlined !text-[16px] group-hover/btn:translate-x-1 transition-transform">
                        {status === 'Nuevo' ? 'brush' : 'play_arrow'}
                    </span>
                </Link>
            </div>
        </article>
    );
}
