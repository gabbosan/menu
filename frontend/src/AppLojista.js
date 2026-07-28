import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { login, listarPedidos, atualizarStatusPedido } from './api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export default function AppLojista() {
  const [token, setToken] = useState(localStorage.getItem('menu_lojista_token') || '');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!token) return;

    listarPedidos(token)
      .then(setPedidos)
      .catch((err) => {
        setErro(err.message);
        if (err.message.includes('inválido') || err.message.includes('expirado')) {
          sair();
        }
      });

    const socket = io(SOCKET_URL, { auth: { token, papel: 'lojista' } });
    socket.on('novo_pedido', (pedido) => setPedidos((atual) => [pedido, ...atual]));
    socket.on('pedido_atualizado', (pedidoAtualizado) => {
      setPedidos((atual) => atual.map((p) => (p._id === pedidoAtualizado._id ? pedidoAtualizado : p)));
    });
    socket.on('connect_error', (err) => setErro(`Conexão em tempo real falhou: ${err.message}`));

    return () => socket.disconnect();
  }, [token]);

  async function entrar(e) {
    e.preventDefault();
    setErroLogin('');
    try {
      const { token: novoToken } = await login(usuario, senha);
      localStorage.setItem('menu_lojista_token', novoToken);
      setToken(novoToken);
    } catch (err) {
      setErroLogin(err.message);
    }
  }

  function sair() {
    localStorage.removeItem('menu_lojista_token');
    setToken('');
    setPedidos([]);
  }

  async function mudarStatus(id, status) {
    try {
      await atualizarStatusPedido(token, id, status);
    } catch (err) {
      setErro(err.message);
    }
  }

  if (!token) {
    return (
      <div className="app-lojista login">
        <h1>MENU — Painel do Lojista</h1>
        <form onSubmit={entrar}>
          {erroLogin && <p className="erro">{erroLogin}</p>}
          <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-lojista">
      <header>
        <h1>MENU — Pedidos recebidos</h1>
        <button onClick={sair}>Sair</button>
      </header>

      {erro && <p className="erro">{erro}</p>}

      {pedidos.length === 0 && <p>Nenhum pedido recebido ainda.</p>}

      <ul className="lista-pedidos">
        {pedidos.map((pedido) => (
          <li key={pedido._id}>
            <strong>{pedido.cliente.nome}</strong> — {pedido.cliente.telefone}
            <ul>
              {pedido.itens.map((item, i) => (
                <li key={i}>{item.produto} ({item.variacao}) x{item.quantidade}</li>
              ))}
            </ul>
            <p>Total: R$ {pedido.valorTotal.toFixed(2)} — Pagamento: {pedido.formaPagamento}</p>
            <p>Status atual: <strong>{pedido.status}</strong></p>
            <select value={pedido.status} onChange={(e) => mudarStatus(pedido._id, e.target.value)}>
              <option value="recebido">Recebido</option>
              <option value="aguardando_pagamento">Aguardando pagamento</option>
              <option value="pago">Pago</option>
              <option value="em_preparo">Em preparo</option>
              <option value="pronto">Pronto</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
