'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
    containerClassName?: string;
    fallbackIcon?: string;
}

export default function OptimizedImage({
    src,
    alt,
    containerClassName = "",
    fallbackIcon = "palette",
    className = "",
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-[#1F1F1F] ${containerClassName}`}>
            {isLoading && !error && (
                <div className="absolute inset-0 skeleton z-10" />
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
                    onLoadingComplete={() => setIsLoading(false)}
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
