'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export async function uploadSubmission(formData: FormData) {
    const supabase = await createClient();

    const file = formData.get('file') as File;
    const learnerId = formData.get('learnerId') as string;
    const lessonId = formData.get('lessonId') as string | null;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file || !learnerId) {
        throw new Error('Archivo o ID de alumno faltante');
    }

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${learnerId}/${Date.now()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // 3. Insert into Database
    const { data: dbData, error: dbError } = await supabase
        .from('submissions')
        .insert({
            learner_id: learnerId,
            lesson_id: lessonId || null,
            title: title || 'Mi Obra Maestra',
            file_url: fileUrl,
            category: category || 'General',
            thumbnail_url: null // In future, we could generate thumbnails
        })
        .select()
        .single();

    if (dbError) {
        console.error('Error inserting submission:', dbError);
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from('art-portfolio').remove([filePath]);
        throw new Error('Error al registrar la entrega en la base de datos');
    }

    revalidatePath('/gallery');
    revalidatePath('/dashboard');

    return { success: true, submission: dbData };
}

export async function getLearnerSubmissions(learnerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('submissions')
        .select(`
            *,
            lessons (title)
        `)
        .eq('learner_id', learnerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }

    return data;
}
