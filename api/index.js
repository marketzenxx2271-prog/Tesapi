// STATE disimpan di luar handler (tapi ingat, ini tetap ga persisten di Vercel)
let forceStatus = {
    force: false,
    target_version: "",
    triggered_at: null,
    triggered_by: null
};

module.exports = (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const API_KEY = "zenbot-secret-2025";
    
    // Ambil API Key dari HEADER (bukan body!)
    const apiKey = req.headers['x-api-key'];

    // GET /ping
    if (req.method === 'GET' && req.url === '/ping') {
        return res.status(200).json({
            ok: true,
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    }

    // GET /force-status
    if (req.method === 'GET' && req.url === '/force-status') {
        return res.status(200).json(forceStatus);
    }

    // POST /force-update
    if (req.method === 'POST' && req.url === '/force-update') {
        // Validasi API Key dari HEADER
        if (apiKey !== API_KEY) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (!data.version) {
                    return res.status(400).json({ ok: false, message: "version diperlukan" });
                }
                
                // Update state
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

    // POST /force-reset
    if (req.method === 'POST' && req.url === '/force-reset') {
        if (apiKey !== API_KEY) {
            return res.status(401).json({ ok: false });
        }

        forceStatus = {
            force: false,
            target_version: "",
            triggered_at: null,
            triggered_by: null
        };
        
        return res.status(200).json({ ok: true });
    }

    // Default
    res.status(200).json({ ok: true, message: "Server running" });
};
