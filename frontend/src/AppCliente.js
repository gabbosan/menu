import React, { useEffect, useState } from 'react';
import { listarProdutos, criarPedido } from './api';

export default function AppCliente() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]); // { produto, variacao, precoUnitario, quantidade }
  const [cliente, setCliente] = useState({ nome: '', telefone: '', email: '' });
  const [formaPagamento, setFormaPagamento] = useState('retirada');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarProdutos()
      .then(setProdutos)
      .catch(() => setErro('Não foi possível carregar o catálogo. Tente novamente mais tarde.'));
  }, []);

  function adicionarAoCarrinho(produto, variante) {
    setCarrinho((atual) => {
      const existente = atual.find((i) => i.produto === produto.nome && i.variacao === variante.variacao);
      if (existente) {
        return atual.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...atual, { produto: produto.nome, variacao: variante.variacao, precoUnitario: variante.preco, quantidade: 1 }];
    });
  }

  function removerItem(index) {
    setCarrinho((atual) => atual.filter((_, i) => i !== index));
  }

  const total = carrinho.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  async function enviarPedido(e) {
    e.preventDefault();
    setErro('');

    if (carrinho.length === 0) {
      setErro('Adicione ao menos um item ao pedido.');
      return;
    }
    if (!cliente.nome || !cliente.telefone) {
      setErro('Informe nome e telefone para continuar.');
      return;
    }

    setEnviando(true);
    try {
      await criarPedido({ cliente, itens: carrinho, formaPagamento });
      setMensagem('Pedido enviado com sucesso! A loja vai confirmar em breve.');
      setCarrinho([]);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app-cliente">
      <h1>MENU — Faça seu pedido</h1>

      {erro && <p className="erro">{erro}</p>}
      {mensagem && <p className="sucesso">{mensagem}</p>}

      <section>
        <h2>Catálogo</h2>
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <strong>{produto.nome}</strong>
            <div className="variantes">
              {produto.variantes.map((variante) => (
                <button
                  key={variante.variacao}
                  type="button"
                  onClick={() => adicionarAoCarrinho(produto, variante)}
                >
                  {variante.variacao} — R$ {variante.preco.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Carrinho</h2>
        {carrinho.length === 0 && <p>Nenhum item adicionado.</p>}
        <ul>
          {carrinho.map((item, index) => (
            <li key={index}>
              {item.produto} — {item.variacao} x{item.quantidade} = R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
              <button type="button" onClick={() => removerItem(index)}>Remover</button>
            </li>
          ))}
        </ul>
        <p><strong>Total: R$ {total.toFixed(2)}</strong></p>
      </section>

      <form onSubmit={enviarPedido}>
        <h2>Seus dados</h2>
        <input
          placeholder="Nome completo"
          value={cliente.nome}
          onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
        />
        <input
          placeholder="Telefone"
          value={cliente.telefone}
          onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
        />
        <input
          placeholder="E-mail (opcional)"
          value={cliente.email}
          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
        />

        <h2>Pagamento</h2>
        <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
          <option value="retirada">Pagar na retirada</option>
          <option value="pix">Pix online</option>
          <option value="cartao">Cartão online</option>
        </select>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}
