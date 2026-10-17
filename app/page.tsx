'use client';
import { useState, useEffect } from 'react';

type Permissao = 'dashboard' | 'pedidos' | 'clientes' | 'estoque' | 'financeiro' | 'usuarios';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  permissoes: Permissao[];
}

interface Cliente {
  id: number;
  nome: string;      // Nome / Empresa (Obrigatório)
  telefone: string;  // Telefone / WhatsApp (Obrigatório)
  cnpj: string;      // CNPJ
  rg: string;        // RG
  contato: string;   // Contato (Nome da pessoa de contato)
  email: string;     // E-mail
  endereco: string;  // Endereço completo
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
  precoCusto: number;
  precoVenda: number;
  margemLucro: number;
  minimo: number;
}

interface FinanceiroItem {
  id: number;
  descricao: string;
  tipo: 'Entrada' | 'Saida';
  valor: number;
  data: string;
}

const ADMIN_DEFAULT: Usuario = {
  id: 1,
  nome: 'Administrador IGX',
  email: 'admin@igxgrafica.com',
  senha: 'admin123',
  cargo: 'Administrador Master',
  permissoes: ['dashboard', 'pedidos', 'clientes', 'estoque', 'financeiro', 'usuarios']
};

export default function Home() {
  // Estado de Autenticação / Login
  const [usuarios, setUsuarios] = useState<Usuario[]>([ADMIN_DEFAULT]);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  
  // Form de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<Permissao>('dashboard');

  // Estados dos Dados do Sistema
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([]);

  // Form de Novo/Edição de Usuário
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeUser, setNomeUser] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [senhaUser, setSenhaUser] = useState('');
  const [cargoUser, setCargoUser] = useState('Atendente');
  const [permSel, setPermSel] = useState<Permissao[]>(['pedidos', 'clientes']);

  // Form de Estoque Completo
  const [nomeInsumo, setNomeInsumo] = useState('');
  const [qtdInsumo, setQtdInsumo] = useState<number>(10);
  const [unidadeInsumo, setUnidadeInsumo] = useState('unidade');
  const [precoCustoInsumo, setPrecoCustoInsumo] = useState<number>(10);
  const [precoVendaInsumo, setPrecoVendaInsumo] = useState<number>(20);
  const [margemLucroInsumo, setMargemLucroInsumo] = useState<number>(100);
  const [minInsumo, setMinInsumo] = useState<number>(5);

  // Form Orçamento
  const [clienteSel, setClienteSel] = useState<string>('');
  const [tipoProduto, setTipoProduto] = useState<string>('lona');
  const [largura, setLargura] = useState<number>(1);
  const [altura, setAltura] = useState<number>(1);
  const [quantidade, setQuantidade] = useState<number>(10);
  const [precoUnidade, setPrecoUnidade] = useState<number>(50);

  // Form Cliente Completo
  const [cliNome, setCliNome] = useState('');
  const [cliTel, setCliTel] = useState('');
  const [cliCnpj, setCliCnpj] = useState('');
  const [cliRg, setCliRg] = useState('');
  const [cliContato, setCliContato] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliEndereco, setCliEndereco] = useState('');

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    try {
      const u = localStorage.getItem('igx_usuarios');
      if (u) {
        const parsed: Usuario[] = JSON.parse(u);
        if (parsed.length > 0) setUsuarios(parsed);
      }

      const session = localStorage.getItem('igx_sessao');
      if (session) {
        setUsuarioLogado(JSON.parse(session));
      }

      const c = localStorage.getItem('igx_clientes'); if (c) setClientes(JSON.parse(c));
      const o = localStorage.getItem('igx_ordens'); if (o) setOrdens(JSON.parse(o));
      const i = localStorage.getItem('igx_insumos');
      if (i) setInsumos(JSON.parse(i)); else {
        const defInsumos: Insumo[] = [
          { id: 1, nome: 'Bobina Lona 440g', quantidade: 50, unidade: 'm', precoCusto: 18.50, precoVenda: 35.00, margemLucro: 89.18, minimo: 10 },
          { id: 2, nome: 'Papel Couché 150g A4', quantidade: 10, unidade: 'resma', precoCusto: 45.00, precoVenda: 90.00, margemLucro: 100.00, minimo: 2 },
          { id: 3, nome: 'Caixa de Canetas Personalizadas', quantidade: 5, unidade: 'caixa', precoCusto: 120.00, precoVenda: 250.00, margemLucro: 108.33, minimo: 2 }
        ];
        setInsumos(defInsumos);
      }
      const f = localStorage.getItem('igx_financeiro'); if (f) setFinanceiro(JSON.parse(f));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    }
  }, []);

  // Salvar alterações
  useEffect(() => { localStorage.setItem('igx_usuarios', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('igx_clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('igx_ordens', JSON.stringify(ordens)); }, [ordens]);
  useEffect(() => { localStorage.setItem('igx_insumos', JSON.stringify(insumos)); }, [insumos]);
  useEffect(() => { localStorage.setItem('igx_financeiro', JSON.stringify(financeiro)); }, [financeiro]);

  // Recalcular margem de lucro quando o custo ou venda mudarem no form de estoque
  const handleAtualizarPrecosEstoque = (custo: number, venda: number) => {
    setPrecoCustoInsumo(custo);
    setPrecoVendaInsumo(venda);
    if (custo > 0) {
      const margem = ((venda - custo) / custo) * 100;
      setMargemLucroInsumo(Number(margem.toFixed(2)));
    }
  };

  const handleAtualizarMargemLucro = (margem: number) => {
    setMargemLucroInsumo(margem);
    if (precoCustoInsumo > 0) {
      const novaVenda = precoCustoInsumo + (precoCustoInsumo * (margem / 100));
      setPrecoVendaInsumo(Number(novaVenda.toFixed(2)));
    }
  };

  // Login e Logout
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');
    
    const user = usuarios.find(u => 
      (u.email.toLowerCase() === loginEmail.trim().toLowerCase() || u.nome.toLowerCase() === loginEmail.trim().toLowerCase()) 
      && u.senha === loginSenha
    );

    if (user) {
      setUsuarioLogado(user);
      localStorage.setItem('igx_sessao', JSON.stringify(user));
      setAbaAtiva(user.permissoes[0] || 'dashboard');
    } else {
      setErroLogin('E-mail/Usuário ou senha incorretos!');
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('igx_sessao');
  };

  const temPermissao = (p: Permissao) => {
    if (!usuarioLogado) return false;
    return usuarioLogado.permissoes.includes(p);
  };

  const handleTogglePermissao = (p: Permissao) => {
    if (permSel.includes(p)) {
      setPermSel(permSel.filter(item => item !== p));
    } else {
      setPermSel([...permSel, p]);
    }
  };

  // Funções do Cliente
  const handleCadastrarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliNome.trim() || !cliTel.trim()) {
      return alert('Por favor, preencha o Nome/Empresa e o Telefone!');
    }

    const novoCliente: Cliente = {
      id: Date.now(),
      nome: cliNome,
      telefone: cliTel,
      cnpj: cliCnpj,
      rg: cliRg,
      contato: cliContato,
      email: cliEmail,
      endereco: cliEndereco
    };

    setClientes([...clientes, novoCliente]);
    setCliNome('');
    setCliTel('');
    setCliCnpj('');
    setCliRg('');
    setCliContato('');
    setCliEmail('');
    setCliEndereco('');
    alert('Cliente cadastrado com sucesso na IGX Gráfica!');
  };

  const removerCliente = (id: number) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  // Funções do Estoque
  const handleCadastrarInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeInsumo) return alert('Informe o nome do produto no estoque!');

    const novo: Insumo = {
      id: Date.now(),
      nome: nomeInsumo,
      quantidade: Number(qtdInsumo),
      unidade: unidadeInsumo,
      precoCusto: Number(precoCustoInsumo),
      precoVenda: Number(precoVendaInsumo),
      margemLucro: Number(margemLucroInsumo),
      minimo: Number(minInsumo)
    };

    setInsumos([...insumos, novo]);
    setNomeInsumo('');
    setQtdInsumo(10);
    setPrecoCustoInsumo(10);
    setPrecoVendaInsumo(20);
    setMargemLucroInsumo(100);
    setMinInsumo(5);
    alert('Produto/Insumo cadastrado no estoque!');
  };

  const ajustarEstoqueRapido = (id: number) => {
    const qtdStr = prompt('Digite a quantidade a ADICIONAR (use sinal negativo ex: -5 para baixar):');
    if (!qtdStr) return;
    const val = Number(qtdStr);
    if (isNaN(val)) return alert('Valor inválido!');

    setInsumos(insumos.map(item => {
      if (item.id === id) {
        return { ...item, quantidade: Math.max(0, item.quantidade + val) };
      }
      return item;
    }));
  };

  const removerInsumo = (id: number) => {
    if (confirm('Deseja excluir este item do estoque?')) {
      setInsumos(insumos.filter(i => i.id !== id));
    }
  };

  // Funções de Usuário
  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeUser || permSel.length === 0) return alert('Informe o nome e selecione ao menos uma permissão!');

    if (editandoId) {
      setUsuarios(usuarios.map(u => {
        if (u.id === editandoId) {
          return {
            ...u,
            nome: nomeUser,
            email: emailUser,
            cargo: cargoUser,
            permissoes: permSel,
            senha: senhaUser ? senhaUser : u.senha
          };
        }
        return u;
      }));
      alert('Perfil de usuário atualizado!');
      cancelarEdicao();
    } else {
      if (!senhaUser) return alert('Por favor, defina uma senha inicial para o usuário!');
      const novo: Usuario = {
        id: Date.now(),
        nome: nomeUser,
        email: emailUser || `${nomeUser.toLowerCase().replace(/\s+/g, '')}@igxgrafica.com`,
        senha: senhaUser,
        cargo: cargoUser,
        permissoes: permSel
      };
      setUsuarios([...usuarios, novo]);
      cancelarEdicao();
      alert('Novo usuário cadastrado!');
    }
  };

  const iniciarEdicao = (u: Usuario) => {
    setEditandoId(u.id);
    setNomeUser(u.nome);
    setEmailUser(u.email);
    setSenhaUser('');
    setCargoUser(u.cargo);
    setPermSel(u.permissoes);
  };

  const redefinirSenhaRapida = (u: Usuario) => {
    const nova = prompt(`Digite a nova senha para ${u.nome}:`);
    if (nova && nova.trim().length > 0) {
      setUsuarios(usuarios.map(item => item.id === u.id ? { ...item, senha: nova.trim() } : item));
      alert(`Senha de ${u.nome} redefinida!`);
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNomeUser('');
    setEmailUser('');
    setSenhaUser('');
    setCargoUser('Atendente');
    setPermSel(['pedidos', 'clientes']);
  };

  const handleGerarOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel) return alert('Selecione ou informe um cliente!');

    const areaTotal = largura * altura;
    const valorTotalOrçamento = tipoProduto === 'lona' || tipoProduto === 'adesivo'
      ? areaTotal * quantidade * precoUnidade
      : quantidade * precoUnidade;

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

  // Cálculos
  const areaTotal = largura * altura;
  const valorTotalOrçamento = tipoProduto === 'lona' || tipoProduto === 'adesivo'
    ? areaTotal * quantidade * precoUnidade
    : quantidade * precoUnidade;

  const totalEntradas = financeiro.filter(x => x.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoFinanceiro = totalEntradas - financeiro.filter(x => x.tipo === 'Saida').reduce((acc, curr) => acc + curr.valor, 0);

  // Valor Total Investido em Estoque
  const valorTotalEstoque = insumos.reduce((acc, curr) => acc + (curr.quantidade * curr.precoCusto), 0);
  const insumosCriticos = insumos.filter(i => i.quantidade <= i.minimo);

  // TELA DE LOGIN
  if (!usuarioLogado) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center p-4 font-sans selection:bg-black selection:text-amber-400">
        <div className="w-full max-w-md bg-amber-100/95 border border-black/30 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block bg-black text-amber-400 px-4 py-1.5 rounded-xl font-black text-2xl shadow-xl tracking-widest border border-amber-300/30">
              IGX
            </div>
            <h1 className="text-2xl font-black text-black tracking-wide">GRÁFICA</h1>
            <p className="text-xs font-bold text-black/70">Acesse com suas credenciais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            {erroLogin && (
              <div className="bg-red-600 text-white p-3 rounded-xl font-bold text-xs text-center shadow">
                {erroLogin}
              </div>
            )}

            <div>
              <label className="block mb-1 text-black font-extrabold">E-mail ou Nome de Usuário</label>
              <input 
                type="text" 
                required
                placeholder="ex: admin@igxgrafica.com"
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)} 
                className="w-full bg-amber-50 border border-black/30 rounded-xl p-3 text-black font-bold outline-none focus:border-black focus:ring-2 focus:ring-black/20" 
              />
            </div>

            <div>
              <label className="block mb-1 text-black font-extrabold">Senha</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={loginSenha} 
                onChange={e => setLoginSenha(e.target.value)} 
                className="w-full bg-amber-50 border border-black/30 rounded-xl p-3 text-black font-bold outline-none focus:border-black focus:ring-2 focus:ring-black/20" 
              />
            </div>

            <button type="submit" className="w-full bg-black hover:bg-neutral-900 text-amber-400 font-black py-3.5 rounded-xl transition shadow-xl text-base tracking-wide border border-amber-400/30">
              Entrar no Sistema
            </button>
          </form>

          <div className="text-center border-t border-black/10 pt-4">
            <p className="text-[11px] text-black/60 font-semibold">
              Credencial inicial: <br />
              <span className="font-extrabold text-black">admin@igxgrafica.com</span> / Senha: <span className="font-extrabold text-black">admin123</span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // PAINEL DO SISTEMA
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black p-4 md:p-8 font-sans selection:bg-black selection:text-amber-400">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topo / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/30 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-black text-amber-400 px-3.5 py-1 rounded-lg font-black text-xl shadow-xl tracking-widest border border-amber-300/30">
              IGX
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-black">GRÁFICA</h1>
              <p className="text-xs text-black/80 font-bold">Gestão & Produção Premium</p>
            </div>
          </div>

          {/* Usuário Logado & Botão Sair */}
          <div className="flex items-center gap-3 bg-black text-amber-400 p-2 px-3 rounded-xl shadow-lg border border-black/20 text-xs">
            <div>
              <p className="font-black text-amber-300">{usuarioLogado.nome}</p>
              <p className="text-[10px] text-amber-200/70 font-bold">{usuarioLogado.cargo}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-2.5 py-1 rounded-lg transition ml-2"
              title="Sair do sistema"
            >
              Sair ✕
            </button>
          </div>

          {/* Navegação principal */}
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
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Valor Investido em Estoque</p>
                <p className="text-2xl font-black text-amber-900 mt-2">R$ {valorTotalEstoque.toFixed(2)}</p>
              </div>
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Estoque Crítico (Repor)</p>
                <p className="text-2xl font-black text-red-700 mt-2">{insumosCriticos.length} itens</p>
              </div>
              <div className="bg-amber-100/90 border border-black/20 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-black/70 font-black uppercase tracking-wider">Clientes Cadastrados</p>
                <p className="text-2xl font-black text-amber-950 mt-2">{clientes.length}</p>
              </div>
            </div>

            <div className="bg-amber-100/90 border border-black/20 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-black text-black mb-2">Painel de Controle - IGX Gráfica</h3>
              <p className="text-black/80 text-sm font-medium leading-relaxed">
                Navegue pelas abas superiores para emitir orçamentos, acompanhar a produção no Kanban, gerenciar a base de clientes, controlar o estoque com cálculo automático de margem de lucro e visualizar o fluxo financeiro.
              </p>
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
                  <label className="block mb-1 font-extrabold text-black">Selecionar ou Digitar Cliente</label>
                  {clientes.length > 0 ? (
                    <select 
                      value={clienteSel} 
                      onChange={e => setClienteSel(e.target.value)}
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold outline-none focus:border-black"
                    >
                      <option value="">-- Selecione o Cliente --</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.nome}>
                          {c.nome} {c.cnpj ? `(CNPJ: ${c.cnpj})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Nome do cliente" 
                      value={clienteSel} 
                      onChange={e => setClienteSel(e.target.value)} 
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" 
                    />
                  )}
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

        {/* 3. CADASTRO DE CLIENTES COMPLETO */}
        {abaAtiva === 'clientes' && temPermissao('clientes') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Cadastrar Novo Cliente</h2>
              
              <form onSubmit={handleCadastrarCliente} className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Nome Completo / Empresa *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Empresa Exemplo Ltda / João Silva" 
                    value={cliNome} 
                    onChange={e => setCliNome(e.target.value)} 
                    className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-black font-extrabold">Telefone / Whats *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="(00) 00000-0000" 
                      value={cliTel} 
                      onChange={e => setCliTel(e.target.value)} 
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" 
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-black font-extrabold">Pessoa de Contato</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Carlos (Gerente)" 
                      value={cliContato} 
                      onChange={e => setCliContato(e.target.value)} 
                      className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-black font-extrabold">CNPJ</label>
                    <input type="text" placeholder="00.000.000/0001-00" value={cliCnpj} onChange={e => setCliCnpj(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>
                  <div>
                    <label className="block mb-1 text-black font-extrabold">RG / IE</label>
                    <input type="text" placeholder="00.000.000-0" value={cliRg} onChange={e => setCliRg(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-black font-extrabold">E-mail</label>
                  <input type="email" placeholder="cliente@email.com" value={cliEmail} onChange={e => setCliEmail(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>

                <div>
                  <label className="block mb-1 text-black font-extrabold">Endereço Completo</label>
                  <input type="text" placeholder="Rua, Número, Bairro, Cidade - UF" value={cliEndereco} onChange={e => setCliEndereco(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>

                <button type="submit" className="w-full bg-black text-amber-400 font-black py-3 rounded-xl shadow-lg border border-amber-400/30">
                  Cadastrar Cliente
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Base de Clientes ({clientes.length})</h2>
              {clientes.length === 0 ? (
                <p className="text-black/60 text-sm font-semibold">Nenhum cliente cadastrado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clientes.map(c => (
                    <div key={c.id} className="bg-amber-50 p-4 rounded-xl border border-black/20 space-y-2 shadow-sm relative">
                      <div className="flex justify-between items-start border-b border-black/10 pb-2">
                        <div>
                          <p className="font-black text-black text-base">{c.nome}</p>
                          {c.contato && <p className="text-xs text-black/70 font-bold">Contato: {c.contato}</p>}
                        </div>
                        <button onClick={() => removerCliente(c.id)} className="text-red-600 hover:text-red-800 font-bold text-xs" title="Remover cliente">✕</button>
                      </div>

                      <div className="space-y-1 text-xs text-black/80 font-semibold">
                        <p><span className="font-black text-black">Tel/Whats:</span> {c.telefone}</p>
                        {c.cnpj && <p><span className="font-black text-black">CNPJ:</span> {c.cnpj}</p>}
                        {c.rg && <p><span className="font-black text-black">RG/IE:</span> {c.rg}</p>}
                        {c.email && <p><span className="font-black text-black">E-mail:</span> {c.email}</p>}
                        {c.endereco && <p><span className="font-black text-black">Endereço:</span> {c.endereco}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ESTOQUE DE PRODUTOS COMPLETO */}
        {abaAtiva === 'estoque' && temPermissao('estoque') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Cadastrar Produto no Estoque</h2>
              
              <form onSubmit={handleCadastrarInsumo} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Produto / Material *</label>
                  <input type="text" required placeholder="Ex: Papel Couché 150g A4 / Lona 440g" value={nomeInsumo} onChange={e => setNomeInsumo(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-black font-extrabold">Quantidade Inicial</label>
                    <input type="number" min="0" value={qtdInsumo} onChange={e => setQtdInsumo(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>

                  <div>
                    <label className="block mb-1 text-black font-extrabold">Unidade</label>
                    <select value={unidadeInsumo} onChange={e => setUnidadeInsumo(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold">
                      <option value="unidade">Unidade (un)</option>
                      <option value="resma">Resma</option>
                      <option value="caixa">Caixa</option>
                      <option value="m">Metros (m)</option>
                      <option value="m²">Metros Quadrados (m²)</option>
                      <option value="folhas">Folhas</option>
                      <option value="litros">Litros (L)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-black font-extrabold">Preço de Custo (R$)</label>
                    <input type="number" step="0.01" value={precoCustoInsumo} onChange={e => handleAtualizarPrecosEstoque(Number(e.target.value), precoVendaInsumo)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>

                  <div>
                    <label className="block mb-1 text-black font-extrabold">Preço de Venda (R$)</label>
                    <input type="number" step="0.01" value={precoVendaInsumo} onChange={e => handleAtualizarPrecosEstoque(precoCustoInsumo, Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-black font-extrabold">Margem de Lucro (%)</label>
                    <input type="number" step="0.01" value={margemLucroInsumo} onChange={e => handleAtualizarMargemLucro(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>

                  <div>
                    <label className="block mb-1 text-black font-extrabold">Mínimo (Alerta)</label>
                    <input type="number" min="1" value={minInsumo} onChange={e => setMinInsumo(Number(e.target.value))} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-amber-400 font-black py-3 rounded-xl shadow-lg border border-amber-400/30">
                  Salvar Produto no Estoque
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/20 pb-3">
                <div>
                  <h2 className="text-lg font-black text-black">Produtos no Estoque ({insumos.length})</h2>
                  <p className="text-xs text-black/70 font-bold">Valor Total em Custo: <span className="text-black font-black">R$ {valorTotalEstoque.toFixed(2)}</span></p>
                </div>

                {insumosCriticos.length > 0 && (
                  <div className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl animate-pulse shadow">
                    ⚠️ {insumosCriticos.length} produto(s) precisam de REPOSIÇÃO!
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insumos.map(item => {
                  const precisaRepor = item.quantidade <= item.minimo;
                  const valorTotalCusto = item.quantidade * item.precoCusto;

                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border space-y-3 transition-all ${precisaRepor ? 'bg-red-100 border-red-600 shadow-md ring-2 ring-red-600/30' : 'bg-amber-50 border-black/20 shadow-sm'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-black text-base">{item.nome}</p>
                          <p className="text-[11px] font-bold text-black/70">
                            Custo: R$ {item.precoCusto.toFixed(2)} | Venda: R$ {item.precoVenda.toFixed(2)}
                          </p>
                        </div>
                        {precisaRepor ? (
                          <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Repor Estoque</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-800 text-amber-300 px-2 py-0.5 rounded-full font-bold">OK</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-black/5 p-2.5 rounded-xl border border-black/10 text-xs">
                        <div>
                          <span className="text-black/60 font-bold block text-[10px]">QUANTIDADE ATUAL:</span>
                          <span className={`text-xl font-black ${precisaRepor ? 'text-red-700' : 'text-black'}`}>{item.quantidade} <span className="text-xs font-bold text-black/60">{item.unidade}</span></span>
                        </div>
                        <div className="text-right">
                          <span className="text-black/60 font-bold block text-[10px]">MARGEM DE LUCRO:</span>
                          <span className="text-sm font-black text-emerald-800 block">+{item.margemLucro.toFixed(1)}%</span>
                          <span className="text-[10px] text-black/60 font-bold">Investido: R$ {valorTotalCusto.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-bold text-black/70 border-t border-black/10 pt-2">
                        <span>Min. Reposição: {item.minimo} {item.unidade}</span>
                        <div className="flex gap-2">
                          <button onClick={() => ajustarEstoqueRapido(item.id)} className="bg-black text-amber-400 font-black px-2.5 py-1 rounded-lg hover:bg-neutral-900 transition" title="Entrada ou saída de estoque">+ / -</button>
                          <button onClick={() => removerInsumo(item.id)} className="bg-red-600 text-white font-bold px-2 py-1 rounded-lg hover:bg-red-700 transition" title="Remover item">✕</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

        {/* 6. GESTÃO DE USUÁRIOS E SENHAS */}
        {abaAtiva === 'usuarios' && temPermissao('usuarios') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-black/20 pb-3">
                <h2 className="text-lg font-black text-black">
                  {editandoId ? 'Editar Perfil de Usuário' : 'Cadastrar Novo Usuário'}
                </h2>
                {editandoId && (
                  <button onClick={cancelarEdicao} className="text-xs bg-black text-amber-400 px-2 py-1 rounded font-bold">
                    Cancelar ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleSalvarUsuario} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 text-black font-extrabold">Nome Completo</label>
                  <input type="text" required value={nomeUser} onChange={e => setNomeUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>
                <div>
                  <label className="block mb-1 text-black font-extrabold">E-mail / Login</label>
                  <input type="email" value={emailUser} onChange={e => setEmailUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
                </div>

                <div>
                  <label className="block mb-1 text-black font-extrabold">
                    {editandoId ? 'Nova Senha (deixe em branco p/ não alterar)' : 'Senha de Acesso'}
                  </label>
                  <input type="password" placeholder="••••••••" value={senhaUser} onChange={e => setSenhaUser(e.target.value)} className="w-full bg-amber-50 border border-black/30 rounded-xl p-2.5 text-black font-semibold" />
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
                  {editandoId ? 'Atualizar Perfil' : 'Salvar Usuário & Permissões'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-amber-100/90 border border-black/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-black text-black">Usuários do Sistema ({usuarios.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usuarios.map(u => (
                  <div key={u.id} className="bg-amber-50 p-4 rounded-xl border border-black/20 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-black">{u.nome}</p>
                        <span className="text-[10px] bg-black text-amber-400 px-2 py-0.5 rounded-full font-bold">{u.cargo}</span>
                      </div>
                      <p className="text-xs text-black/70 font-semibold">{u.email}</p>
                      
                      <div className="border-t border-black/10 pt-2">
                        <p className="text-[10px] font-black text-black mb-1">Acessos:</p>
                        <div className="flex flex-wrap gap-1">
                          {u.permissoes.map(p => (
                            <span key={p} className="text-[9px] bg-amber-200/80 text-black px-1.5 py-0.5 rounded font-bold border border-black/10">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10">
                      <button onClick={() => iniciarEdicao(u)} className="bg-black text-amber-400 hover:bg-neutral-900 text-xs font-bold py-1.5 rounded-lg transition">Editar Perfil</button>
                      <button onClick={() => redefinirSenhaRapida(u)} className="bg-amber-600/30 hover:bg-amber-600 text-black text-xs font-bold py-1.5 rounded-lg border border-black/20 transition">Redefinir Senha</button>
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