import { Hono } from 'hono';
import { db } from '../db';
import { users, dailyUsage, usageLogs } from '../db/schema';
import { sql, count, sum } from 'drizzle-orm';

const metricsRoutes = new Hono();

metricsRoutes.get('/metrics', async (c) => {
  const secret = c.req.query('key');
  const expected = process.env.METRICS_SECRET;
  if (expected && secret !== expected) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const today = new Date().toISOString().slice(0, 10);

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [todayRows] = await db
    .select({ count: count(), tokens: sum(dailyUsage.totalTokens) })
    .from(dailyUsage)
    .where(sql`date = ${today}`);
  const [todayRequests] = await db
    .select({ count: count(), inputTokens: sum(usageLogs.inputTokens), outputTokens: sum(usageLogs.outputTokens), cost: sum(usageLogs.costCents) })
    .from(usageLogs)
    .where(sql`date(created_at) = ${today}`);
  const [allTime] = await db
    .select({ count: count(), inputTokens: sum(usageLogs.inputTokens), outputTokens: sum(usageLogs.outputTokens), cost: sum(usageLogs.costCents) })
    .from(usageLogs);

  const recentLogs = await db
    .select()
    .from(usageLogs)
    .orderBy(sql`created_at DESC`)
    .limit(20);

  const html = c.req.header('Accept')?.includes('text/html');

  if (html) {
    const metrics = { totalUsers: totalUsers?.count || 0, todayRequests: todayRequests?.count || 0, todayInputTokens: todayRequests?.inputTokens || 0, todayOutputTokens: todayRequests?.outputTokens || 0, todayCostCents: todayRequests?.cost || 0, allTimeRequests: allTime?.count || 0, allTimeInputTokens: allTime?.inputTokens || 0, allTimeOutputTokens: allTime?.outputTokens || 0, allTimeCostCents: allTime?.cost || 0 };
    return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TextFlow — Métricas</title>
<style>
  :root { --tf-primary: #00e5cc; --tf-bg: #0f0f1a; --tf-surface: #1a1a2e; --tf-text: #e0e0e0; --tf-text-secondary: #a0a0b0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--tf-bg); color: var(--tf-text); padding: 2rem; min-height: 100vh; }
  h1 { color: var(--tf-primary); margin-bottom: 0.5rem; }
  .subtitle { color: var(--tf-text-secondary); margin-bottom: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .card { background: var(--tf-surface); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
  .card-label { font-size: 0.8rem; color: var(--tf-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
  .card-value { font-size: 2rem; font-weight: 700; color: var(--tf-primary); }
  table { width: 100%; border-collapse: collapse; background: var(--tf-surface); border-radius: 12px; overflow: hidden; }
  th, td { padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; }
  th { background: rgba(0,229,204,0.1); color: var(--tf-primary); font-weight: 600; }
  td { border-top: 1px solid rgba(255,255,255,0.05); color: var(--tf-text-secondary); }
  .auto-refresh { color: var(--tf-text-secondary); font-size: 0.75rem; margin-top: 1rem; }
</style>
</head>
<body>
<h1>TextFlow — Métricas</h1>
<p class="subtitle">${today} · ${new Date().toLocaleTimeString('pt-BR')}</p>
<div class="grid">
  <div class="card"><div class="card-label">Usuários</div><div class="card-value">${metrics.totalUsers}</div></div>
  <div class="card"><div class="card-label">Requests Hoje</div><div class="card-value">${metrics.todayRequests}</div></div>
  <div class="card"><div class="card-label">Tokens Hoje</div><div class="card-value">${(Number(metrics.todayInputTokens) + Number(metrics.todayOutputTokens)).toLocaleString()}</div></div>
  <div class="card"><div class="card-label">Custo Hoje</div><div class="card-value">R$${(Number(metrics.todayCostCents) / 100).toFixed(4)}</div></div>
  <div class="card"><div class="card-label">Requests Total</div><div class="card-value">${metrics.allTimeRequests}</div></div>
  <div class="card"><div class="card-label">Custo Total</div><div class="card-value">R$${(Number(metrics.allTimeCostCents) / 100).toFixed(2)}</div></div>
</div>
<h2 style="color:var(--tf-primary);margin-bottom:1rem;">Últimas Requisições</h2>
<table>
<tr><th>Horário</th><th>Ação</th><th>Modelo</th><th>Tokens In</th><th>Tokens Out</th><th>Custo</th></tr>
${recentLogs.map(l => `<tr><td>${l.createdAt}</td><td>${l.action}</td><td>${l.model}</td><td>${l.inputTokens}</td><td>${l.outputTokens}</td><td>R$${(l.costCents / 100).toFixed(4)}</td></tr>`).join('')}
</table>
<p class="auto-refresh">Recarregue a página para atualizar.</p>
</body>
</html>`);
  }

  return c.json({
    totalUsers: totalUsers?.count || 0,
    today: {
      requests: todayRequests?.count || 0,
      inputTokens: todayRequests?.inputTokens || 0,
      outputTokens: todayRequests?.outputTokens || 0,
      costCents: todayRequests?.cost || 0,
    },
    allTime: {
      requests: allTime?.count || 0,
      inputTokens: allTime?.inputTokens || 0,
      outputTokens: allTime?.outputTokens || 0,
      costCents: allTime?.cost || 0,
    },
    recentLogs,
  });
});

export { metricsRoutes };
