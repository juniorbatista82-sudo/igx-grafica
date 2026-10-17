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
    <main className="min-h-screen bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black p-4 md:p-8 font-sans selection:bg-black selection:text-amber-400">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topo / Header da IGX Gráfica Invertido (Fundo Ouro, Texto Preto) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/30 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-black text-amber-400 px-3.5 py-1 rounded-lg font-black text-xl shadow-xl tracking-widest border border-amber-300/30">
              IGX
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-black">
                GRÁFICA
              </h1>
              <p className="text-xs text-black/80 font-bold">Sistema de Gestão & Produção Premium</p>
            </div>
          </div>

          {/* Navegação principal */}
          <div className="flex flex-wrap bg-amber-600/30 backdrop-blur-md p-1.5 rounded-xl border border-black/20 gap-1 text-sm shadow-lg">
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

        {/* 1. DASHBOARD GENERAL */}
        {abaAtiva === 'dashboard' && (
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

            <div className="bg-amber-100/90 border border-black/20 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-black text-black mb-2">Painel de Controle - IGX Gráfica</h3>
              <p className="text-black/80 text-sm font-medium leading-relaxed">
                Bem-vindo ao sistema de gestão da IGX Gráfica. Navegue pelas abas superiores para criar novos orçamentos, monitorar a fila de produção por status, cadastrar clientes e gerenciar o estoque e financeiro da empresa.
              </p>
            </div>
          </div>
        )}

        {/* 2. GESTÃO DE PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calculadora e Criador de O.S. */}
            <div className="bg-amber-100/90 p-6 rounded-2xl border border-black/20 space-y-4 shadow-xl">
              <h2 className="text-lg font-black border-b border-black/20 pb-3 text-black">Novo Pedido / Orçamento</h2>
              <form onSubmit={handleGerarOS} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 font-extrabold text-black">Cliente</label>
                  <input 
                    type="text"
                    placeholder="Nome do cliente"
                    value={clienteSel}
                    onChange={e => setClienteSel(e.target.value)}
                    className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold placeholder:text-black/40 outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-extrabold text-black">Produto</label>
                    <select 
                      value={tipoProduto} 
                      onChange={e => setTipoProduto(e.target.value)}
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold outline-none focus:border-black transition"
                    >
                      <option value="lona">Lona / Banner (m²)</option>
                      <option value="adesivo">Adesivo (m²)</option>
                      <option value="cartao">Cartão de Visita</option>
                      <option value="panfleto">Panfletos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-extrabold text-black">Quantidade</label>
                    <input 
                      type="number" min="1"
                      value={quantidade} onChange={e => setQuantidade(Number(e.target.value))}
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold outline-none focus:border-black transition"
                    />
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
                  <span className="font-bold text-amber-200">Total do Orçamento:</span>
                  <span className="text-xl font-black text-amber-400">R$ {valorTotalOrçamento.toFixed(2)}</span>
                </div>

                <button type="submit" className="w-full bg-black hover:bg-neutral-900 text-amber-400 font-black py-3.5 rounded-xl transition shadow-xl border border-amber-400/30 text-base tracking-wide">
                  Gerar Pedido IGX
                </button>
              </form>
            </div>

            {/* Quadro Kanban de Pedidos */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-black">Quadro de Acompanhamento (Kanban)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Coluna Aberto */}
                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-black text-sm">EM ABERTO</span>
                    <span className="text-xs bg-black text-amber-400 px-2.5 py-0.5 rounded-full font-black">
                      {ordens.filter(o => o.status === 'Aberto').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Aberto').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-black/20 space-y-2 shadow-sm">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-900">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Em Andamento')} className="w-full bg-black hover:bg-neutral-900 text-amber-400 text-xs font-black py-2 rounded-lg transition shadow">
                        Iniciar Produção ➔
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Em Andamento */}
                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-black text-sm">EM ANDAMENTO</span>
                    <span className="text-xs bg-black text-amber-400 px-2.5 py-0.5 rounded-full font-black">
                      {ordens.filter(o => o.status === 'Em Andamento').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Em Andamento').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-black/20 space-y-2 shadow-sm">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-amber-900">R$ {o.valor.toFixed(2)}</p>
                      <button onClick={() => MudarStatusOS(o.id, 'Finalizado')} className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-300 text-xs font-black py-2 rounded-lg transition shadow">
                        Concluir / Finalizar ✓
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coluna Finalizado */}
                <div className="bg-amber-100/90 border border-black/20 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-black/20 pb-2">
                    <span className="font-black text-emerald-900 text-sm">FINALIZADOS</span>
                    <span className="text-xs bg-emerald-900 text-amber-300 px-2.5 py-0.5 rounded-full font-black">
                      {ordens.filter(o => o.status === 'Finalizado').length}
                    </span>
                  </div>
                  {ordens.filter(o => o.status === 'Finalizado').map(o => (
                    <div key={o.id} className="bg-amber-50 p-3.5 rounded-xl border border-emerald-800/30 space-y-2 shadow-sm">
                      <p className="font-black text-black">{o.cliente}</p>
                      <p className="text-xs text-black/70 font-semibold">{o.produto} - {o.detalhes}</p>
                      <p className="text-sm font-black text-emerald-800">R$ {o.valor.toFixed(2)}</p>
                      <span className="block text-center text-[10px] text-emerald-900 bg-emerald-200 py-1 rounded-md border border-emerald-400 font-black">
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
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Novo Cliente</h2>
              <form onSubmit={handleCadastrarCliente} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Nome Completo / Empresa</label>
                  <input type="text" required value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">Telefone / WhatsApp</label>
                  <input type="text" value={novoTel} onChange={e => setNovoTel(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">E-mail</label>
                  <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <button type="submit" className="w-full bg-black hover:bg-neutral-900 text-amber-400 font-black py-3 rounded-xl shadow-lg border border-amber-400/30">
                  Cadastrar Cliente
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Clientes Cadastrados ({clientes.length})</h2>
              {clientes.length === 0 ? (
                <p className="text-black/60 text-sm font-semibold">Nenhum cliente cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientes.map(c => (
                    <div key={c.id} className="bg-amber-50 p-4 rounded-xl border border-black/20 space-y-1 shadow-sm">
                      <p className="font-black text-black">{c.nome}</p>
                      <p className="text-xs text-black/70 font-semibold">Tel: {c.telefone || 'N/A'}</p>
                      <p className="text-xs text-black/70 font-semibold">Email: {c.email || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ESTOQUE */}
        {abaAtiva === 'estoque' && (
          <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-black">Estoque de Insumos - IGX Gráfica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insumos.map(item => (
                <div key={item.id} className="bg-amber-50 border border-black/20 p-4 rounded-xl shadow-sm">
                  <p className="font-black text-black">{item.nome}</p>
                  <p className="text-2xl font-black text-amber-950 mt-2">{item.quantidade} <span className="text-xs text-black/60 font-bold">{item.unidade}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FINANCEIRO */}
        {abaAtiva === 'financeiro' && (
          <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-black/20 pb-4">
              <div>
                <h2 className="text-lg font-black text-black">Fluxo Financeiro</h2>
                <p className="text-xs text-black/70 font-bold">Controle de Faturamento e Entradas</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-black/70 font-black uppercase">Saldo Atual:</span>
                <p className="text-2xl font-black text-emerald-900">R$ {saldoFinanceiro.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {financeiro.map(f => (
                <div key={f.id} className="flex justify-between items-center bg-amber-50 p-3.5 rounded-xl border border-black/20 text-sm shadow-sm">
                  <div>
                    <p className="font-black text-black">{f.descricao}</p>
                    <p className="text-xs text-black/60 font-bold">{f.data}</p>
                  </div>
                  <span className="font-black text-emerald-800">+ R$ {f.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}