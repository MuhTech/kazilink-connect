import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/sync-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["JOB_SYNC_SECRET"];
        const given = request.headers.get("x-sync-secret");
        if (!secret || !given || given.length !== secret.length) return new Response("Unauthorized", { status: 401 });
        let diff = 0;
        for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
        if (diff !== 0) return new Response("Unauthorized", { status: 401 });
        const { runSync } = await import("@/lib/connectors/sync.server");
        const results = await runSync();
        return Response.json({ ok: true, results: results.map((r) => ({ source: r.source, status: r.status, inserted: r.inserted, updated: r.updated })) });
      },
    },
  },
});
