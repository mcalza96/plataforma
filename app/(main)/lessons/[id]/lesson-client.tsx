'use client';

import { LessonDTO as Lesson, LearnerProgressDTO as LearnerProgress } from '@/lib/domain/course';
import { useLessonController } from '@/hooks/use-lesson-controller';
import { useRef } from 'react';

// Pure Components
import CelebrationOverlay from '@/components/lesson-view/CelebrationOverlay';
import VideoPlayer from '@/components/lesson-view/VideoPlayer';
import AtomicStepList from '@/components/lesson-view/AtomicStepList';
import LessonFooter from '@/components/lesson-view/LessonFooter';

interface LessonClientProps {
    courseId: string;
    learnerId: string;
    lesson: Lesson;
    initialProgress?: LearnerProgress;
    nextLessonId?: string;
}

/**
 * Lesson View Container Component.
 * Orquestrates state (via useLessonController) and UI presentation.
 * Now synchronizes video playback with atomic steps.
 */
export default function LessonClient({
    courseId,
    learnerId,
    lesson,
    initialProgress,
    nextLessonId
}: LessonClientProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Controller Layer
    const {
        optimisticSteps,
        isLessonComplete,
        isPending,
        showCelebration,
        handleStepToggle,
        handleNextLesson
    } = useLessonController({
        courseId,
        learnerId,
        lessonId: lesson.id!,
        totalSteps: lesson.total_steps,
        initialCompletedSteps: initialProgress?.completed_steps || 0,
        nextLessonId
    });

    // 2. Interaction Handlers
    const handleJumpToStep = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play().catch(() => {
                // Autoplay might be blocked until user interaction
            });
        }
    };

    // 3. View Layer
    return (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#1A1A1A]">

            <CelebrationOverlay isVisible={showCelebration} />

            {/* Left Area: Visual Content */}
            <VideoPlayer
                ref={videoRef}
                videoUrl={lesson.video_url}
                title={lesson.title}
                description={lesson.description || null}
                thumbnailUrl={lesson.thumbnail_url || null}
                courseId={courseId}
            />

            {/* Right Area: Interactive Progress & Actions */}
            <div className="flex-1 lg:basis-[30%] bg-[#1A1A1A] border-l border-white/5 flex flex-col min-w-[350px]">
                <AtomicStepList
                    totalSteps={lesson.total_steps}
                    completedSteps={optimisticSteps}
                    onToggleStep={handleStepToggle}
                    onJumpToStep={handleJumpToStep}
                    isPending={isPending}
                />

                <LessonFooter
                    isComplete={isLessonComplete}
                    onNext={handleNextLesson}
                    downloadUrl={lesson.download_url}
                    nextLessonId={nextLessonId}
                />
            </div>

        </main>
    );
}
