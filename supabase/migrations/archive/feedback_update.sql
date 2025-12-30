-- Añadir soporte para revisión a las entregas
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- Sembrar insignias (achievements) profesionales
-- Primero limpiamos los antiguos si existen (opcional, para asegurar consistencia con el diseño)
DELETE FROM public.achievements WHERE icon_name IN ('palette', 'brush', 'auto_awesome', 'draw', 'layers');

INSERT INTO public.achievements (title, description, icon_name, level_required) VALUES
('Maestro del Color', 'Dominio excepcional de armonías y contrastes en Procreate', 'palette', 3),
('Trazo Maestro', 'Líneas limpias y seguras que demuestran control total del Apple Pencil', 'brush', 2),
('Alquimista de Capas', 'Uso inteligente y organizado del flujo de trabajo por capas', 'layers', 3),
('Composición Épica', 'Gran sentido del equilibrio y dinamismo en la obra', 'auto_awesome', 4),
('Fisiologista Pro', 'Excelente entendimiento de la anatomía y proporciones', 'person', 5),
('Iluminador Estelar', 'Control avanzado de luces, sombras y profundidad', 'light_mode', 4)
ON CONFLICT DO NOTHING;
