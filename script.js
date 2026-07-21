// ---------- Carrinho de compras ----------
let carrinho = [];

// ---------- Usuários (login e cadastro) ----------
let usuarios = JSON.parse(localStorage.getItem('usuariosHotStation')) || [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

document.addEventListener('DOMContentLoaded', () => {

  atualizarTextoUsuario();
  atualizarCarrinho();

  // Abrir janelas de login e cadastro
  document.getElementById('btnLogin').addEventListener('click', () => {
    document.getElementById('overlayLogin').classList.add('ativo');
  });

  document.getElementById('btnCadastro').addEventListener('click', () => {
    document.getElementById('overlayCadastro').classList.add('ativo');
  });

  // Fechar janelas no "x"
  document.querySelectorAll('.fechar').forEach(botao => {
    botao.addEventListener('click', () => {
      document.getElementById(botao.dataset.fechar).classList.remove('ativo');
    });
  });

  // Cadastro de novo usuário
  document.getElementById('formCadastro').addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadSenha').value;

    const jaExiste = usuarios.some(usuario => usuario.email === email);
    if (jaExiste) {
      alert('Esse e-mail já está cadastrado. Tente fazer login.');
      return;
    }

    const novoUsuario = { nome, email, senha };
    usuarios.push(novoUsuario);
    localStorage.setItem('usuariosHotStation', JSON.stringify(usuarios));

    usuarioLogado = novoUsuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    atualizarTextoUsuario();

    document.getElementById('overlayCadastro').classList.remove('ativo');
    e.target.reset();
    alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}!`);
  });

  // Login de usuário existente
  document.getElementById('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;

    const encontrado = usuarios.find(usuario => usuario.email === email && usuario.senha === senha);
    if (!encontrado) {
      alert('E-mail ou senha incorretos. Se ainda não tem conta, clique em Cadastro.');
      return;
    }

    usuarioLogado = encontrado;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    atualizarTextoUsuario();

    document.getElementById('overlayLogin').classList.remove('ativo');
    e.target.reset();
    alert(`Login realizado! Bem-vindo(a) de volta, ${encontrado.nome}!`);
  });

  // Sair da conta (clicar no nome do usuário)
  document.getElementById('usuarioTexto').addEventListener('click', () => {
    if (usuarioLogado && confirm('Deseja sair da sua conta?')) {
      usuarioLogado = null;
      localStorage.removeItem('usuarioLogado');
      atualizarTextoUsuario();
    }
  });

  // Adicionar produto ao carrinho
  document.querySelectorAll('.btn.comprar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;

      const nome = item.querySelector('h3')?.innerText || 'Produto';
      const precoText = item.querySelector('.preco')?.innerText || 'R$ 0,00';
      const preco = parseFloat(precoText.replace('R$ ', '').replace(',', '.'));

      const existente = carrinho.find(produto => produto.nome === nome);
      if (existente) {
        existente.qtd++;
      } else {
        carrinho.push({ nome, preco, qtd: 1 });
      }

      atualizarCarrinho();
      alert(`${nome} adicionado ao carrinho!`);
    });
  });

  // Enviar Pedido via WhatsApp
  const btnFinalizar = document.getElementById('btnFinalizar');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      if (carrinho.length === 0) {
        alert('Seu carrinho está vazio! Adicione itens antes de finalizar.');
        return;
      }

      const telefone = '5547989145041';
      let mensagem = '🍔 *NOVO PEDIDO - HOT STATION* 🍔\n\n';

      if (usuarioLogado) {
        mensagem += `👤 *Cliente:* ${usuarioLogado.nome}\n\n`;
      }

      mensagem += '📋 *Itens do Pedido:*\n';
      
      let total = 0;
      carrinho.forEach(item => {
        const subtotal = item.preco * item.qtd;
        total += subtotal;
        mensagem += `• ${item.qtd}x ${item.nome} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      });

      mensagem += `\n💰 *Total:* R$ ${total.toFixed(2).replace('.', ',')}`;

      const url = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    });
  }

  // Busca (filtra apenas os hambúrgueres)
  const busca = document.getElementById('busca');
  const itensHamburguer = document.querySelectorAll('#listaHamburgueres .item');
  const semResultado = document.getElementById('semResultado');

  if (busca) {
    busca.addEventListener('input', () => {
      const valor = busca.value.toLowerCase();
      let algumVisivel = false;

      itensHamburguer.forEach(item => {
        const nome = item.querySelector('h3')?.innerText.toLowerCase() || '';
        const bate = nome.includes(valor);
        item.style.display = bate ? 'block' : 'none';
        if (bate) algumVisivel = true;
      });

      semResultado.style.display = algumVisivel ? 'none' : 'block';
    });
  }

  // Botões de ajuda (guia explicando cada função)
  const guias = {
    conta: 'Clique em "Login" se você já tem uma conta cadastrada. Clique em "Cadastro" para criar uma conta nova com nome, e-mail e senha.',
    busca: 'Digite o nome do hambúrguer que você procura (ex: "bacon") e a lista filtra automaticamente.',
    comprar: 'Clique em "Comprar" no produto desejado para adicionar ele ao seu carrinho, no canto direito da tela.',
    carrinho: 'Aqui aparecem os produtos adicionados. Clique em "Remover" para tirar um item do carrinho.'
  };

  document.querySelectorAll('.btn-ajuda').forEach(botao => {
    botao.addEventListener('click', () => {
      alert(guias[botao.dataset.ajuda] || 'Ajuda não disponível.');
    });
  });

});

// ---------- Funções auxiliares ----------

function atualizarCarrinho() {
  const divItens = document.getElementById('carrinhoItens');
  const spanTotal = document.getElementById('carrinhoTotal');
  if (!divItens || !spanTotal) return;

  if (carrinho.length === 0) {
    divItens.innerHTML = '<p class="carrinho-vazio">Carrinho vazio.</p>';
  } else {
    divItens.innerHTML = '';
    carrinho.forEach((produto, index) => {
      const subtotal = produto.preco * produto.qtd;
      const linha = document.createElement('div');
      linha.className = 'carrinho-item';
      linha.innerHTML = `
        <span>${produto.qtd}x ${produto.nome}</span>
        <span>R$ ${subtotal.toFixed(2).replace('.', ',')} <a href="#" class="remover-item" data-index="${index}">Remover</a></span>
      `;
      divItens.appendChild(linha);
    });
  }

  const total = carrinho.reduce((soma, produto) => soma + produto.preco * produto.qtd, 0);
  spanTotal.textContent = total.toFixed(2).replace('.', ',');

  document.querySelectorAll('.remover-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(e.target.dataset.index);
      carrinho.splice(index, 1);
      atualizarCarrinho();
    });
  });
}

function atualizarTextoUsuario() {
  const span = document.getElementById('usuarioTexto');
  if (!span) return;

  if (usuarioLogado) {
    span.textContent = `Olá, ${usuarioLogado.nome}`;
    span.title = 'Clique para sair da conta';
  } else {
    span.textContent = '';
    span.title = '';
  }
}