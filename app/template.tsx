'use client';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-transition flex-1 flex flex-col mt-24">
            {children}
        </div>
    );
}
