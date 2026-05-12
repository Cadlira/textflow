import type { Context } from 'hono';

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TextFlow — Assistente de texto com IA em qualquer site</title>
<style>
  :root {
    --tf-primary: #00e5cc;
    --tf-bg: #0f0f1a;
    --tf-surface: #1a1a2e;
    --tf-text: #e0e0e0;
    --tf-text-secondary: #a0a0b0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--tf-bg);
    color: var(--tf-text);
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .tf-header {
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tf-logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--tf-primary);
    letter-spacing: -0.5px;
  }

  .tf-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }

  .tf-hero {
    text-align: center;
    padding: 5rem 1.5rem 4rem;
  }

  .tf-hero h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1.1;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--tf-primary) 0%, #00b8ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tf-hero p {
    font-size: 1.2rem;
    color: var(--tf-text-secondary);
    max-width: 560px;
    margin: 0 auto 2rem;
  }

  .tf-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 2rem;
    background: var(--tf-primary);
    color: #0f0f1a;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(0, 229, 204, 0.25);
  }

  .tf-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(0, 229, 204, 0.4);
  }

  .tf-section {
    padding: 4rem 0;
  }

  .tf-section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 3rem;
    letter-spacing: -0.5px;
  }

  .tf-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .tf-feature-card {
    background: var(--tf-surface);
    border-radius: 14px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }

  .tf-feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 229, 204, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .tf-feature-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
  }

  .tf-feature-card h3 {
    font-size: 1.15rem;
    margin-bottom: 0.5rem;
    color: var(--tf-primary);
  }

  .tf-feature-card p {
    font-size: 0.95rem;
    color: var(--tf-text-secondary);
  }

  .tf-pricing {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }

  .tf-price-card {
    background: var(--tf-surface);
    border-radius: 14px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    display: flex;
    flex-direction: column;
  }

  .tf-price-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 229, 204, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .tf-price-card.tf-price-featured {
    border-color: rgba(0, 229, 204, 0.4);
    box-shadow: 0 0 30px rgba(0, 229, 204, 0.1);
    position: relative;
  }

  .tf-price-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    translate: -50% 0;
    background: var(--tf-primary);
    color: #0f0f1a;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 1rem;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tf-price-card h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .tf-price-amount {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--tf-primary);
  }

  .tf-price-period {
    font-size: 0.9rem;
    color: var(--tf-text-secondary);
    margin-bottom: 1.5rem;
  }

  .tf-price-features {
    list-style: none;
    text-align: left;
    margin-bottom: 2rem;
    flex: 1;
  }

  .tf-price-features li {
    padding: 0.4rem 0;
    font-size: 0.9rem;
    color: var(--tf-text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tf-price-features li::before {
    content: '\u2713';
    color: var(--tf-primary);
    font-weight: 700;
  }

  .tf-price-btn {
    display: block;
    padding: 0.75rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .tf-price-btn:hover {
    transform: translateY(-2px);
  }

  .tf-price-btn-primary {
    background: var(--tf-primary);
    color: #0f0f1a;
    box-shadow: 0 0 20px rgba(0, 229, 204, 0.2);
  }

  .tf-price-btn-primary:hover {
    box-shadow: 0 0 30px rgba(0, 229, 204, 0.35);
  }

  .tf-price-btn-outline {
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    color: var(--tf-text);
  }

  .tf-price-btn-outline:hover {
    border-color: rgba(0, 229, 204, 0.5);
  }

  .tf-footer {
    margin-top: auto;
    padding: 2rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    text-align: center;
  }

  .tf-footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    color: var(--tf-text-secondary);
    font-size: 0.875rem;
  }

  .tf-footer a {
    color: var(--tf-primary);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .tf-footer a:hover {
    opacity: 0.8;
  }

  @media (max-width: 600px) {
    .tf-hero {
      padding: 3rem 1rem 2.5rem;
    }

    .tf-section {
      padding: 2.5rem 0;
    }

    .tf-section-title {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    .tf-features,
    .tf-pricing {
      grid-template-columns: 1fr;
    }
  }
</style>
</head>
<body>

<header class="tf-header">
  <span class="tf-logo">TextFlow</span>
</header>

<main>
  <section class="tf-hero">
    <h1>TextFlow</h1>
    <p>Assistente de texto com IA em qualquer site</p>
    <a href="https://chromewebstore.google.com/detail/textflow/placeholder" class="tf-btn">
      Instalar Extens\u00e3o
    </a>
  </section>

  <section class="tf-section tf-container">
    <h2 class="tf-section-title">Tudo o que voc\u00ea precisa para escrever melhor</h2>
    <div class="tf-features">
      <div class="tf-feature-card">
        <span class="tf-feature-icon">\u2728</span>
        <h3>Reescrever</h3>
        <p>Reformule qualquer texto com mais clareza, fluidez e impacto. Ideal para e-mails, posts e relat\u00f3rios.</p>
      </div>
      <div class="tf-feature-card">
        <span class="tf-feature-icon">\u{1F4DD}</span>
        <h3>Resumir</h3>
        <p>Transforme textos longos em resumos concisos, destacando os pontos essenciais em segundos.</p>
      </div>
      <div class="tf-feature-card">
        <span class="tf-feature-icon">\u2705</span>
        <h3>Corrigir</h3>
        <p>Corrija gram\u00e1tica, ortografia e pontua\u00e7\u00e3o automaticamente. Seu texto sempre impec\u00e1vel.</p>
      </div>
      <div class="tf-feature-card">
        <span class="tf-feature-icon">\u{1F3AD}</span>
        <h3>Mudar Tom</h3>
        <p>Ajuste o tom do texto entre formal, casual, profissional ou amig\u00e1vel para cada situa\u00e7\u00e3o.</p>
      </div>
      <div class="tf-feature-card">
        <span class="tf-feature-icon">\u{1F4A1}</span>
        <h3>Expandir</h3>
        <p>Expanda ideias curtas em textos completos e bem estruturados, mantendo o sentido original.</p>
      </div>
    </div>
  </section>

  <section class="tf-section tf-container">
    <h2 class="tf-section-title">Planos</h2>
    <div class="tf-pricing">
      <div class="tf-price-card">
        <h3>Gr\u00e1tis</h3>
        <p class="tf-price-amount">R$0</p>
        <p class="tf-price-period">para sempre</p>
        <ul class="tf-price-features">
          <li>5 usos por dia</li>
          <li>Todas as a\u00e7\u00f5es de texto</li>
          <li>Extens\u00e3o para Chrome</li>
        </ul>
        <a href="https://chromewebstore.google.com/detail/textflow/placeholder" class="tf-price-btn tf-price-btn-outline">Come\u00e7ar gr\u00e1tis</a>
      </div>

      <div class="tf-price-card tf-price-featured">
        <span class="tf-price-badge">Popular</span>
        <h3>Pro</h3>
        <p class="tf-price-amount">R$9,90</p>
        <p class="tf-price-period">por m\u00eas</p>
        <ul class="tf-price-features">
          <li>Uso ilimitado</li>
          <li>Todas as a\u00e7\u00f5es de texto</li>
          <li>Extens\u00e3o para Chrome</li>
          <li>Suporte priorit\u00e1rio</li>
        </ul>
        <a href="https://chromewebstore.google.com/detail/textflow/placeholder" class="tf-price-btn tf-price-btn-primary">Assinar Pro</a>
      </div>

      <div class="tf-price-card">
        <h3>Pro+</h3>
        <p class="tf-price-amount">R$19,90</p>
        <p class="tf-price-period">por m\u00eas</p>
        <ul class="tf-price-features">
          <li>Tudo do plano Pro</li>
          <li>Suporte a WhatsApp</li>
          <li>Suporte a LinkedIn</li>
          <li>Resposta mais r\u00e1pida</li>
        </ul>
        <a href="https://chromewebstore.google.com/detail/textflow/placeholder" class="tf-price-btn tf-price-btn-outline">Assinar Pro+</a>
      </div>
    </div>
  </section>
</main>

<footer class="tf-footer">
  <div class="tf-footer-inner">
    <span>&copy; 2026 TextFlow</span>
    <a href="https://github.com/anomalyco/textflow" target="_blank" rel="noopener">GitHub</a>
    <span>Feito com \u2764\ufe0f no Brasil</span>
  </div>
</footer>

</body>
</html>`;

export const landingRoute = (c: Context) => {
  return c.html(HTML);
};
