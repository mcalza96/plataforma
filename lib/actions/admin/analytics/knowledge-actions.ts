"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { KnowledgeGraphService } from "@/lib/application/services/analytics/knowledge-graph-service";

import { KnowledgeGraph } from "@/lib/domain/analytics-types";

export async function getGlobalKnowledgeMap(): Promise<KnowledgeGraph> {
    await validateAdmin();
    const supabase = await createClient();
    const service = new KnowledgeGraphService(supabase);

    return await service.getGlobalKnowledgeMap();
}
