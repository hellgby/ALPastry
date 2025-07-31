const express = require('express');
const path = require('path');
const db = require('./database');
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: true
}));

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas

// Página inicial com listagem de doces
app.get('/', (req, res) => {
  db.all('SELECT * FROM doces', (err, rows) => {
    if (err) return res.send('Erro no banco');
    res.render('home', { doces: rows });
  });
});

// Página do carrinho
app.get('/carrinho', (req, res) => {
  const carrinho = req.session.carrinho || [];
  const total = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
  res.render('carrinho', { carrinho, total });
});

// Finalizar pedido - envio de orçamento por e-mail
app.post('/finalizar', async (req, res) => {
  const { nome, email, observacoes } = req.body;
  const carrinho = req.session.carrinho || [];

  const listaProdutos = carrinho.map(item =>
    `${item.nome} - Quantidade: ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}`
  ).join('\n');

  const total = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  const textoEmail = `
Olá ${nome},

Recebemos seu orçamento com as seguintes informações:

Produtos:
${listaProdutos}

Total: R$ ${total.toFixed(2)}

Observações: ${observacoes || 'Nenhuma'}

Seu orçamento está sendo avaliado e em breve um de nossos vendedores entrará em contato para confirmar pagamento, data do evento e local de entrega.

Agradecemos pela preferência!

Atenciosamente,
Equipe ALPastry
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ana.candido09@aluno.ifce.edu.br',
      pass: 'jvsgrvvqsevknvfa',
    },
  });

  try {
    await transporter.sendMail({
      from: 'ALPastry <ana.candido09@aluno.ifce.edu.br>',
      to: email,
      subject: 'Orçamento Doce Maison',
      text: textoEmail,
    });

    res.redirect('/carrinho?status=enviado');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.redirect('/carrinho?status=erro');
  }
});

// Atualizar quantidade no carrinho
app.post('/atualizar-carrinho', (req, res) => {
  const { id, quantidade } = req.body;

  if (!req.session.carrinho) req.session.carrinho = [];

  const carrinho = req.session.carrinho;
  const item = carrinho.find(i => i.id == id);
  const novaQtd = parseInt(quantidade);

  if (item && !isNaN(novaQtd) && novaQtd > 0) {
    item.quantidade = novaQtd;
  } else if (item) {
    // Remove item se quantidade inválida ou <= 0
    const index = carrinho.indexOf(item);
    if (index > -1) carrinho.splice(index, 1);
  }

  res.status(200).send({ message: 'Quantidade atualizada', novaQuantidade: item ? item.quantidade : 0 });
});

// Adicionar produto ao carrinho
app.post('/AddCart', (req, res) => {
  const idProduto = req.body.id;
  const quantidade = parseInt(req.body.quantidade) || 1;

  db.get('SELECT * FROM doces WHERE id = ?', [idProduto], (err, produto) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar produto");
    }
    if (!produto) return res.status(404).send("Produto não encontrado");

    if (!req.session.carrinho) req.session.carrinho = [];

    const itemExistente = req.session.carrinho.find(p => p.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      produto.quantidade = quantidade;
      req.session.carrinho.push(produto);
    }

    res.status(200).send("Produto adicionado ao carrinho");
  });
});
app.post('/esvaziar-carrinho', (req, res) => {
  // Limpa o carrinho da sessão
  req.session.carrinho = [];

  // Opcional: também pode zerar o total
  req.session.total = 0;

  // Redireciona de volta para a página do carrinho
  res.redirect('/carrinho');
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
