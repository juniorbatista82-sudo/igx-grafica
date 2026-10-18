'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Package,
  FileText,
  DollarSign,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  LogOut,
  Printer,
  Layers,
  Palette,
  Edit3
} from 'lucide-react'

// ==================== TIPOS DE DADOS ====================
type Usuario = {
  id: number
  nome: string
  email?: string
  senha?: string
  cargo: string
  permissoes: string[]
}

type Cliente = {
  id: number
  nome: string
  telefone: string
  cnpj?: string
  rg?: string
  contato?: string
  email?: string
  endereco?: string
}

type Insumo = {
  id: number
  nome: string
  quantidade: number
  unidade: string
  preco_custo: number
  preco_venda: number
  margem_lucro: number
  minimo: number
}

type OrdemServico = {
  id: number
  cliente: string
  produto: string
  detalhes: string
  valor: number
  status: 'Aberto' | 'Em Andamento' | 'Concluído'
  data: string
}

type FinanceiroItem = {
  id: number
  descricao: string
  tipo: 'Entrada' | 'Saída'
  valor: number
  data: string
}

export default function ERPGrafica() {
  // ==================== ESTADOS DE AUTENTICAÇÃO ====================
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null)
  const [nomeLogin, setNomeLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  // ==================== ESTADO DA ABA ATIVA ====================
  const [abaAtiva, setAbaAtiva] = useState<string>('dashboard')

  // ==================== ESTADOS DOS DADOS ====================
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([])
  const [loading, setLoading] = useState(true)

  // ==================== FILTROS E PESQUISAS ====================
  const [buscaCliente, setBuscaCliente] = useState('')

  // ==================== ESTADOS DOS FORMULÁRIOS ====================
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({})
  const [novoInsumo, setNovoInsumo] = useState<Partial<Insumo>>({
    unidade: 'unidade',
    quantidade: 0,
    preco_custo: 0,
    preco_venda: 0,
    margem_lucro: 0,
    minimo: 5
  })
  const [novaOrdem, setNovaOrdem] = useState<Partial<OrdemServico>>({ status: 'Aberto' })
  const [novoFinanceiro, setNovoFinanceiro] = useState<Partial<FinanceiroItem>>({ tipo: 'Entrada' })
  
  // USUÁRIOS
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senhaUsuario, setSenhaUsuario] = useState('')
  const [cargoUsuario, setCargoUsuario] = useState('Operador')
  const [permissoesUsuario, setPermissoesUsuario] = useState<string[]>(['dashboard'])

  // ==================== CARREGAMENTO E SINC. EM TEMPO REAL ====================
  useEffect(() => {
    fetchTodosDados()

    const channel = supabase
      .channel('erp-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, (payload) => {
        fetchUsuariosUpdateCurrent(payload)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => fetchClientes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insumos' }, () => fetchInsumos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens' }, () => fetchOrdens())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, () => fetchFinanceiro())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuarioAtual])

  const fetchTodosDados = async () => {
    setLoading(true)
    await Promise.all([
      fetchUsuarios(),
      fetchClientes(),
      fetchInsumos(),
      fetchOrdens(),
      fetchFinanceiro()
    ])
    setLoading(false)
  }

  const fetchUsuarios = async () => {
    const { data } = await supabase.from('usuarios').select('*').order('id', { ascending: true })
    if (data) setUsuarios(data)
  }

  // Atualiza a lista de usuários e também atualiza o usuário logado instantaneamente se ele for o editado
  const fetchUsuariosUpdateCurrent = async (payload: any) => {
    const { data } = await supabase.from('usuarios').select('*').order('id', { ascending: true })
    if (data) {
      setUsuarios(data)
      if (usuarioAtual) {
        const atualizado = data.find((u: Usuario) => u.id === usuarioAtual.id)
        if (atualizado) {
          setUsuarioAtual(atualizado)
        }
      }
    }
  }

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false })
    if (data) setClientes(data)
  }

  const fetchInsumos = async () => {
    const { data } = await supabase.from('insumos').select('*').order('id', { ascending: false })
    if (data) setInsumos(data)
  }

  const fetchOrdens = async () => {
    const { data } = await supabase.from('ordens').select('*').order('id', { ascending: false })
    if (data) setOrdens(data)
  }

  const fetchFinanceiro = async () => {
    const { data } = await supabase.from('financeiro').select('*').order('id', { ascending: false })
    if (data) setFinanceiro(data)
  }

  // ==================== LÓGICA DE LOGIN ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroLogin('')

    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('nome', nomeLogin.trim())
      .eq('senha', senhaLogin.trim())
      .single()

    if (data) {
      setUsuarioAtual(data)
      setAbaAtiva('dashboard')
    } else {
      setErroLogin('Nome de usuário ou senha incorretos.')
    }
  }

  const handleLogout = () => {
    setUsuarioAtual(null)
    setNomeLogin('')
    setSenhaLogin('')
  }

  // ==================== AÇÕES CRUD (SUPABASE) ====================
  
  // CLIENTES
  const handleAdicionarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoCliente.nome || !novoCliente.telefone) {
      alert('Nome/Empresa e Telefone são obrigatórios!')
      return
    }

    const item = {
      id: Date.now(),
      nome: novoCliente.nome,
      telefone: novoCliente.telefone,
      cnpj: novoCliente.cnpj || '',
      rg: novoCliente.rg || '',
      contato: novoCliente.contato || '',
      email: novoCliente.email || '',
      endereco: novoCliente.endereco || ''
    }

    await supabase.from('clientes').insert([item])
    setNovoCliente({})
  }

  const handleExcluirCliente = async (id: number) => {
    if (confirm('Deseja excluir este cliente?')) {
      await supabase.from('clientes').delete().eq('id', id)
    }
  }

  // INSUMOS / ESTOQUE
  const handleAdicionarInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoInsumo.nome) {
      alert('Nome do produto é obrigatório!')
      return
    }

    const custo = Number(novoInsumo.preco_custo || 0)
    const venda = Number(novoInsumo.preco_venda || 0)
    const margem = custo > 0 ? ((venda - custo) / custo) * 100 : 0

    const item = {
      id: Date.now(),
      nome: novoInsumo.nome,
      quantidade: Number(novoInsumo.quantidade || 0),
      unidade: novoInsumo.unidade || 'unidade',
      preco_custo: custo,
      preco_venda: venda,
      margem_lucro: Number(margem.toFixed(2)),
      minimo: Number(novoInsumo.minimo || 5)
    }

    await supabase.from('insumos').insert([item])
    setNovoInsumo({ unidade: 'unidade', quantidade: 0, preco_custo: 0, preco_venda: 0, margem_lucro: 0, minimo: 5 })
  }

  const handleAjustarEstoque = async (id: number, delta: number) => {
    const item = insumos.find((i) => i.id === id)
    if (!item) return

    const novaQtd = Math.max(0, item.quantidade + delta)
    await supabase.from('insumos').update({ quantidade: novaQtd }).eq('id', id)
  }

  const handleExcluirInsumo = async (id: number) => {
    if (confirm('Deseja excluir este item do estoque?')) {
      await supabase.from('insumos').delete().eq('id', id)
    }
  }

  // ORDENS DE SERVIÇO / PEDIDOS
  const handleAdicionarOrdem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaOrdem.cliente || !novaOrdem.produto || !novaOrdem.valor) {
      alert('Preencha os campos obrigatórios do pedido!')
      return
    }

    const item = {
      id: Date.now(),
      cliente: novaOrdem.cliente,
      produto: novaOrdem.produto,
      detalhes: novaOrdem.detalhes || '',
      valor: Number(novaOrdem.valor),
      status: novaOrdem.status || 'Aberto',
      data: new Date().toLocaleDateString('pt-BR')
    }

    await supabase.from('ordens').insert([item])
    setNovaOrdem({ status: 'Aberto' })
  }

  const handleMudarStatusOrdem = async (id: number, novoStatus: 'Aberto' | 'Em Andamento' | 'Concluído') => {
    const ordem = ordens.find((o) => o.id === id)
    if (!ordem) return

    await supabase.from('ordens').update({ status: novoStatus }).eq('id', id)

    if (novoStatus === 'Concluído' && ordem.status !== 'Concluído') {
      await supabase.from('financeiro').insert([
        {
          id: Date.now(),
          descricao: `Pedido #${ordem.id} - ${ordem.cliente}`,
          tipo: 'Entrada',
          valor: ordem.valor,
          data: new Date().toLocaleDateString('pt-BR')
        }
      ])
    }
  }

  // FINANCEIRO
  const handleAdicionarFinanceiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoFinanceiro.descricao || !novoFinanceiro.valor) {
      alert('Preencha a descrição e o valor do lançamento!')
      return
    }

    const item = {
      id: Date.now(),
      descricao: novoFinanceiro.descricao,
      tipo: novoFinanceiro.tipo || 'Entrada',
      valor: Number(novoFinanceiro.valor),
      data: new Date().toLocaleDateString('pt-BR')
    }

    await supabase.from('financeiro').insert([item])
    setNovoFinanceiro({ tipo: 'Entrada' })
  }

  // USUÁRIOS
  const handleSalvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeUsuario || !senhaUsuario) {
      alert('Preencha o nome e a senha do usuário!')
      return
    }

    if (usuarioEditandoId !== null) {
      await supabase
        .from('usuarios')
        .update({
          nome: nomeUsuario,
          senha: senhaUsuario,
          cargo: cargoUsuario,
          permissoes: permissoesUsuario
        })
        .eq('id', usuarioEditandoId)

      setUsuarioEditandoId(null)
    } else {
      const item = {
        id: Date.now(),
        nome: nomeUsuario,
        senha: senhaUsuario,
        cargo: cargoUsuario,
        permissoes: permissoesUsuario
      }
      await supabase.from('usuarios').insert([item])
    }

    setNomeUsuario('')
    setSenhaUsuario('')
    setCargoUsuario('Operador')
    setPermissoesUsuario(['dashboard'])
  }

  const handleIniciarEdicaoUsuario = (u: Usuario) => {
    setUsuarioEditandoId(u.id)
    setNomeUsuario(u.nome)
    setSenhaUsuario(u.senha || '')
    setCargoUsuario(u.cargo || 'Operador')
    setPermissoesUsuario(u.permissoes || ['dashboard'])
  }

  const handleCancelarEdicao = () => {
    setUsuarioEditandoId(null)
    setNomeUsuario('')
    setSenhaUsuario('')
    setCargoUsuario('Operador')
    setPermissoesUsuario(['dashboard'])
  }

  const handleExcluirUsuario = async (id: number) => {
    if (confirm('Deseja excluir este usuário?')) {
      await supabase.from('usuarios').delete().eq('id', id)
    }
  }

  const togglePermissao = (perm: string) => {
    if (permissoesUsuario.includes(perm)) {
      setPermissoesUsuario(permissoesUsuario.filter((p) => p !== perm))
    } else {
      setPermissoesUsuario([...permissoesUsuario, perm])
    }
  }

  // CÁLCULOS TOTAIS
  const totalEntradas = financeiro
    .filter((f) => f.tipo === 'Entrada')
    .reduce((acc, f) => acc + Number(f.valor), 0)

  const totalSaidas = financeiro
    .filter((f) => f.tipo === 'Saída')
    .reduce((acc, f) => acc + Number(f.valor), 0)

  const saldoTotal = totalEntradas - totalSaidas
  const alertasEstoque = insumos.filter((i) => Number(i.quantidade) <= Number(i.minimo))

  // ==================== TELA DE LOGIN ====================
  if (!usuarioAtual) {
    return (
      <div className="min-h-screen bg-amber-400 text-neutral-900 flex items-center justify-center p-4">
        <div className="bg-neutral-950 text-white border border-amber-500/30 rounded-3xl p-8 max-w-4xl w-full shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div>
            <div className="text-center md:text-left mb-6">
              <div className="mb-4 flex items-center justify-center md:justify-start">
                <img
                  src="/logo.png"
                  alt="IGX Gráfica Logo"
                  className="h-16 object-contain max-w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-amber-400">IGX GRÁFICA</h1>
              <p className="text-sm text-neutral-400 mt-1">Sistema de Gestão ERP & Impressão</p>
            </div>

            {erroLogin && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center">
                {erroLogin}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">NOME DE USUÁRIO</label>
                <input
                  type="text"
                  required
                  value={nomeLogin}
                  onChange={(e) => setNomeLogin(e.target.value)}
                  placeholder="Ex: Administrador"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">SENHA</label>
                <input
                  type="password"
                  required
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-400/20"
              >
                Acessar o Sistema
              </button>
            </form>
          </div>

          <div className="hidden md:flex flex-col gap-4 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
            <div className="relative h-40 rounded-xl overflow-hidden border border-neutral-800 shadow-md">
              <img
                src="http://googleusercontent.com/image_collection/image_retrieval/1270404648916990269_0"
                alt="Maquinaria Offset e Impressão"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Printer className="w-4 h-4" /> Produção & Offset
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-28 rounded-xl overflow-hidden border border-neutral-800 shadow-md">
                <img
                  src="http://googleusercontent.com/image_collection/image_retrieval/1270404648916990269_1"
                  alt="Tintas CMYK"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Palette className="w-3 h-3 text-amber-400" /> Qualidade CMYK
                  </span>
                </div>
              </div>

              <div className="relative h-28 rounded-xl overflow-hidden border border-neutral-800 shadow-md">
                <img
                  src="http://googleusercontent.com/image_collection/image_retrieval/1270404648916990269_2"
                  alt="Acabamento e Papel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" /> Acabamento
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ==================== PAINEL PRINCIPAL DO ERP ====================
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <h2 className="font-black text-lg leading-tight text-amber-400">IGX Gráfica</h2>
              <span className="text-xs text-neutral-400">Sistema ERP Cloud</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'pedidos', label: 'Pedidos / OS', icon: FileText },
              { id: 'clientes', label: 'Clientes', icon: Users },
              { id: 'estoque', label: 'Estoque / Insumos', icon: Package },
              { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
              { id: 'usuarios', label: 'Usuários', icon: UserCheck }
            ]
              .filter((item) => usuarioAtual.permissoes.includes(item.id))
              .map((item) => {
                const Icon = item.icon
                const ativo = abaAtiva === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setAbaAtiva(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                      ativo
                        ? 'bg-amber-400 text-black font-black shadow-lg shadow-amber-400/10'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                )
              })}
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{usuarioAtual.nome}</p>
              <p className="text-xs text-amber-400">{usuarioAtual.cargo}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair do Sistema"
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading && (
          <div className="text-xs text-amber-400 mb-4 animate-pulse">Sincronizando dados em tempo real...</div>
        )}

        {abaAtiva === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Painel de Controle</h1>
              <p className="text-sm text-neutral-400">Visão geral em tempo real da sua gráfica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">SALDO EM CAIXA</span>
                <p className={`text-2xl font-black mt-2 ${saldoTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {saldoTotal.toFixed(2)}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">RECEITAS</span>
                <p className="text-2xl font-black mt-2 text-emerald-400">R$ {totalEntradas.toFixed(2)}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">PEDIDOS ATIVOS</span>
                <p className="text-2xl font-black mt-2 text-amber-400">
                  {ordens.filter((o) => o.status !== 'Concluído').length}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">ALERTAS DE ESTOQUE</span>
                <p className="text-2xl font-black mt-2 text-amber-500">{alertasEstoque.length}</p>
              </div>
            </div>

            {alertasEstoque.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-amber-400 font-bold mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  Atenção: Itens com Estoque Abaixo do Mínimo
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {alertasEstoque.map((item) => (
                    <div key={item.id} className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 text-sm">
                      <span className="font-bold">{item.nome}</span>: {item.quantidade} {item.unidade} (Mín: {item.minimo})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'pedidos' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Ordens de Serviço e Pedidos</h1>
              <p className="text-sm text-neutral-400">Gerencie os pedidos da gráfica</p>
            </div>

            <form onSubmit={handleAdicionarOrdem} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-lg mb-2">Cadastrar Novo Pedido</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Cliente*"
                  required
                  value={novaOrdem.cliente || ''}
                  onChange={(e) => setNovaOrdem({ ...novaOrdem, cliente: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Produto / Serviço*"
                  required
                  value={novaOrdem.produto || ''}
                  onChange={(e) => setNovaOrdem({ ...novaOrdem, produto: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor Total (R$)*"
                  required
                  value={novaOrdem.valor || ''}
                  onChange={(e) => setNovaOrdem({ ...novaOrdem, valor: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-2 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Criar Pedido
                </button>
              </div>
              <textarea
                placeholder="Detalhes do pedido (medidas, papel, acabamento...)"
                value={novaOrdem.detalhes || ''}
                onChange={(e) => setNovaOrdem({ ...novaOrdem, detalhes: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400"
              />
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['Aberto', 'Em Andamento', 'Concluído'] as const).map((status) => (
                <div key={status} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  <h3 className="font-bold text-sm tracking-wider uppercase mb-4 text-neutral-400 border-b border-neutral-800 pb-2">
                    {status} ({ordens.filter((o) => o.status === status).length})
                  </h3>
                  <div className="space-y-3">
                    {ordens
                      .filter((o) => o.status === status)
                      .map((ordem) => (
                        <div key={ordem.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white">{ordem.cliente}</span>
                            <span className="text-xs font-black text-amber-400">R$ {Number(ordem.valor).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-neutral-300 font-medium">{ordem.produto}</p>
                          {ordem.detalhes && <p className="text-xs text-neutral-500">{ordem.detalhes}</p>}
                          
                          <div className="flex gap-2 pt-2 border-t border-neutral-900">
                            {status !== 'Aberto' && (
                              <button
                                onClick={() => handleMudarStatusOrdem(ordem.id, status === 'Concluído' ? 'Em Andamento' : 'Aberto')}
                                className="text-xs text-neutral-400 hover:text-white"
                              >
                                ← Voltar
                              </button>
                            )}
                            {status !== 'Concluído' && (
                              <button
                                onClick={() => handleMudarStatusOrdem(ordem.id, status === 'Aberto' ? 'Em Andamento' : 'Concluído')}
                                className="text-xs text-amber-400 hover:underline font-bold ml-auto"
                              >
                                Avançar →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'clientes' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
              <p className="text-sm text-neutral-400">Cadastre e consulte os seus clientes</p>
            </div>

            <form onSubmit={handleAdicionarCliente} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-lg mb-2">Cadastrar Novo Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome / Empresa*"
                  required
                  value={novoCliente.nome || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp*"
                  required
                  value={novoCliente.telefone || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Pessoa de Contato"
                  value={novoCliente.contato || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, contato: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="CNPJ"
                  value={novoCliente.cnpj || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="E-mail"
                  value={novoCliente.email || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-2 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Salvar Cliente
                </button>
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Pesquisar cliente por nome ou telefone..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Nome / Empresa</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">CNPJ / Documento</th>
                      <th className="p-3">Contato</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes
                      .filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) || c.telefone.includes(buscaCliente))
                      .map((cliente) => (
                        <tr key={cliente.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                          <td className="p-3 font-bold text-white">{cliente.nome}</td>
                          <td className="p-3">{cliente.telefone}</td>
                          <td className="p-3">{cliente.cnpj || '-'}</td>
                          <td className="p-3">{cliente.contato || '-'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleExcluirCliente(cliente.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'estoque' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Controle de Estoque e Insumos</h1>
              <p className="text-sm text-neutral-400">Gestão de materiais e papéis</p>
            </div>

            <form onSubmit={handleAdicionarInsumo} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-lg mb-2">Adicionar Novo Produto / Insumo</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Produto*"
                  required
                  value={novoInsumo.nome || ''}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, nome: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <select
                  value={novoInsumo.unidade || 'unidade'}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, unidade: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="unidade">Unidade</option>
                  <option value="resma">Resma</option>
                  <option value="caixa">Caixa</option>
                  <option value="metros">Metros</option>
                  <option value="m²">m²</option>
                  <option value="folhas">Folhas</option>
                  <option value="litros">Litros</option>
                </select>
                <input
                  type="number"
                  placeholder="Qtd Inicial"
                  value={novoInsumo.quantidade || ''}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, quantidade: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Estoque Mínimo Alerta"
                  value={novoInsumo.minimo || ''}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, minimo: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço Custo (R$)"
                  value={novoInsumo.preco_custo || ''}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, preco_custo: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço Venda (R$)"
                  value={novoInsumo.preco_venda || ''}
                  onChange={(e) => setNovoInsumo({ ...novoInsumo, preco_venda: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-2 rounded-xl transition flex items-center justify-center gap-2 col-span-2"
                >
                  <Plus className="w-4 h-4" /> Salvar no Estoque
                </button>
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Quantidade</th>
                      <th className="p-3">Custo</th>
                      <th className="p-3">Venda</th>
                      <th className="p-3">Margem</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="p-3 font-bold text-white">{item.nome}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              Number(item.quantidade) <= Number(item.minimo)
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-neutral-800 text-neutral-200'
                            }`}
                          >
                            {item.quantidade} {item.unidade}
                          </span>
                        </td>
                        <td className="p-3">R$ {Number(item.preco_custo).toFixed(2)}</td>
                        <td className="p-3">R$ {Number(item.preco_venda).toFixed(2)}</td>
                        <td className="p-3 text-emerald-400 font-bold">{item.margem_lucro}%</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleAjustarEstoque(item.id, 1)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-1 rounded-lg font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleAjustarEstoque(item.id, -1)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-1 rounded-lg font-bold"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleExcluirInsumo(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Fluxo de Caixa e Financeiro</h1>
              <p className="text-sm text-neutral-400">Registre as entradas e saídas financeiras</p>
            </div>

            <form onSubmit={handleAdicionarFinanceiro} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-lg mb-2">Novo Lançamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Descrição*"
                  required
                  value={novoFinanceiro.descricao || ''}
                  onChange={(e) => setNovoFinanceiro({ ...novoFinanceiro, descricao: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <select
                  value={novoFinanceiro.tipo || 'Entrada'}
                  onChange={(e) => setNovoFinanceiro({ ...novoFinanceiro, tipo: e.target.value as 'Entrada' | 'Saída' })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Entrada">Entrada (+)</option>
                  <option value="Saída">Saída (-)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)*"
                  required
                  value={novoFinanceiro.valor || ''}
                  onChange={(e) => setNovoFinanceiro({ ...novoFinanceiro, valor: Number(e.target.value) })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-2 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Lançar
                </button>
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeiro.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="p-3 text-neutral-400">{item.data}</td>
                        <td className="p-3 font-bold text-white">{item.descricao}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              item.tipo === 'Entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {item.tipo}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            item.tipo === 'Entrada' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {item.tipo === 'Entrada' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'usuarios' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Usuários e Permissões</h1>
              <p className="text-sm text-neutral-400">Controle de acesso por Nome, Senha e Nível de Privilégio</p>
            </div>

            <form onSubmit={handleSalvarUsuario} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">
                  {usuarioEditandoId !== null ? 'Editar Usuário / Redefinir Senha' : 'Cadastrar Novo Usuário'}
                </h2>
                {usuarioEditandoId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicao}
                    className="text-xs text-neutral-400 hover:text-white underline"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome de Usuário (Ex: Administrador)*"
                  required
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Senha / Redefinir Senha*"
                  required
                  value={senhaUsuario}
                  onChange={(e) => setSenhaUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Cargo / Nível (Ex: Administrador, Operador)"
                  value={cargoUsuario}
                  onChange={(e) => setCargoUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">NÍVEL DE PRIVILÉGIO (PERMISSÕES DE ACESSO)</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'pedidos', label: 'Pedidos / OS' },
                    { id: 'clientes', label: 'Clientes' },
                    { id: 'estoque', label: 'Estoque / Insumos' },
                    { id: 'financeiro', label: 'Financeiro' },
                    { id: 'usuarios', label: 'Usuários' }
                  ].map((p) => {
                    const marcado = permissoesUsuario.includes(p.id)
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => togglePermissao(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          marcado
                            ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                        }`}
                      >
                        {p.label} {marcado ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {usuarioEditandoId !== null ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                </button>
                {usuarioEditandoId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicao}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Nome de Usuário</th>
                      <th className="p-3">Cargo / Nível</th>
                      <th className="p-3">Permissões</th>
                      <th className="p-3 text-right">Ações (Editar / Excluir)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          {u.nome}
                        </td>
                        <td className="p-3 font-medium text-amber-400">{u.cargo}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {u.permissoes && u.permissoes.map((p) => (
                              <span key={p} className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-xs">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleIniciarEdicaoUsuario(u)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                            title="Editar Dados ou Redefinir Senha"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleExcluirUsuario(u.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 inline-flex items-center"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}