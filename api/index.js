module.exports = (req, res) => {
    // Set CORS headers biar aman
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Data status force update
    let forceStatus = {
        force: false,
        target_version: "",
        triggered_at: null,
        triggered_by: null
    };

    // GET /ping - cek kesehatan server
    if (req.method === 'GET' && req.url === '/ping') {
        return res.status(200).json({
            ok: true,
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    }

    // GET /force-status - cek status force update
    if (req.method === 'GET' && req.url === '/force-status') {
        return res.status(200).json(forceStatus);
    }

    // POST /force-update - trigger force update
    if (req.method === 'POST' && req.url === '/force-update') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const API_KEY = "zenbot-secret-2025";
                
                if (data.key !== API_KEY) {
                    return res.status(401).json({ ok: false, message: "Unauthorized" });
                }
                
                if (!data.version) {
                    return res.status(400).json({ ok: false, message: "version diperlukan" });
                }
                
                forceStatus = {
                    force: true,
                    target_version: data.version,
                    triggered_at: new Date().toISOString(),
                    triggered_by: data.by || "unknown"
                };
                
                res.status(200).json({ ok: true, status: forceStatus });
            } catch (e) {
                res.status(400).json({ ok: false, message: "Invalid JSON" });
            }
        });
        
        return;
    }

    // POST /force-reset - reset force update
    if (req.method === 'POST' && req.url === '/force-reset') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const API_KEY = "zenbot-secret-2025";
                
                if (data.key !== API_KEY) {
                    return res.status(401).json({ ok: false });
                }
                
                forceStatus = {
                    force: false,
                    target_version: "",
                    triggered_at: null,
                    triggered_by: null
                };
                
                res.status(200).json({ ok: true });
            } catch (e) {
                res.status(400).json({ ok: false });
            }
        });
        
        return;
    }

    // Default response
    res.status(200).json({
        ok: true,
        message: "Server Pusat Vercel Jalan",
        endpoints: ["/ping", "/force-status", "/force-update", "/force-reset"]
    });
};
