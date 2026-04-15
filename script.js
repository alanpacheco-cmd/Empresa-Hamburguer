// Carrinho
let carrinho = [];

document.addEventListener('DOMContentLoaded', () => {
  // Botões comprar
  document.querySelectorAll('.btn.comprar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      
      const nome = item.querySelector('h3')?.innerText || 'Produto';
      const precoText = item.querySelector('.preco')?.innerText || 'R$ 0,00';
      const preco = parseFloat(precoText.replace('R$ ', '').replace(',', '.'));

      carrinho.push({ nome, preco });
      atualizarCarrinho();
      alert(`${nome} adicionado ao carrinho!`);
    });
  });

  // Busca
  const busca = document.getElementById('busca');
  const itens = document.querySelectorAll('.item');

  if (busca) {
    busca.addEventListener('input', () => {
      const valor = busca.value.toLowerCase();

      itens.forEach(item => {
        const nome = item.querySelector('h3')?.innerText.toLowerCase() || '';
        item.style.display = nome.includes(valor) ? 'block' : 'none';
      });
    });
  }
});

function atualizarCarrinho() {
  const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
  console.log('Carrinho:', carrinho);
  console.log('Total: R$', total.toFixed(2));
}
