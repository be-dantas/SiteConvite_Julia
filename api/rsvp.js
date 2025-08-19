// api/rsvp.js
export default async function handler(req, res) {
  // CORS para aceitar de qualquer origem (localhost, 127.0.0.1, seu domínio etc.)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const GAS_URL = process.env.GAS_URL;
  if (!GAS_URL) {
    return res.status(500).json({ ok: false, message: 'GAS_URL não configurada na Vercel' });
  }

  try {
    // req.body já vem parseado se você enviar JSON
    const { name, answer } = req.body || {};
    // Repassa para o Apps Script
    const upstream = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight no upstream
      body: JSON.stringify({ name, answer })
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      // Caso o GAS retorne HTML/erro
      return res.status(502).json({ ok: false, message: 'Resposta inválida do Apps Script', raw: text });
    }

    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Erro no proxy', error: String(err?.message || err) });
  }
}
