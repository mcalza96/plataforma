import React from 'react';
import EquityControlTower from '@/components/admin/analytics/EquityControlTower';
import { Shield } from 'lucide-react';

export const metadata = {
    title: 'Auditoría de Equidad | TeacherOS Admin',
    description: 'Monitor de sesgo algorítmico e integridad ética.',
};

export default function EquityAuditPage() {
    return (
        <div className="min-h-screen bg-[#0F0F0F] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-8">
                    <Shield className="w-3 h-3" />
                    Sala de Forense y Ética
                </div>

                <EquityControlTower />
            </div>
        </div>
    );
}
