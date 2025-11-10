// __tests__/ReportGenerator.refactored.test.js
// Testes de regressão comportamental baseados nas regras descritas no enunciado.

import { ReportGenerator } from '../src/ReportGenerator.refactored.js';

describe('ReportGenerator (refactored)', () => {
  const db = {}; // mock simplificado
  const generator = new ReportGenerator(db);

  const admin = { name: 'Admin', role: 'ADMIN' };
  const user = { name: 'User', role: 'USER' };
  const items = [
    { id: 1, name: 'Alpha', value: 200 },
    { id: 2, name: 'Bravo', value: 1200 }, // prioridade se ADMIN no HTML
    { id: 3, name: 'Charlie', value: 500 },
    { id: 4, name: 'Delta', value: 800 }
  ];

  test('CSV para ADMIN contém todos os itens e total correto', () => {
    const out = generator.generateReport('CSV', admin, items);
    expect(out).toContain('ID,NOME,VALOR,USUARIO');
    expect(out).toContain('1,Alpha,200,Admin');
    expect(out).toContain('2,Bravo,1200,Admin');
    expect(out).toContain('3,Charlie,500,Admin');
    expect(out).toContain('4,Delta,800,Admin');
    // total = 200 + 1200 + 500 + 800 = 2700
    expect(out.trim().endsWith('2700,,')).toBe(true);
  });

  test('HTML para ADMIN contém todos os itens, com prioridade em value > 1000', () => {
    const out = generator.generateReport('HTML', admin, items);
    expect(out).toContain('<h2>Usuário: Admin</h2>');
    // linha em negrito para item de 1200
    expect(out).toContain('<tr style="font-weight:bold;"><td>2</td><td>Bravo</td><td>1200</td></tr>');
    // total correto
    expect(out).toContain('<h3>Total: 2700</h3>');
  });

  test('CSV para USER contém apenas itens com value <= 500, e total correto', () => {
    const out = generator.generateReport('CSV', user, items);
    expect(out).toContain('1,Alpha,200,User');
    expect(out).toContain('3,Charlie,500,User');
    expect(out).not.toContain('2,Bravo,1200,User');
    expect(out).not.toContain('4,Delta,800,User');
    // total = 200 + 500 = 700
    expect(out.trim().endsWith('700,,')).toBe(true);
  });

  test('HTML para USER não inclui itens > 500', () => {
    const out = generator.generateReport('HTML', user, items);
    // inclui 200 e 500
    expect(out).toContain('<td>1</td><td>Alpha</td><td>200</td>');
    expect(out).toContain('<td>3</td><td>Charlie</td><td>500</td>');
    // não inclui 800 e 1200
    expect(out).not.toContain('<td>2</td><td>Bravo</td><td>1200</td>');
    expect(out).not.toContain('<td>4</td><td>Delta</td><td>800</td>');
    expect(out).toContain('<h3>Total: 700</h3>');
  });
});
