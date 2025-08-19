// api/rsvp.js - Vercel Serverless Function (Node runtime)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Use POST' });
  }

  const GAS_URL = process.env.GAS_URL;
  if (!GAS_URL) {
    return res.status(500).json({ ok: false, message: 'GAS_URL não configurada na Vercel' });
  }

  try {
    // Body pode já vir como objeto (JSON) ou string
    let payload = req.body;
    if (!payload || typeof payload !== 'object') {
      try { payload = JSON.parse(req.body || '{}'); } catch { payload = {}; }
    }

    // Repassa para o Apps Script
    const gRes = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // GAS aceita JSON
      body: JSON.stringify(payload),
    });

    const gText = await gRes.text();
    let gJson;
    try { gJson = JSON.parse(gText); }
    catch {
      return res.status(502).json({ ok: false, message: 'Resposta inválida do Apps Script', raw: gText });
    }

    // Propaga status 200 se o GAS respondeu ok; senão 500
    return res.status(gRes.ok ? 200 : 500).json(gJson);

  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Falha ao falar com o Apps Script', error: String(err) });
  }
}
