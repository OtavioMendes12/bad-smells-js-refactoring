// src/ReportGenerator.refactored.js
// Refatoração focada em reduzir duplicações, isolar responsabilidades (SRP) e diminuir complexidade cognitiva.
// Técnicas aplicadas: Extract Method, Decompose Conditional, Strategy (renderers por tipo), Guard Clauses.

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const renderer = getRenderer(reportType);
    const isAdmin = user?.role === 'ADMIN';
    const visibleItems = filterItemsByRole(items, user);

    let total = 0;
    renderer.begin(user);

    for (const item of visibleItems) {
      const priority = isAdmin && item.value > 1000; // regra exclusiva para admin
      renderer.row(item, user, priority);
      total += item.value;
    }

    renderer.footer(total);
    return renderer.output().trim();
  }
}

// --------- Domínio (regras de visibilidade) ---------
function filterItemsByRole(items, user) {
  if (!user || !Array.isArray(items)) return [];
  if (user.role === 'ADMIN') return items;
  if (user.role === 'USER') return items.filter(i => i.value <= 500);
  // Regra de fallback: usuários desconhecidos não veem nada
  return [];
}

// --------- Renderers (Strategy) ---------
function getRenderer(reportType) {
  switch (reportType) {
    case 'CSV':
      return new CsvRenderer();
    case 'HTML':
      return new HtmlRenderer();
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }
}

class CsvRenderer {
  constructor() {
    this._buf = [];
  }
  begin(user) {
    this._buf.push('ID,NOME,VALOR,USUARIO');
  }
  row(item, user /* , priority */) {
    this._buf.push(`${item.id},${escapeCsv(item.name)},${item.value},${user.name}`);
  }
  footer(total) {
    // Mantém compatibilidade de estrutura com versão original
    this._buf.push('');
    this._buf.push('Total,,');
    this._buf.push(`${total},,`);
  }
  output() {
    return this._buf.join('\n');
  }
}

class HtmlRenderer {
  constructor() {
    this._buf = [];
  }
  begin(user) {
    this._buf.push('<html><body>');
    this._buf.push('<h1>Relatório</h1>');
    this._buf.push(`<h2>Usuário: ${escapeHtml(user.name)}</h2>`);
    this._buf.push('<table>');
    this._buf.push('<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>');
  }
  row(item, user, priority) {
    const style = priority ? ' style="font-weight:bold;"' : '';
    this._buf.push(`<tr${style}><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.value)}</td></tr>`);
  }
  footer(total) {
    this._buf.push('</table>');
    this._buf.push(`<h3>Total: ${escapeHtml(total)}</h3>`);
    this._buf.push('</body></html>');
  }
  output() {
    return this._buf.join('\n');
  }
}

// Utilitários simples de escape
function escapeHtml(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeCsv(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}
