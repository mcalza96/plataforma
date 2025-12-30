import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('🌱 Seeding "Fundamentos de Arte Digital"...');

    // 1. Create Course
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
            title: 'Fundamentos de Arte Digital',
            description: 'Curso demostrativo para TeacherOS. Aprende los pilares del arte conceptual.',
            published: true
        })
        .select()
        .single();

    if (courseError) throw courseError;
    console.log(`✅ Course created: ${course.id}`);

    // 2. Create Competency Nodes (The Graph)
    const nodesData = [
        { title: 'Línea y Trazo', description: 'Control del pulso y calidad de línea.', status: 'available' },
        { title: 'Formas Básicas', description: 'Construcción con primitivas geométricas.', status: 'locked' },
        { title: 'Volumen 3D', description: 'Perspectiva y profundidad.', status: 'locked' },
        { title: 'Luz y Sombra', description: 'Valores tonales y renderizado.', status: 'locked' },
        { title: 'Teoría del Color', description: 'Círculo cromático y armonías.', status: 'locked' }
    ];

    const nodes = [];
    for (const n of nodesData) {
        const { data: node, error } = await supabase
            .from('competency_nodes')
            .insert({
                course_id: course.id,
                title: n.title,
                description: n.description,
                status: n.status
            })
            .select()
            .single();

        if (error) throw error;
        nodes.push(node);
    }
    console.log(`✅ Created ${nodes.length} competency nodes.`);

    // 3. Create Connections (Edges)
    // Line -> Shape -> Volume -> Light -> Color
    for (let i = 0; i < nodes.length - 1; i++) {
        await supabase
            .from('competency_edges')
            .insert({
                source_id: nodes[i].id,
                target_id: nodes[i + 1].id
            });
    }
    console.log('✅ Edges connected.');

    // 4. Create Misconceptions (for "Luz y Sombra")
    const lightNode = nodes.find(n => n.title === 'Luz y Sombra');
    if (lightNode) {
        await supabase.from('misconceptions').insert([
            {
                competency_id: lightNode.id,
                title: 'Sombreado Sucio (Pillow Shading)',
                description: 'Uso excesivo de soft brushes y negro puro para sombrear.',
                feedback_template: 'Estás usando negro puro. Intenta sombrear con tonos fríos (azules/violetas) para mayor riqueza.'
            },
            {
                competency_id: lightNode.id,
                title: 'Fuente de Luz Inconsistente',
                description: 'Las sombras no siguen una dirección unificada.',
                feedback_template: 'Revisa la dirección de tu luz principal. Las sombras proyectadas deben ser opuestas a ella.'
            }
        ]);
        console.log('✅ Misconceptions added.');
    }

    console.log('🎉 Seeding completed successfully!');
}

seed().catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
});
