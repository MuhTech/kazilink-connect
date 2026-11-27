import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/sync-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { runSync } = await import("@/lib/connectors/sync.server");
        const results = await runSync();
        return Response.json({ ok: true, results: results.map((r) => ({ source: r.source, status: r.status, inserted: r.inserted, updated: r.updated })) });
      },
    },
  },
});
