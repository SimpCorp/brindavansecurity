// functions/api/sophos.js

export async function onRequest(context) {
  const { env } = context;

  // READ CREDENTIALS FROM ENVIRONMENT VARIABLES (Set in Cloudflare Dashboard)
  const SOPHOS_IP = env.SOPHOS_FIREWALL_IP || "https://192.168.1.1:4444";
  const API_USER = env.SOPHOS_API_USER || "mock_user";
  const API_PASS = env.SOPHOS_API_PASS || "mock_pass";

  // IF NO CREDENTIALS YET: Return realistic simulated live network data
  if (!env.SOPHOS_API_USER) {
    return new Response(
      JSON.stringify({
        status: "connected_mock",
        vpn_blocked_today: 1420,
        extension_stores_status: "Blocked",
        dpi_engine: "Active",
        vulnerabilities: [
          {
            id: "SEC-01",
            severity: "high",
            title: "Microsoft Extension Store accessible to students",
            desc: "Permits installation of proxy & VPN extensions, circumventing Sophos domain policies.",
            target: "Browser Policy"
          },
          {
            id: "SEC-02",
            severity: "medium",
            title: "DNS-over-HTTPS (DoH) fallback unblocked",
            desc: "Standard DNS queries encrypted via public resolvers, evading domain inspection.",
            target: "Sophos Firewall"
          },
          {
            id: "SEC-03",
            severity: "low",
            title: "NTP and NetBIOS outbound port exposure",
            desc: "Unrestricted broadcast protocols leaking internal subnet topology.",
            target: "Local Subnet"
          }
        ]
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // ONCE YOU GET ADMIN ACCESS: Real Sophos REST API Request
  try {
    const xmlPayload = `
      <Response>
        <Login><Username>${API_USER}</Username><Password>${API_PASS}</Password></Login>
        <Get><SecurityPolicy></SecurityPolicy></Get>
      </Response>`;

    const response = await fetch(`${SOPHOS_IP}/webconsole/APIController`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `reqxml=${encodeURIComponent(xmlPayload)}`
    });

    const data = await response.text();
    return new Response(JSON.stringify({ status: "success", data }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
