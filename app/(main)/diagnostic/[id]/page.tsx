import React from 'react';
import { notFound } from 'next/navigation';
import { getAssessment } from '@/lib/assessment-actions';
import AssessmentClient from '@/components/assessment/AssessmentClient';

interface AssessmentPageProps {
    params: Promise<{ id: string }>;
}

/**
 * AssessmentPage
 * Server Component that loads the diagnostic probe and renders the client interface.
 */
export default async function AssessmentPage({ params }: AssessmentPageProps) {
    const { id } = await params;

    // 1. Fetch Assessment data
    const probe = await getAssessment(id);

    // 2. Guard: Handle not found
    if (!probe) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#0F0F0F] pt-20">
            <AssessmentClient probe={probe} />
        </main>
    );
}
