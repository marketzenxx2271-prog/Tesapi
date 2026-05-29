const express = require('express');
const app = express();
app.use(express.json());

const STATUS = {
    force: false,
    target_version: "",
    triggered_at: null,
    triggered_by: null
};

const API_KEY = "zenbot-secret-2025";

app.get('/ping', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});

app.get('/force-status', (req, res) => {
    res.json(STATUS);
});

app.post('/force-update', (req, res) => {
    const { version, by, key } = req.body;
    if (key !== API_KEY) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    if (!version) {
        return res.status(400).json({ ok: false, message: "version diperlukan" });
    }
    STATUS.force = true;
    STATUS.target_version = version;
    STATUS.triggered_at = new Date().toISOString();
    STATUS.triggered_by = by || "unknown";
    res.json({ ok: true, status: STATUS });
});

app.post('/force-reset', (req, res) => {
    const { key } = req.body;
    if (key !== API_KEY) {
        return res.status(401).json({ ok: false });
    }
    STATUS.force = false;
    STATUS.target_version = "";
    STATUS.triggered_at = null;
    STATUS.triggered_by = null;
    res.json({ ok: true });
});

module.exports = app;
