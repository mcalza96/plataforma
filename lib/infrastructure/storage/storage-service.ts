import { supabase } from '../../supabase';

export interface StorageOptions {
    bucket?: string;
    folder?: string;
    cacheControl?: string;
    upsert?: boolean;
}

const DEFAULT_OPTIONS: StorageOptions = {
    bucket: 'art-portfolio',
    folder: 'resources',
    cacheControl: '3600',
    upsert: false
};

export class StorageService {
    /**
     * Uploads a file to the specified bucket and folder.
     */
    static async uploadFile(file: File, options?: StorageOptions) {
        const config = { ...DEFAULT_OPTIONS, ...options };

        const fileExt = file.name.split('.').pop();
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${config.folder}/${cleanFileName}`;

        const { data, error } = await supabase.storage
            .from(config.bucket!)
            .upload(filePath, file, {
                cacheControl: config.cacheControl,
                upsert: config.upsert
            });

        if (error) throw error;

        return {
            path: filePath,
            ...this.getPublicUrl(filePath, config.bucket!)
        };
    }

    /**
     * Generates a public URL for a file path.
     */
    static getPublicUrl(path: string, bucket: string = DEFAULT_OPTIONS.bucket!) {
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return { publicUrl };
    }

    /**
     * Deletes a file from the storage.
     */
    static async deleteFile(path: string, bucket: string = DEFAULT_OPTIONS.bucket!) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
        return true;
    }
}
