export default {
  async fetch(request: Request): Promise<Response> {
    // Allow browser requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const { shipmentId } = await request.json();

      if (!shipmentId) {
        return new Response(
          JSON.stringify({ error: "shipmentId required" }),
          { status: 400 }
        );
      }

      // 🔴 HARD-CODED (OK FOR PROJECT)
      const SUPABASE_URL = "https://iglkrwpruybqmdtqijet.supabase.co";
      const SERVICE_ROLE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGtyd3BydXlicW1kdHFpamV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM4ODUwMCwiZXhwIjoyMDc4OTY0NTAwfQ.XoPli_MQGwKKhOwwYmxEifKB07e4e6__86eTs-ET4m4";

      const vcId = `vc-${shipmentId}-${Date.now()}`;

      // Update ONLY vc fields
      const res = await fetch(`${SUPABASE_URL}/rest/v1/shipments?id=eq.${shipmentId}`, {
        method: "PATCH",
        headers: {
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          vc_status: "issued",
          vc_id: vcId,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(
          JSON.stringify({ error: err }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          vc_id: vcId,
          message: "VC issued successfully",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500 }
      );
    }
  },
};
