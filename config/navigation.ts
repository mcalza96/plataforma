export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export const marketingNav: NavItem[] = [
    { label: 'Inicio', href: '/', icon: 'home' },
    { label: 'Método', href: '/#metodo', icon: 'auto_fix' },
];

export const studentNav: NavItem[] = [
    { label: 'Misión Control', href: '/dashboard', icon: 'rocket_launch' },
    { label: 'Galería', href: '/gallery', icon: 'gallery_thumbnail' },
    { label: 'Panel del Profesor', href: '/teacher-dashboard', icon: 'school' },
    { label: 'Recursos', href: '/resources', icon: 'folder_open' },
];

export const adminNav: NavItem[] = [
    { label: 'Estadísticas', href: '/admin/stats', icon: 'leaderboard' },
    { label: 'Cursos', href: '/admin/courses', icon: 'brush' },
    { label: 'Correcciones', href: '/admin/submissions', icon: 'video_stable' },
    { label: 'Estudiantes', href: '/admin/users', icon: 'group' },
];
