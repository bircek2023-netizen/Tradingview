// Proxy sederhana ke TradingView Scanner (menghindari masalah CORS di browser)
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const market = req.query.m === 'global' ? 'global' : 'indonesia';
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const r = await fetch(`https://scanner.tradingview.com/${market}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://www.tradingview.com',
        'Referer': 'https://www.tradingview.com/'
      },
      body
    });
    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
};
