export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export const marketingNav: NavItem[] = [
    { label: 'Inicio', href: '/', icon: 'home' },
    { label: 'Método', href: '/#metodo', icon: 'auto_fix' },
];

export const learnerNav: NavItem[] = [
    { label: 'Misión Control', href: '/dashboard', icon: 'rocket_launch' },
    { label: 'Galería', href: '/gallery', icon: 'gallery_thumbnail' },
    { label: 'Zona Padres', href: '/parent-dashboard', icon: 'family_restroom' },
    { label: 'Recursos', href: '/resources', icon: 'folder_open' },
];

export const adminNav: NavItem[] = [
    { label: 'Estadísticas', href: '/admin/stats', icon: 'leaderboard' },
    { label: 'Misiones', href: '/admin/courses', icon: 'brush' },
    { label: 'Correcciones', href: '/admin/submissions', icon: 'video_stable' },
    { label: 'Artistas', href: '/admin/users', icon: 'group' },
];
