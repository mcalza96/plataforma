'use client';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-transition flex-1 flex flex-col mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
        </div>
    );
}
