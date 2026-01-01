'use server';
import { revalidatePath } from 'next/cache';
import { getSubmissionService } from '@/lib/infrastructure/di';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

/**
 * Sube una entrega de un estudiante al almacenamiento y la registra en la base de datos.
 */
export async function uploadSubmission(formData: FormData) {
    const supabase = await createClient();

    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    const lessonId = formData.get('lessonId') as string | null;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file || !studentId) {
        throw new Error('Archivo o ID de estudiante faltante');
    }

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${Date.now()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('art-portfolio')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Error al subir el archivo al almacenamiento');
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
        .from('art-portfolio')
        .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // 3. Insert into Database via Service
    try {
        const service = getSubmissionService();
        const dbData = await service.createSubmission({
            studentId,
            lessonId,
            title: title || 'Mi Obra Maestra',
            fileUrl,
            category: category || 'General'
        });

        revalidatePath('/gallery');
        revalidatePath('/dashboard');

        return { success: true, submission: dbData };
    } catch (dbError) {
        console.error('Error in uploadSubmission database phase:', dbError);
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from('art-portfolio').remove([filePath]);
        throw new Error('Error al registrar la entrega en la base de datos');
    }
}

/**
 * Obtiene el historial de entregas de un estudiante.
 */
export async function getStudentSubmissions(studentId: string) {
    const service = getSubmissionService();
    return await service.getStudentSubmissions(studentId);
}
