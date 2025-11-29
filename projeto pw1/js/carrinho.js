(function () {
    'use strict';
  
    // ---- Utilitários ----
    function moedaBR(valor) {
      try {
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      } catch (e) {
        return 'R$ ' + (Number(valor) || 0).toFixed(2);
      }
    }
  
    function lerCarrinho() {
      var texto = localStorage.getItem('carrinho');
      if (!texto) return [];
      try {
        var dados = JSON.parse(texto);
        return Array.isArray(dados) ? dados : [];
      } catch (e) {
        return [];
      }
    }
  
    function salvarCarrinho(carrinho) {
      try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
      } catch (e) {}
    }
  
    // ---- Ações ----
    function adicionarAoCarrinho(nome, preco) {
      var carrinho = lerCarrinho();
      var id = Date.now() + '_' + carrinho.length;
      carrinho.push({ id: id, nome: String(nome || 'Produto'), preco: Number(preco) || 0 });
      salvarCarrinho(carrinho);
      alert(String(nome) + ' adicionado ao carrinho!');
      atualizarBadgeCarrinho(); // se existir badge nas páginas de produtos
    }
  
    function removerDoCarrinho(id) {
      var carrinho = lerCarrinho();
      var novo = [];
      for (var i = 0; i < carrinho.length; i++) {
        if (String(carrinho[i].id) !== String(id)) {
          novo.push(carrinho[i]);
        }
      }
      salvarCarrinho(novo);
      exibirCarrinho();
      atualizarBadgeCarrinho();
    }
  
    function limparCarrinho() {
      salvarCarrinho([]);
      exibirCarrinho();
      atualizarBadgeCarrinho();
    }
  
    // ---- Exibição na página de pagamento ----
    function exibirCarrinho() {
      var carrinho = lerCarrinho();
      var lista = document.getElementById('lista-produtos');
      var totalEl = document.getElementById('total');
      var descontoEl = document.getElementById('desconto');
      var parcelasEl = document.getElementById('parcelas');
      var selectPagamento = document.getElementById('pagamento');
  
      if (!lista || !totalEl || !descontoEl || !parcelasEl || !selectPagamento) {
        return; // não está na página de pagamento
      }
  
      // Monta lista
      lista.innerHTML = '';
      var total = 0;
      for (var i = 0; i < carrinho.length; i++) {
        var item = carrinho[i];
        var li = document.createElement('li');
        li.className = 'item-carrinho';
  
        var span = document.createElement('span');
        span.textContent = item.nome + ' — ' + moedaBR(item.preco);
  
        var btnRemover = document.createElement('button');
        btnRemover.type = 'button';
        btnRemover.className = 'btn-remover';
        btnRemover.setAttribute('data-id', String(item.id));
        btnRemover.textContent = 'Remover';
  
        li.appendChild(span);
        li.appendChild(btnRemover);
        lista.appendChild(li);
  
        total += Number(item.preco) || 0;
      }
  
      // Totais iniciais (parcelado por padrão)
      totalEl.textContent = 'Total: ' + moedaBR(total);
      descontoEl.textContent = ''; // preenchido conforme forma de pagamento
      var parcela10x = total > 0 ? (total / 10) : 0;
      parcelasEl.textContent = 'Parcelado: até 10x de ' + moedaBR(parcela10x);
  
      // Botões remover
      var botoes = lista.querySelectorAll('.btn-remover');
      for (var j = 0; j < botoes.length; j++) {
        botoes[j].addEventListener('click', function (ev) {
          var id = ev.target.getAttribute('data-id');
          removerDoCarrinho(id);
        });
      }
  
      // Atualiza desconto/parcelas ao escolher forma de pagamento
      selectPagamento.onchange = function () {
        var forma = selectPagamento.value;
        if (forma === 'debito' || forma === 'credito') {
          var desconto = total * 0.10;
          var totalComDesconto = total - desconto;
          descontoEl.textContent = 'Desconto à vista (10%): -' + moedaBR(desconto) +
                                   ' → Total com desconto: ' + moedaBR(totalComDesconto);
          parcelasEl.textContent = ''; // à vista não exibe parcelas
        } else if (forma === 'parcelado') {
          descontoEl.textContent = '';
          var p = total > 0 ? (total / 10) : 0;
          parcelasEl.textContent = 'Parcelado: até 10x de ' + moedaBR(p);
        }
      };
  
      // Insere botão limpar carrinho
      inserirBotaoLimparCarrinho();
    }
  
    function inserirBotaoLimparCarrinho() {
      var form = document.querySelector('.formulario-pagamento form');
      if (!form) return;
  
      var jaExiste = document.getElementById('btn-limpar-carrinho');
      if (jaExiste) return;
  
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-limpar-carrinho';
      btn.className = 'btn btn-limpar';
      btn.textContent = 'Limpar Carrinho';
      btn.style.marginTop = '10px';
      btn.addEventListener('click', limparCarrinho);
      form.appendChild(btn);
    }
  
    // ---- Badge/ícone nas páginas de produtos (hardware/periféricos) ----
    function atualizarBadgeCarrinho() {
      var contador = document.getElementById('contador-carrinho');
      if (contador) {
        var carrinho = lerCarrinho();
        contador.textContent = String(carrinho.length);
      }
    }
  
    // Expondo funções globalmente
    window.adicionarAoCarrinho = adicionarAoCarrinho;
    window.exibirCarrinho = exibirCarrinho;
    window.removerDoCarrinho = removerDoCarrinho;
    window.limparCarrinho = limparCarrinho;
    window.atualizarBadgeCarrinho = atualizarBadgeCarrinho;
  })();