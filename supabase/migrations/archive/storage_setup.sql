-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('art-portfolio', 'art-portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurarse de que el bucket sea público (por si ya existía pero no era público)
UPDATE storage.buckets
SET public = true
WHERE id = 'art-portfolio';

-- 3. Eliminar políticas existentes para evitar duplicados si se vuelve a ejecutar
-- (Es opcional, pero ayuda a mantener limpio el panel)
DROP POLICY IF EXISTS "Permitir carga pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir acceso público a archivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir borrar propios archivos" ON storage.objects;

-- 4. Crear política para permitir que CUALQUIER USUARIO (o anónimo) suba archivos
-- Nota: En producción, podrías querer restringir esto a usuarios autenticados.
CREATE POLICY "Permitir carga pública"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'art-portfolio');

-- 5. Crear política para permitir que CUALQUIER USUARIO vea los archivos (Acceso Público)
CREATE POLICY "Permitir acceso público a archivos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'art-portfolio');

-- 6. Crear política para permitir borrar archivos (necesario para el cleanup en storage-actions.ts)
CREATE POLICY "Permitir borrar archivos en art-portfolio"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'art-portfolio');
