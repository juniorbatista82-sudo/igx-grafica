'use client';
import { useState, useEffect } from 'react';

// Tipos de Permissões
type Permissao = 'dashboard' | 'pedidos' | 'clientes' | 'estoque' | 'financeiro' | 'usuarios';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  permissoes: Permissao[];
}

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

interface OrdemServico {
  id: number;
  cliente: string;
  produto: string;
  detalhes: string;
  valor: number;
  status: 'Aberto' | 'Em Andamento' | 'Finalizado';
  data: string;
}

interface Insumo {
  id: number;
  nome: string;
  quantidade: number;
  unidade: string;
  minimo: number;
}

interface FinanceiroItem {
  id: number;
  descricao: string;
  tipo: 'Entrada' | 'Saida';
  valor: number;
  data: string;
}

export default function Home() {
  // Usuário Ativo
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<Permissao>('dashboard');

  // Estados do Sistema
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([]);

  // Form de Novo Usuário
  const [nomeUser, setNomeUser] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [cargoUser, setCargoUser] = useState('Atendente');
  const [permSel, setPermSel] = useState<Permissao[]>(['pedidos', 'clientes']);

  // Form Orçamento
  const [clienteSel, setClienteSel] = useState<string>('');
  const [tipoProduto, setTipoProduto] = useState<string>('lona');
  const [largura, setLargura] = useState<number>(1);
  const [altura, setAltura] = useState<number>(1);
  const [quantidade, setQuantidade] = useState<number>(10);
  const [precoUnidade, setPrecoUnidade] = useState<number>(50);

  // Form Cliente
  const [novoNome, setNovoNome] = useState('');
  const [novoTel, setNovoTel] = useState('');
  const [novoEmail, setNovoEmail] = useState('');

  // Carregar dados salvos
  useEffect(() => {
    const u = localStorage.getItem('igx_usuarios');
    if (u) {
      const lista: Usuario[] = JSON.parse(u);
      setUsuarios(lista);
      setUsuarioAtual(lista[0] || null);
    } else {
      const adminDefault: Usuario = {
        id: 1,
        nome: 'Administrador IGX',
        email: 'admin@igxgrafica.com',
        cargo: 'Administrador Master',
        permissoes: ['dashboard', 'pedidos', 'clientes', 'estoque', 'financeiro', 'usuarios']
      };
      setUsuarios([adminDefault]);
      setUsuarioAtual(adminDefault);
      localStorage.setItem('igx_usuarios', JSON.stringify([adminDefault]));
    }

    const c = localStorage.getItem('igx_clientes'); if (c) setClientes(JSON.parse(c));
    const o = localStorage.getItem('igx_ordens'); if (o) setOrdens(JSON.parse(o));
    const i = localStorage.getItem('igx_insumos');
    if (i) setInsumos(JSON.parse(i)); else {
      const defInsumos: Insumo[] = [
        { id: 1, nome: 'Bobina Lona 440g', quantidade: 50, unidade: 'm', minimo: 10 },
        { id: 2, nome: 'Adesivo Vinil Brilho', quantidade: 20, unidade: 'm', minimo: 5 },
        { id: 3, nome: 'Papel Couché 150g', quantidade: 2000, unidade: 'folhas', minimo: 500 }
      ];
      setInsumos(defInsumos);
    }
    const f = localStorage.getItem('igx_financeiro'); if (f) setFinanceiro(JSON.parse(f));
  }, []);

  // Salvar alterações
  useEffect(() => { localStorage.setItem('igx_usuarios', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('igx_clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('igx_ordens', JSON.stringify(ordens)); }, [ordens]);
  useEffect(() => { localStorage.setItem('igx_insumos', JSON.stringify(insumos)); }, [insumos]);
  useEffect(() => { localStorage.setItem('igx_financeiro', JSON.stringify(financeiro)); }, [financeiro]);

  // Garantir que o usuário só fique em aba que ele tem permissão
  useEffect(() => {
    if (usuarioAtual && !usuarioAtual.permissoes.includes(abaAtiva)) {
      setAbaAtiva(usuarioAtual.permissoes[0] || 'pedidos');
    }
  }, [usuarioAtual, abaAtiva]);

  // Cálculos
  const areaTotal = largura * altura;
  const valorTotalOrçamento = tipoProduto === 'lona' || tipoProduto === 'adesivo'
    ? areaTotal * quantidade * precoUnidade
    : quantidade * precoUnidade;

  const totalEntradas = financeiro.filter(x => x.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoFinanceiro = totalEntradas - financeiro.filter(x => x.tipo === 'Saida').reduce((acc, curr) => acc + curr.valor, 0);

  // Ações Usuários
  const handleTogglePermissao = (p: Permissao) => {
    if (permSel.includes(p)) {
      setPermSel(permSel.filter(item => item !== p));
    } else {
      setPermSel([...permSel, p]);
    }
  };

  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeUser || permSel.length === 0) return alert('Informe o nome e selecione ao menos uma permissão!');
    
    const novo: Usuario = {
      id: Date.now(),
      nome: nomeUser,
      email: emailUser || 'user@igxgrafica.com',
      cargo: cargoUser,
      permissoes: permSel
    };

    setUsuarios([...usuarios, novo]);
    setNomeUser(''); setEmailUser('');
    alert('Novo usuário cadastrado com sucesso!');
  };

  const handleCadastrarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome) return;
    setClientes([...clientes, { id: Date.now(), nome: novoNome, telefone: novoTel, email: novoEmail }]);
    setNovoNome(''); setNovoTel(''); setNovoEmail('');
    alert('Cliente cadastrado!');
  };

  const handleGerarOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel) return alert('Selecione um cliente!');

    const novaOS: OrdemServico = {
      id: Date.now(),
      cliente: clienteSel,
      produto: tipoProduto.toUpperCase(),
      detalhes: tipoProduto === 'lona' || tipoProduto === 'adesivo' ? `${largura}m x ${altura}m (${quantidade}un)` : `${quantidade}un`,
      valor: valorTotalOrçamento,
      status: 'Aberto',
      data: new Date().toLocaleDateString('pt-BR')
    };

    setOrdens([novaOS, ...ordens]);
    setFinanceiro([{ id: Date.now(), descricao: `Pedido #${novaOS.id.toString().slice(-4)} - ${clienteSel}`, tipo: 'Entrada', valor: valorTotalOrçamento, data: new Date().toLocaleDateString('pt-BR') }, ...financeiro]);
    setClienteSel('');
    alert('Pedido gerado!');
  };

  const MudarStatusOS = (id: number, novoStatus: 'Aberto' | 'Em Andamento' | 'Finalizado') => {
    setOrdens(ordens.map(o => o.id === id ? { ...o, status: novoStatus } : o));
  };

  const temPermissao = (p: Permissao) => usuarioAtual?.permissoes.includes(p);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black p-4 md:p-8 font-sans selection:bg-black selection:text-amber-400">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topo / Header da IGX Gráfica com Seletor de Perfil */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/30 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-black text-amber-400 px-3.5 py-1 rounded-lg font-black text-xl shadow-xl tracking-widest border border-amber-300/30">
              IGX
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-black">
                GRÁFICA
              </h1>
              <p className="text-xs text-black/80 font-bold">Gestão de Perfis & Acessos</p>
            </div>
          </div>

          {/* Troca Rápida de Usuário para Testar Perfis */}
          <div className="flex items-center gap-2 bg-black/90 text-amber-400 p-2 rounded-xl shadow-lg border border-black/20 text-xs">
            <span className="font-bold text-amber-200">Usuário Atual:</span>
            <select 
              value={usuarioAtual?.id || ''} 
              onChange={(e) => {
                const u = usuarios.find(x => x.id === Number(e.target.value));
                if (u) setUsuarioAtual(u);
              }}
              className="bg-amber-400 text-black font-extrabold px-2 py-1 rounded outline-none cursor-pointer"
            >
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome} ({u.cargo})</option>
              ))}
            </select>
          </div>

          {/* Navegação Filtrada por Permissão */}
          <div className="flex flex-wrap bg-amber-600/30 backdrop-blur-md p-1.5 rounded-xl border border-black/20 gap-1 text-sm shadow-lg">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'pedidos', label: 'Pedidos / O.S.' },
              { id: 'clientes', label: 'Clientes' },
              { id: 'estoque', label: 'Estoque' },
              { id: 'financeiro', label: 'Financeiro' },
              { id: 'usuarios', label: 'Gestão Usuários' },
            ].filter(item => temPermissao(item.id as Permissao)).map(item => (
              <button 
                key={item.id}
                onClick={() => setAbaAtiva(item.id as Permissao)}
                className={`px-4 py-2 rounded-lg font-extrabold transition-all duration-300 ${
                  abaAtiva === item.id 
                    ? 'bg-black text-amber-400 shadow-xl scale-105' 
                    : 'text-black/80 hover:text-black hover:bg-amber-300/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. DASHBOARD */}
        {abaAtiva === 'dashboard' && temPermissao('dashboard') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Total Faturado</p>
                <p className="text-2xl font-black text-emerald-800 mt-2">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Pedidos em Aberto</p>
                <p className="text-2xl font-black text-amber-900 mt-2">{ordens.filter(o => o.status === 'Aberto').length}</p>
              </div>
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Em Produção</p>
                <p className="text-2xl font-black text-amber-950 mt-2">{ordens.filter(o => o.status === 'Em Andamento').length}</p>
              </div>
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Pedidos Finalizados</p>
                <p className="text-2xl font-black text-emerald-900 mt-2">{ordens.filter(o => o.status === 'Finalizado').length}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. PEDIDOS / OS */}
        {abaAtiva === 'pedidos' && temPermissao('pedidos') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 p-6 rounded-2xl border border-black/20 space-y-4 shadow-xl">
              <h2 className="text-lg font-black border-b border-black/20 pb-3 text-black">Novo Pedido / Orçamento</h2>
              <form onSubmit={handleGerarOS} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 font-extrabold text-black">Cliente</label>
                  <input type="text" placeholder="Nome do cliente" value={clienteSel} onChange={e => setClienteSel(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-extrabold text-black">Produto</label>
                    <select value={tipoProduto} onChange={e => setTipoProduto(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold">
                      <option value="lona">Lona / Banner (m²)</option>
                      <option value="adesivo">Adesivo (m²)</option>
                      <option value="cartao">Cartão de Visita</option>
                      <option value="panfleto">Panfletos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-extrabold text-black">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>
                </div>
                {(tipoProduto === 'lona' || tipoProduto === 'adesivo') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs font-bold text-black/70">Largura (m)</label>
                      <input type="number" step="0.01" value={largura} onChange={e => setLargura(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-black/70">Altura (m)</label>
                      <input type="number" step="0.01" value={altura} onChange={e => setAltura(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block mb-1 font-extrabold text-black">Preço Unitário / m² (R$)</label>
                  <input type="number" step="0.01" value={precoUnidade} onChange={e => setPrecoUnidade(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div className="bg-black text-amber-400 p-4 rounded-xl flex justify-between items-center shadow-md">
                  <span className="font-bold text-amber-200">Total:</span>
                  <span className="text-xl font-black text-amber-400">R$ {valorTotalOrçamento.toFixed(2)}</span>
                </div>
                <button type="submit" className="w-full bg-black text-amber-400 font-black py-3.5 rounded-xl transition shadow-xl border border-amber-400/30">
                  Gerar Pedido IGX
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-black">Acompanhamento (Kanban)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-black text-sm">EM ABERTO</span>
                    <span className="text-xs bg-black text-amber-400 px-2.5 py-0.5 rounded-full font-black">{ordens.filter(o => o.status === 'Aberto').length}</span>
                  </div>
                  {ordens.filter(o => o.status === 'Aberto').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-black/20 space-y-2">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-900">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Em Andamento')} className="w-full bg-black text-amber-400 text-xs font-black py-2 rounded-lg">Iniciar Produção ➔</button>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-black text-sm">EM ANDAMENTO</span>
                    <span className="text-xs bg-black text-amber-400 px-2.5 py-0.5 rounded-full font-black">{ordens.filter(o => o.status === 'Em Andamento').length}</span>
                  </div>
                  {ordens.filter(o => o.status === 'Em Andamento').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-black/20 space-y-2">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-900">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Finalizado')} className="w-full bg-emerald-800 text-amber-300 text-xs font-black py-2 rounded-lg">Concluir ✓</button>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-emerald-900 text-sm">FINALIZADOS</span>
                    <span className="text-xs bg-emerald-900 text-amber-300 px-2.5 py-0.5 rounded-full font-black">{ordens.filter(o => o.status === 'Finalizado').length}</span>
                  </div>
                  {ordens.filter(o => o.status === 'Finalizado').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-emerald-800/30 space-y-2">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-emerald-800">R$ {o.valor.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CLIENTES */}
        {abaAtiva === 'clientes' && temPermissao('clientes') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Novo Cliente</h2>
              <form onSubmit={handleCadastrarCliente} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Nome / Empresa</label>
                  <input type="text" required value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">Telefone</label>
                  <input type="text" value={novoTel} onChange={e => setNovoTel(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">E-mail</label>
                  <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <button type="submit" className="w-full bg-black text-amber-400 font-black py-3 rounded-xl">Cadastrar Cliente</button>
              </form>
            </div>

            <div className="md:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Clientes ({clientes.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clientes.map(c => (
                  <div key={c.id} className="bg-amber-50 p-4 rounded-xl border border-black/20 space-y-1">
                    <p className="font-black text-black">{c.nome}</p>
                    <p className="text-xs text-black/70 font-semibold">Tel: {c.telefone || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ESTOQUE */}
        {abaAtiva === 'estoque' && temPermissao('estoque') && (
          <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-black">Estoque de Insumos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insumos.map(item => (
                <div key={item.id} className="bg-amber-50 border border-black/20 p-4 rounded-xl">
                  <p className="font-black text-black">{item.nome}</p>
                  <p className="text-2xl font-black text-amber-950 mt-2">{item.quantidade} <span className="text-xs text-black/60 font-bold">{item.unidade}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FINANCEIRO */}
        {abaAtiva === 'financeiro' && temPermissao('financeiro') && (
          <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-black/20 pb-4">
              <h2 className="text-lg font-black text-black">Fluxo Financeiro</h2>
              <p className="text-2xl font-black text-emerald-900">R$ {saldoFinanceiro.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              {financeiro.map(f => (
                <div key={f.id} className="flex justify-between items-center bg-amber-50 p-3.5 rounded-xl border border-black/20 text-sm">
                  <p className="font-black text-black">{f.descricao}</p>
                  <span className="font-black text-emerald-800">+ R$ {f.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. GESTÃO DE USUÁRIOS E PERMISSÕES */}
        {abaAtiva === 'usuarios' && temPermissao('usuarios') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Cadastrar Novo Usuário</h2>
              <form onSubmit={handleCadastrarUsuario} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Nome Completo</label>
                  <input type="text" required value={nomeUser} onChange={e => setNomeUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">E-mail</label>
                  <input type="email" value={emailUser} onChange={e => setEmailUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">Cargo / Função</label>
                  <input type="text" value={cargoUser} onChange={e => setCargoUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" placeholder="Ex: Impressor / Vendedor" />
                </div>

                <div>
                  <label className="block mb-2 text-black font-black">Permissões de Acesso:</label>
                  <div className="space-y-2 bg-amber-50 p-3 rounded-xl border border-black/20">
                    {[
                      { id: 'dashboard', label: 'Dashboard Geral' },
                      { id: 'pedidos', label: 'Pedidos e Lançamentos' },
                      { id: 'clientes', label: 'Cadastro de Clientes' },
                      { id: 'estoque', label: 'Controle de Estoque' },
                      { id: 'financeiro', label: 'Fluxo Financeiro' },
                      { id: 'usuarios', label: 'Gerenciar Usuários' },
                    ].map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs font-bold text-black cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={permSel.includes(p.id as Permissao)}
                          onChange={() => handleTogglePermissao(p.id as Permissao)}
                          className="w-4 h-4 accent-black rounded"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-amber-400 font-black py-3 rounded-xl shadow-lg border border-amber-400/30">
                  Salvar Usuário & Permissões
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Usuários Cadastrados ({usuarios.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usuarios.map(u => (
                  <div key={u.id} className="bg-amber-50 p-4 rounded-xl border border-black/20 space-y-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-black">{u.nome}</p>
                      <span className="text-[10px] bg-black text-amber-400 px-2 py-0.5 rounded-full font-bold">{u.cargo}</span>
                    </div>
                    <p className="text-xs text-black/70 font-semibold">{u.email}</p>
                    <div className="border-t border-black/10 pt-2 mt-2">
                      <p className="text-[11px] font-black text-black mb-1">Acessos liberados:</p>
                      <div className="flex flex-wrap gap-1">
                        {u.permissoes.map(p => (
                          <span key={p} className="text-[10px] bg-amber-200/80 text-black px-1.5 py-0.5 rounded font-bold border border-black/10">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}