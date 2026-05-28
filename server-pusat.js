const express = require('express');
const app = express();
app.use(express.json());

// STATE
const STATUS = {
    force: false,
    target_version: "",
    triggered_at: null,
    triggered_by: null
};

// API Key
const API_KEY = process.env.SERVER_API_KEY || "zenbot-secret-2025";

function authMiddleware(req, res, next) {
    const key = req.headers["x-api-key"];
    if (!key || key !== API_KEY) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    next();
}

// Routes
app.get('/force-status', (req, res) => {
    res.json(STATUS);
});

app.post('/force-update', authMiddleware, (req, res) => {
    const { version, by } = req.body;
    if (!version) {
        return res.status(400).json({ ok: false, message: "version diperlukan" });
    }
    STATUS.force = true;
    STATUS.target_version = version;
    STATUS.triggered_at = new Date().toISOString();
    STATUS.triggered_by = by || "unknown";
    console.log(`🔥 Force update ke ${version} oleh ${STATUS.triggered_by}`);
    res.json({ ok: true, status: STATUS });
});

app.post('/force-reset', authMiddleware, (req, res) => {
    STATUS.force = false;
    STATUS.target_version = "";
    STATUS.triggered_at = null;
    STATUS.triggered_by = null;
    console.log(`✅ Force update reset`);
    res.json({ ok: true });
});

app.get('/ping', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});

const PORT = process.env.PORT || 4023;
app.listen(PORT, () => {
    console.log(`🚀 Server-Pusat running on port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
});