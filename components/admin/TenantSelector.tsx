'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Check, ChevronsUpDown, Search, User, X } from 'lucide-react';
import { useDebounce } from '../../hooks/use-debounce';

interface TenantProfile {
    id: string;
    display_name: string;
    email: string;
    role: string;
    avatar_url?: string;
}

export default function TenantSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTeacherId = searchParams.get('teacherId');

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [profiles, setProfiles] = useState<TenantProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<TenantProfile | null>(null);
    const [loading, setLoading] = useState(false);

    // Debounce query to avoid spamming DB
    const debouncedQuery = useDebounce(query, 300);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load initial selection if ID exists
    useEffect(() => {
        const loadInitial = async () => {
            if (currentTeacherId && !selectedProfile) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, display_name, email, role, avatar_url')
                    .eq('id', currentTeacherId)
                    .single();
                if (data) setSelectedProfile(data);
            }
        };
        loadInitial();
    }, [currentTeacherId]);

    // Search profiles
    useEffect(() => {
        const searchProfiles = async () => {
            setLoading(true);
            try {
                let queryBuilder = supabase
                    .from('profiles')
                    .select('id, display_name, email, role, avatar_url')
                    .in('role', ['teacher', 'instructor'])
                    .limit(10);

                if (debouncedQuery) {
                    queryBuilder = queryBuilder.ilike('display_name', `%${debouncedQuery}%`);
                }

                const { data, error } = await queryBuilder;

                if (!error && data) {
                    setProfiles(data);
                }
            } finally {
                setLoading(false);
            }
        };

        if (open) searchProfiles();
    }, [debouncedQuery, open]);

    const handleSelect = (profile: TenantProfile) => {
        setSelectedProfile(profile);
        setOpen(false);
        setQuery("");

        // Update URL
        const params = new URLSearchParams(searchParams);
        params.set('teacherId', profile.id);
        router.push(`?${params.toString()}`);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProfile(null);
        const params = new URLSearchParams(searchParams);
        params.delete('teacherId');
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="relative w-full max-w-sm" ref={containerRef}>
            <div
                onClick={() => setOpen(!open)}
                className={`flex items-center justify-between w-full px-4 py-2 bg-white/5 border rounded-xl cursor-pointer transition-all ${open ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10 hover:border-white/20'
                    } ${selectedProfile ? 'bg-amber-500/10 border-amber-500/30' : ''}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedProfile ? (
                        <>
                            <div className="size-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold shrink-0">
                                {selectedProfile.display_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-xs font-bold text-white truncate">{selectedProfile.display_name}</span>
                                <span className="text-[9px] text-amber-500/80 uppercase font-black tracking-wider">Tenant Activo</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Search size={14} className="text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Filtrar por Profesor...</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {selectedProfile && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors mr-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronsUpDown size={14} className="text-gray-500 opacity-50" />
                </div>
            </div>

            {open && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-white/5">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar nombre..."
                            className="w-full bg-transparent text-xs text-white placeholder:text-gray-600 focus:outline-none px-2 py-1"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {loading ? (
                            <div className="p-4 text-center text-[10px] text-gray-500 animate-pulse">Buscando...</div>
                        ) : profiles.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-gray-500">No se encontraron profesores</div>
                        ) : (
                            profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => handleSelect(profile)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group ${selectedProfile?.id === profile.id ? 'bg-amber-500/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className={`size-8 rounded-lg flex items-center justify-center text-xs font-black ${selectedProfile?.id === profile.id ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                                        }`}>
                                        {profile.display_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className={`text-xs font-bold truncate ${selectedProfile?.id === profile.id ? 'text-amber-500' : 'text-gray-300 group-hover:text-white'}`}>
                                            {profile.display_name}
                                        </p>
                                        <p className="text-[9px] text-gray-600 truncate">{profile.role}</p>
                                    </div>
                                    {selectedProfile?.id === profile.id && <Check size={14} className="text-amber-500" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
