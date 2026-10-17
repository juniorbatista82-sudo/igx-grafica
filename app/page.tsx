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
      data: new Date().toLocaleDateString('pt-BR')
    };

    setOrdens([novaOS, ...ordens]);
    
    const lancamento: FinanceiroItem = {
      id: Date.now(),
      descricao: `Pedido #${novaOS.id.toString().slice(-4)} - ${clienteSel}`,
      tipo: 'Entrada',
      valor: valorTotalOrçamento,
      data: new Date().toLocaleDateString('pt-BR')
    };
    setFinanceiro([lancamento, ...financeiro]);

    setClienteSel('');
    alert('Pedido gerado com sucesso na IGX Gráfica!');
  };

  const MudarStatusOS = (id: number, novoStatus: 'Aberto' | 'Em Andamento' | 'Finalizado') => {
    setOrdens(ordens.map(o => o.id === id ? { ...o, status: novoStatus } : o));
  };

  return (
    <main className="min-h-screen bg-black text-amber-50 p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topo / Header da IGX Gráfica em Ouro e Preto */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/30 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-black px-3 py-1 rounded-lg font-black text-xl shadow-lg shadow-amber-500/10 tracking-widest">
              IGX
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                GRÁFICA
              </h1>
              <p className="text-xs text-amber-200/60 font-medium">Sistema de Gestão & Produção Premium</p>
            </div>
          </div>

          {/* Navegação principal */}
          <div className="flex flex-wrap bg-neutral-900/90 p-1.5 rounded-xl border border-amber-500/20 gap-1 text-sm shadow-xl">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'pedidos', label: 'Pedidos / O.S.' },
              { id: 'clientes', label: 'Clientes' },
              { id: 'estoque', label: 'Estoque' },
              { id: 'financeiro', label: 'Financeiro' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setAbaAtiva(item.id as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  abaAtiva === item.id 
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-bold' 
                    : 'text-amber-200/70 hover:text-amber-300 hover:bg-neutral-800/80'
                }`}
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
              <div className="bg-neutral-900/80 border border-amber-500/20 p-5 rounded-2xl shadow-xl hover:border-amber-500/40 transition">
                <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider">Total Faturado</p>
                <p className="text-2xl font-black text-amber-400 mt-2">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-neutral-900/80 border border-amber-500/20 p-5 rounded-2xl shadow-xl hover:border-amber-500/40 transition">
                <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider">Pedidos em Aberto</p>
                <p className="text-2xl font-black text-amber-300 mt-2">{ordens.filter(o => o.status === 'Aberto').length}</p>
              </div>
              <div className="bg-neutral-900/80 border border-amber-500/20 p-5 rounded-2xl shadow-xl hover:border-amber-500/40 transition">
                <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider">Em Produção</p>
                <p className="text-2xl font-black text-amber-500 mt-2">{ordens.filter(o => o.status === 'Em Andamento').length}</p>
              </div>
              <div className="bg-neutral-900/80 border border-amber-500/20 p-5 rounded-2xl shadow-xl hover:border-amber-500/40 transition">
                <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider">Pedidos Finalizados</p>
                <p className="text-2xl font-black text-emerald-400 mt-2">{ordens.filter(o => o.status === 'Finalizado').length}</p>
              </div>
            </div>

            <div className="bg-neutral-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-amber-400 mb-2">Painel de Controle - IGX Gráfica</h3>
              <p className="text-amber-100/70 text-sm leading-relaxed">
                Bem-vindo ao sistema de gestão da IGX Gráfica. Navegue pelas abas superiores para criar novos orçamentos, monitorar a fila de produção por status, cadastrar clientes e gerenciar o estoque e financeiro da empresa.
              </p>
            </div>
          </div>
        )}

        {/* 2. GESTÃO DE PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calculadora e Criador de O.S. */}
            <div className="bg-neutral-900/90 p-6 rounded-2xl border border-amber-500/20 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold border-b border-amber-500/20 pb-3 text-amber-400">Novo Pedido / Orçamento</h2>
              <form onSubmit={handleGerarOS} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 font-semibold text-amber-200/80">Cliente</label>
                  <input 
                    type="text"
                    placeholder="Nome do cliente"
                    value={clienteSel}
                    onChange={e => setClienteSel(e.target.value)}
                    className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-semibold text-amber-200/80">Produto</label>
                    <select 
                      value={tipoProduto} 
                      onChange={e => setTipoProduto(e.target.value)}
                      className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50 outline-none focus:border-amber-400 transition"
                    >
                      <option value="lona">Lona / Banner (m²)</option>
                      <option value="adesivo">Adesivo (m²)</option>
                      <option value="cartao">Cartão de Visita</option>
                      <option value="panfleto">Panfletos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-amber-200/80">Quantidade</label>
                    <input 
                      type="number" min="1"
                      value={quantidade} onChange={e => setQuantidade(Number(e.target.value))}
                      className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50 outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {(tipoProduto === 'lona' || tipoProduto === 'adesivo') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-amber-200/60 font-medium">Largura (m)</label>
                      <input type="number" step="0.01" value={largura} onChange={e => setLargura(Number(e.target.value))} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-amber-200/60 font-medium">Altura (m)</label>
                      <input type="number" step="0.01" value={altura} onChange={e => setAltura(Number(e.target.value))} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-semibold text-amber-200/80">Preço Unitário / m² (R$)</label>
                  <input type="number" step="0.01" value={precoUnidade} onChange={e => setPrecoUnidade(Number(e.target.value))} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-amber-300">Total do Orçamento:</span>
                  <span className="text-xl font-black text-amber-400">R$ {valorTotalOrçamento.toFixed(2)}</span>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold py-3 rounded-xl transition shadow-lg shadow-amber-500/20">
                  Gerar Pedido IGX
                </button>
              </form>
            </div>

            {/* Quadro Kanban de Pedidos */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-amber-400">Quadro de Acompanhamento (Kanban)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Coluna Aberto */}
                <div className="bg-neutral-900/90 border border-amber-500/20 p-4 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                    <span className="font-bold text-amber-300 text-sm">EM ABERTO</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                      {ordens.filter(o => o.status === 'Aberto').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Aberto').map(o => (
                    <div key={o.id} className="bg-black/90 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                      <p className="font-bold text-amber-100">{o.cliente}</p>
                      <p className="text-xs text-amber-200/60">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-400">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Em Andamento')} className="w-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold py-1.5 rounded-lg border border-amber-500/30 transition">
                        Iniciar Produção ➔
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Em Andamento */}
                <div className="bg-neutral-900/90 border border-amber-500/20 p-4 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                    <span className="font-bold text-amber-500 text-sm">EM ANDAMENTO</span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                      {ordens.filter(o => o.status === 'Em Andamento').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Em Andamento').map(o => (
                    <div key={o.id} className="bg-black/90 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                      <p className="font-bold text-amber-100">{o.cliente}</p>
                      <p className="text-xs text-amber-200/60">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-400">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Finalizado')} className="w-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black text-xs font-bold py-1.5 rounded-lg border border-emerald-500/30 transition">
                        Concluir / Finalizar ✓
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Finalizado */}
                <div className="bg-neutral-900/90 border border-amber-500/20 p-4 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                    <span className="font-bold text-emerald-400 text-sm">FINALIZADOS</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      {ordens.filter(o => o.status === 'Finalizado').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Finalizado').map(o => (
                    <div key={o.id} className="bg-black/90 p-3.5 rounded-xl border border-emerald-500/20 space-y-2 opacity-90">
                      <p className="font-bold text-amber-100">{o.cliente}</p>
                      <p className="text-xs text-amber-200/60">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-emerald-400">R$ {o.valor.toFixed(2)}</p>
                      <span className="block text-center text-[10px] text-emerald-400 bg-emerald-950/60 py-1 rounded-md border border-emerald-500/30 font-bold">
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
            <div className="bg-neutral-900/90 border border-amber-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-amber-400">Novo Cliente</h2>
              <form onSubmit={handleCadastrarCliente} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 text-amber-200/80 font-medium">Nome Completo / Empresa</label>
                  <input type="text" required value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                </div>
                <div>
                  <label className="block mb-1 text-amber-200/80 font-medium">Telefone / WhatsApp</label>
                  <input type="text" value={novoTel} onChange={e => setNovoTel(e.target.value)} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                </div>
                <div>
                  <label className="block mb-1 text-amber-200/80 font-medium">E-mail</label>
                  <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-black/80 border border-amber-500/30 rounded-xl p-2.5 text-amber-50" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold py-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                  Cadastrar Cliente
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-neutral-900/90 border border-amber-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-amber-400">Clientes Cadastrados ({clientes.length})</h2>
              {clientes.length === 0 ? (
                <p className="text-amber-200/50 text-sm">Nenhum cliente cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientes.map(c => (
                    <div key={c.id} className="bg-black/80 p-4 rounded-xl border border-amber-500/20 space-y-1">
                      <p className="font-bold text-amber-300">{c.nome}</p>
                      <p className="text-xs text-amber-200/60">Tel: {c.telefone || 'N/A'}</p>
                      <p className="text-xs text-amber-200/60">Email: {c.email || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ESTOQUE */}
        {abaAtiva === 'estoque' && (
          <div className="bg-neutral-900/90 border border-amber-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-amber-400">Estoque de Insumos - IGX Gráfica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insumos.map(item => (
                <div key={item.id} className="bg-black/80 border border-amber-500/20 p-4 rounded-xl">
                  <p className="font-bold text-amber-100">{item.nome}</p>
                  <p className="text-2xl font-black text-amber-400 mt-2">{item.quantidade} <span className="text-xs text-amber-200/60">{item.unidade}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FINANCEIRO */}
        {abaAtiva === 'financeiro' && (
          <div className="bg-neutral-900/90 border border-amber-500/20 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
              <div>
                <h2 className="text-lg font-bold text-amber-400">Fluxo Financeiro</h2>
                <p className="text-xs text-amber-200/60">Controle de Faturamento e Entradas</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-200/60 font-medium">Saldo Atual:</span>
                <p className="text-2xl font-black text-amber-400">R$ {saldoFinanceiro.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {financeiro.map(f => (
                <div key={f.id} className="flex justify-between items-center bg-black/80 p-3.5 rounded-xl border border-amber-500/20 text-sm">
                  <div>
                    <p className="font-semibold text-amber-100">{f.descricao}</p>
                    <p className="text-xs text-amber-200/50">{f.data}</p>
                  </div>
                  <span className="font-black text-amber-400">+ R$ {f.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}