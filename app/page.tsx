'use client';
import { useState, useEffect } from 'react';

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
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'pedidos' | 'clientes' | 'estoque' | 'financeiro'>('dashboard');

  // Estados dos Dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([]);

  // Formulário de Orçamento
  const [clienteSel, setClienteSel] = useState<string>('');
  const [tipoProduto, setTipoProduto] = useState<string>('lona');
  const [largura, setLargura] = useState<number>(1);
  const [altura, setAltura] = useState<number>(1);
  const [quantidade, setQuantidade] = useState<number>(10);
  const [precoUnidade, setPrecoUnidade] = useState<number>(50);

  // Formulário de Cliente
  const [novoNome, setNovoNome] = useState('');
  const [novoTel, setNovoTel] = useState('');
  const [novoEmail, setNovoEmail] = useState('');

  // Carregar do localStorage
  useEffect(() => {
    const c = localStorage.getItem('igx_clientes');
    if (c) setClientes(JSON.parse(c));
    const o = localStorage.getItem('igx_ordens');
    if (o) setOrdens(JSON.parse(o));
    const i = localStorage.getItem('igx_insumos');
    if (i) setInsumos(JSON.parse(i)); else {
      const defaultInsumos: Insumo[] = [
        { id: 1, nome: 'Bobina Lona 440g', quantidade: 50, unidade: 'm', minimo: 10 },
        { id: 2, nome: 'Adesivo Vinil Brilho', quantidade: 20, unidade: 'm', minimo: 5 },
        { id: 3, nome: 'Papel Couché 150g', quantidade: 2000, unidade: 'folhas', minimo: 500 }
      ];
      setInsumos(defaultInsumos);
    }
    const f = localStorage.getItem('igx_financeiro');
    if (f) setFinanceiro(JSON.parse(f));
  }, []);

  // Guardar no localStorage
  useEffect(() => { localStorage.setItem('igx_clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('igx_ordens', JSON.stringify(ordens)); }, [ordens]);
  useEffect(() => { localStorage.setItem('igx_insumos', JSON.stringify(insumos)); }, [insumos]);
  useEffect(() => { localStorage.setItem('igx_financeiro', JSON.stringify(financeiro)); }, [financeiro]);

  // Cálculos
  const areaTotal = largura * altura;
  const valorTotalOrçamento = tipoProduto === 'lona' || tipoProduto === 'adesivo'
    ? areaTotal * quantidade * precoUnidade
    : quantidade * precoUnidade;

  const totalEntradas = financeiro.filter(x => x.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalSaidas = financeiro.filter(x => x.tipo === 'Saida').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoFinanceiro = totalEntradas - totalSaidas;

  // Ações
  const handleCadastrarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome) return;
    const novo: Cliente = { id: Date.now(), nome: novoNome, telefone: novoTel, email: novoEmail };
    setClientes([...clientes, novo]);
    setNovoNome(''); setNovoTel(''); setNovoEmail('');
    alert('Cliente cadastrado com sucesso!');
  };

  const handleGerarOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel) return alert('Selecione ou informe um cliente!');

    const novaOS: OrdemServico = {
      id: Date.now(),
      cliente: clienteSel,
      produto: tipoProduto.toUpperCase(),
      detalhes: tipoProduto === 'lona' || tipoProduto === 'adesivo' ? `${largura}m x ${altura}m (${quantidade}un)` : `${quantidade}un`,
      valor: valorTotalOrçamento,
      status: 'Aberto',
      data: new Date().toLocaleDateString('pt-PT')
    };

    setOrdens([novaOS, ...ordens]);
    
    // Regista lançamento automático no financeiro como entrada pendente/prevista
    const lancamento: FinanceiroItem = {
      id: Date.now(),
      descricao: `Pedido #${novaOS.id.toString().slice(-4)} - ${clienteSel}`,
      tipo: 'Entrada',
      valor: valorTotalOrçamento,
      data: new Date().toLocaleDateString('pt-PT')
    };
    setFinanceiro([lancamento, ...financeiro]);

    setClienteSel('');
    alert('Pedido / Ordem de Serviço gerada na IGX Gráfica!');
  };

  const MudarStatusOS = (id: number, novoStatus: 'Aberto' | 'Em Andamento' | 'Finalizado') => {
    setOrdens(ordens.map(o => o.id === id ? { ...o, status: novoStatus } : o));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topo / Header da IGX Gráfica */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-black text-sm">IGX</span>
              <h1 className="text-2xl font-extrabold tracking-wide">GRÁFICA - ERP & Gestão</h1>
            </div>
            <p className="text-xs text-slate-400">Acesso Unificado: Produção, Stock e Financeiro</p>
          </div>

          {/* Navegação principal */}
          <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 text-sm">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'pedidos', label: 'Pedidos / O.S.' },
              { id: 'clientes', label: 'Clientes' },
              { id: 'estoque', label: 'Stock' },
              { id: 'financeiro', label: 'Financeiro' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setAbaAtiva(item.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${abaAtiva === item.id ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. DASHBOARD GENERAL */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Faturado</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-2">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-semibold uppercase">Pedidos em Aberto</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-2">{ordens.filter(o => o.status === 'Aberto').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-semibold uppercase">Em Produção / Andamento</p>
                <p className="text-2xl font-extrabold text-blue-400 mt-2">{ordens.filter(o => o.status === 'Em Andamento').length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-semibold uppercase">Pedidos Finalizados</p>
                <p className="text-2xl font-extrabold text-purple-400 mt-2">{ordens.filter(o => o.status === 'Finalizado').length}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Resumo da IGX Gráfica</h3>
              <p className="text-slate-400 text-sm">
                Utilize os menus superiores para criar novos orçamentos, acompanhar a produção por status (Aberto, Em Andamento, Finalizados), gerir clientes e monitorizar o saldo financeiro da gráfica.
              </p>
            </div>
          </div>
        )}

        {/* 2. GESTÃO DE PEDIDOS (ABERTO, EM ANDAMENTO, FINALIZADO) */}
        {abaAtiva === 'pedidos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calculadora e Criador de O.S. */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold border-b border-slate-800 pb-2">Novo Pedido / Orçamento</h2>
              <form onSubmit={handleGerarOS} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 font-medium text-slate-300">Cliente</label>
                  <input 
                    type="text"
                    placeholder="Nome do cliente"
                    value={clienteSel}
                    onChange={e => setClienteSel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-medium text-slate-300">Produto</label>
                    <select 
                      value={tipoProduto} 
                      onChange={e => setTipoProduto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                    >
                      <option value="lona">Lona / Banner (m²)</option>
                      <option value="adesivo">Adesivo (m²)</option>
                      <option value="cartao">Cartão de Visita</option>
                      <option value="panfleto">Panfletos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-300">Quantidade</label>
                    <input 
                      type="number" min="1"
                      value={quantidade} onChange={e => setQuantidade(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                </div>

                {(tipoProduto === 'lona' || tipoProduto === 'adesivo') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-slate-400">Largura (m)</label>
                      <input type="number" step="0.01" value={largura} onChange={e => setLargura(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-400">Altura (m)</label>
                      <input type="number" step="0.01" value={altura} onChange={e => setAltura(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-medium text-slate-300">Preço Unitário / m² (R$)</label>
                  <input type="number" step="0.01" value={precoUnidade} onChange={e => setPrecoUnidade(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                </div>

                <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-blue-300">Total:</span>
                  <span className="text-xl font-bold text-white">R$ {valorTotalOrçamento.toFixed(2)}</span>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition">
                  Gerar Pedido IGX
                </button>
              </form>
            </div>

            {/* Fila de Pedidos dividida por Status (Aberto, Em Andamento, Finalizado) */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold">Quadro de Acompanhamento (Kanban)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Coluna Aberto */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-400 text-sm">EM ABERTO</span>
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {ordens.filter(o => o.status === 'Aberto').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Aberto').map(o => (
                    <div key={o.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <p className="font-bold text-white">{o.cliente}</p>
                      <p className="text-xs text-slate-400">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-bold text-emerald-400">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Em Andamento')} className="w-full bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs py-1 rounded transition">
                        Iniciar Produção ➔
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Em Andamento */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-blue-400 text-sm">EM ANDAMENTO</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {ordens.filter(o => o.status === 'Em Andamento').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Em Andamento').map(o => (
                    <div key={o.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <p className="font-bold text-white">{o.cliente}</p>
                      <p className="text-xs text-slate-400">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-bold text-emerald-400">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Finalizado')} className="w-full bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs py-1 rounded transition">
                        Concluir / Finalizar ✓
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Finalizado */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 text-sm">FINALIZADOS</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {ordens.filter(o => o.status === 'Finalizado').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Finalizado').map(o => (
                    <div key={o.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 opacity-80">
                      <p className="font-bold text-white">{o.cliente}</p>
                      <p className="text-xs text-slate-400">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-bold text-emerald-400">R$ {o.valor.toFixed(2)}</p>
                      <span className="block text-center text-[10px] text-emerald-400 bg-emerald-950/50 py-0.5 rounded border border-emerald-900">
                        Pronto para Entrega
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 3. CADASTRO DE CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold">Novo Cliente</h2>
              <form onSubmit={handleCadastrarCliente} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 text-slate-300">Nome Completo / Empresa</label>
                  <input type="text" required value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Telefone / WhatsApp</label>
                  <input type="text" value={novoTel} onChange={e => setNovoTel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">E-mail</label>
                  <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">
                  Cadastrar Cliente
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold">Clientes Cadastrados ({clientes.length})</h2>
              {clientes.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhum cliente cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientes.map(c => (
                    <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="font-bold text-blue-400">{c.nome}</p>
                      <p className="text-xs text-slate-400 mt-1">Tel: {c.telefone || 'N/A'}</p>
                      <p className="text-xs text-slate-400">Email: {c.email || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. STOCK */}
        {abaAtiva === 'estoque' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold">Stock de Insumos - IGX Gráfica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insumos.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <p className="font-bold">{item.nome}</p>
                  <p className="text-2xl font-extrabold text-blue-400 mt-2">{item.quantidade} <span className="text-xs text-slate-500">{item.unidade}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FINANCEIRO */}
        {abaAtiva === 'financeiro' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold">Fluxo Financeiro</h2>
                <p className="text-xs text-slate-400">Controlo de Faturação e Entradas</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Saldo Atual:</span>
                <p className="text-2xl font-extrabold text-emerald-400">R$ {saldoFinanceiro.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {financeiro.map(f => (
                <div key={f.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm">
                  <div>
                    <p className="font-medium">{f.descricao}</p>
                    <p className="text-xs text-slate-500">{f.data}</p>
                  </div>
                  <span className="font-bold text-emerald-400">+ R$ {f.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}