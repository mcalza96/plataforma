'use client';

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    description: string | null;
    thumbnailUrl?: string | null;
    courseId: string;
}

/**
 * Pure component for video rendering.
 * Preserves the layout and original aesthetics of the studio.
 */
export default function VideoPlayer({
    videoUrl,
    title,
    description,
    thumbnailUrl,
    courseId
}: VideoPlayerProps) {
    return (
        <div
            className="flex-1 lg:basis-[70%] flex flex-col bg-black relative group/player"
            style={{ viewTransitionName: `course-image-${courseId}` }}
        >
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                <video
                    key={videoUrl} // Force re-render when video source changes
                    className="w-full h-full object-contain"
                    controls
                    poster={thumbnailUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"}
                    src={videoUrl}
                >
                    Tu navegador no soporta el video.
                </video>

                {/* Top Left Lesson Title Overlay */}
                <div className="absolute top-0 left-0 p-8 w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                        {title}
                    </h1>
                    <p className="text-gray-300 mt-1 text-base lg:text-lg">
                        {description || 'Aprendiendo nuevas técnicas digitales.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
