// Proxy: (1) TradingView Scanner (POST ?m=indonesia|global)  (2) candle Yahoo Finance (?y=BBCA.JK&i=5m&r=5d)
module.exports = async (req, res) => {
  const q = req.query || {};
  if (q.y) {
    const sym = String(q.y), itv = String(q.i || '5m'), rng = String(q.r || '5d');
    if (!/^[A-Za-z0-9.^-]{1,15}$/.test(sym) || !/^[0-9a-z]{1,4}$/.test(itv) || !/^[0-9a-z]{1,4}$/.test(rng)) {
      res.status(400).json({ error: 'bad params' }); return;
    }
    try {
      const u = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${itv}&range=${rng}&events=history`;
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await r.text();
      res.setHeader('Cache-Control', 's-maxage=30');
      res.status(r.status).setHeader('Content-Type', 'application/json').send(text);
    } catch (e) {
      res.status(502).json({ error: String(e) });
    }
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const market = q.m === 'global' ? 'global' : 'indonesia';
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
