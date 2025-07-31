// Controles do carrossel
const anterior = document.querySelector('.btn-anterior');
const proximo = document.querySelector('.btn-proximo');
const carrossel = document.querySelector('.produtos-carrossel');

if (anterior && proximo && carrossel) {
  anterior.addEventListener('click', () => {
    carrossel.scrollBy({ left: -300, behavior: 'smooth' });
  });

  proximo.addEventListener('click', () => {
    carrossel.scrollBy({ left: 300, behavior: 'smooth' });
  });
}

// Adicionar produtos ao carrinho
document.querySelectorAll('.form-add-carrinho').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = form.getAttribute('data-id');
    const quantidade = form.querySelector('input[name="quantidade"]').value;
    const inputQtd = form.querySelector('input[name="quantidade"]');

    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('quantidade', quantidade);

    try {
      const response = await fetch('/AddCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (response.ok) {
        inputQtd.value = 1;
      } else {
        console.error('Erro ao adicionar produto.');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro inesperado.');
    }
  });
});

// Atualizar quantidade no carrinho
document.querySelectorAll('.input-quantidade').forEach(input => {
  input.removeAttribute('readonly'); // garante que o campo é editável

  input.addEventListener('change', async () => {
    const form = input.closest('form');
    const id = form.querySelector('input[name="id"]').value;
    const quantidade = input.value;

    try {
      const response = await fetch('/atualizar-carrinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, quantidade })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.novaQuantidade !== undefined) {
          if (data.novaQuantidade > 0) {
            input.value = data.novaQuantidade; // Atualiza valor do backend
          } else {
            form.closest('.item-carrinho').remove(); // Remove item visualmente se excluído
          }
        }
      } else {
        console.error('Erro ao atualizar quantidade');
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  });
});

// Botões de incrementar/decrementar quantidade
document.querySelectorAll('.input-quantidade-wrapper').forEach(wrapper => {
  const input = wrapper.querySelector('.input-quantidade');
  const btnMais = wrapper.querySelector('.mais');
  const btnMenos = wrapper.querySelector('.menos');

  btnMais.addEventListener('click', () => {
    input.value = parseInt(input.value) + 1;
    input.dispatchEvent(new Event('change')); // atualiza backend
  });

  btnMenos.addEventListener('click', () => {
    if (parseInt(input.value) > parseInt(input.min)) {
      input.value = parseInt(input.value) - 1;
      input.dispatchEvent(new Event('change')); // atualiza backend
    }
  });
});
