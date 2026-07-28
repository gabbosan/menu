const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erro || 'Erro na requisição.');
  }
  return data;
}

export function listarProdutos() {
  return request('/api/produtos');
}

export function criarPedido(pedido) {
  return request('/api/pedidos', { method: 'POST', body: JSON.stringify(pedido) });
}

export function login(usuario, senha) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ usuario, senha }) });
}

export function listarPedidos(token) {
  return request('/api/pedidos', { headers: { Authorization: `Bearer ${token}` } });
}

export function atualizarStatusPedido(token, id, status) {
  return request(`/api/pedidos/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
}
