import Link from 'next/link';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#223949] bg-[#101b23]/95 backdrop-blur-md px-4 sm:px-10 py-3">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined !text-[32px]">draw</span>
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Procreate Studio</h2>
                </Link>

                {/* Search Mission */}
                <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full group focus-within:ring-2 ring-primary/50 transition-all">
                        <div className="text-[#90b2cb] flex border-none bg-[#182934] items-center justify-center pl-4 rounded-l-lg border-r-0">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#182934] h-full placeholder:text-[#90b2cb] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                            placeholder="Buscar misiones..."
                        />
                    </div>
                </label>
            </div>

            <div className="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
                <nav className="hidden lg:flex items-center gap-9">
                    <Link className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="/dashboard">Misión Control</Link>
                    <Link className="text-[#90b2cb] text-sm font-medium leading-normal hover:text-white transition-colors" href="/gallery">Galería</Link>
                    <Link className="text-[#90b2cb] text-sm font-medium leading-normal hover:text-white transition-colors" href="/resources">Recursos</Link>
                </nav>

                {/* Notification Bell */}
                <button className="text-[#90b2cb] hover:text-white transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-0 right-0 size-2 bg-secondary rounded-full border border-[#101b23]"></span>
                </button>

                {/* New Project Button */}
                <button className="hidden sm:flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(13,147,242,0.3)]">
                    <span className="truncate flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[18px]">add</span>
                        Nuevo Lienzo
                    </span>
                </button>

                {/* Learner Avatar Placeholder - In a real app we would fetch this */}
                <Link href="/select-profile" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#223949] cursor-pointer hover:border-white transition-colors bg-surface-darker flex items-center justify-center text-[#90b2cb]">
                    <span className="material-symbols-outlined">person</span>
                </Link>
            </div>
        </header>
    );
}
