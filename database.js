const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./doces.db');
const dbc = new sqlite3.Database('./cliente.db');

dbc.serialize(() => {
  dbc.run(`CREATE TABLE IF NOT EXISTS client (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    senha TEXT,
    email TEXT
  )`)
}
)

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS doces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco REAL,
    imagem TEXT,
    descricao TEXT,
    categoria TEXT
  )`);

  db.get('SELECT COUNT(*) AS total FROM doces', (err, row) => {
    if (err) {
      console.error('Erro ao verificar a quantidade de doces:', err.message);
      return;
    }
    console.log('Doces já no inventário');


    if (row.total === 0) {
      const doces = [
        // Donuts
        ['Chocolate Belga com Granulado', 9.90, 'Donut1.png', 'Donut mergulhado em chocolate premium e granulado crocante.', 'donut'],
        ['Clássico Glacê de Baunilha', 8.50, 'Donut2.png', 'Cobertura suave e leitosa, perfeito para quem ama o tradicional.', 'donut'],
        ['Clássico Açucarado', 9.50, 'Donut3.png', 'Massa fofinha e suave de baunilha, coberto com açúcar mascavo.', 'donut'],

        // Croissants
        ['Framboesa e White Chocolate', 13.80, 'Croi1.png', 'Equilíbrio frutado com cacau.', 'croissant'],
        ['Nutella e Banana', 14.50, 'Croi2.png', 'Combinação perfeita de avelã e fruta.', 'croissant'],
        ['Pistache granulado', 12.00, 'Croi3.png', 'Apenas para os exóticos.', 'croissant'],

        // Sonhos
        ['Chocolate 70% Cacau', 8.90, 'Sonho1.png', 'Para os amantes de chocolate intenso.', 'sonho'],
        ['Creme Branco', 7.50, 'Sonho2.png', 'Recheio delicado com toque de baunilha.', 'sonho'],
        ['Doce de Leite', 8.60, 'Sonho3.png', 'Recheio cremoso e levemente caramelizado.', 'sonho']
      ];
      console.log('Doces adicionados ao inventário');
      doces.forEach(d => {
        db.run('INSERT INTO doces (nome, preco, imagem, descricao, categoria) VALUES (?, ?, ?, ?, ?)', d);
      });
    }
  });
});

module.exports = db;
