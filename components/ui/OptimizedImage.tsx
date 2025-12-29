'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
    containerClassName?: string;
    fallbackIcon?: string;
    aspectRatio?: string;
}

export default function OptimizedImage({
    src,
    alt,
    containerClassName = "",
    fallbackIcon = "palette",
    className = "",
    aspectRatio = "",
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // If fill is used, we often want the container to handle the aspect ratio
    // but we apply it here to the skeleton to reserve space precisely.
    return (
        <div className={`relative overflow-hidden bg-[#1F1F1F] ${aspectRatio} ${containerClassName}`}>
            {isLoading && !error && (
                <div className={`absolute inset-0 skeleton z-10 ${aspectRatio}`} />
            )}

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                    <span className="material-symbols-outlined text-4xl">{fallbackIcon}</span>
                </div>
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    className={`transition-all duration-700 ${isLoading ? 'blur-lg scale-110 opacity-0' : 'blur-0 scale-100 opacity-100'} ${className}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
