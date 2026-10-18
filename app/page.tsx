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
  Edit3,
  Printer,
  Calendar,
  Clock,
  Wrench
} from 'lucide-react'

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
  status?: 'Ativo' | 'Inativo'
}

export interface Servico {
  id: string
  nome: string
  unidade: string
  valorVenda: number
  status: 'Ativo' | 'Inativo'
}

type OrdemServico = {
  id: number
  numero_pedido?: string
  cliente: string
  telefone_cliente?: string
  documento_cliente?: string
  produto: string
  detalhes: string
  quantidade: number
  valor_unitario: number
  desconto: number
  frete: number
  valor: number
  forma_pagamento: string
  status_pagamento: 'Pago' | 'A pagar'
  status_entrega: 'Entregue' | 'Agendado'
  status: 'Em Aberto' | 'Em Andamento' | 'Finalizado'
  data: string
  data_pedido?: string
  data_entrega?: string
  vendedor?: string
}

type FinanceiroItem = {
  id: number
  descricao: string
  tipo: 'Entrada' | 'Saída'
  valor: number
  data: string
}

export default function ERPGrafica() {
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null)
  const [nomeLogin, setNomeLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<string>('dashboard')

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [servicos, setServicos] = useState<Servico[]>([
    { id: 'SERV-001', nome: 'Criação de Arte / Layout', unidade: 'Unidade', valorVenda: 50.00, status: 'Ativo' },
    { id: 'SERV-002', nome: 'Corte e Vinco Manual', unidade: 'Cento', valorVenda: 25.00, status: 'Ativo' },
    { id: 'SERV-003', nome: 'Acabamento em Espiral', unidade: 'Unidade', valorVenda: 5.00, status: 'Ativo' }
  ])
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([])
  const [loading, setLoading] = useState(true)

  // Sub-aba do Catálogo (Produtos ou Serviços)
  const [abaCatalogo, setAbaCatalogo] = useState<'produtos' | 'servicos'>('produtos')

  const [horaAtual, setHoraAtual] = useState('')
  const [dataAtual, setDataAtual] = useState('')
  const [diaHoje, setDiaHoje] = useState<number>(1)

  useEffect(() => {
    const atualizarRelogio = () => {
      const agora = new Date()
      setHoraAtual(agora.toLocaleTimeString('pt-BR'))
      setDataAtual(
        agora.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      )
      setDiaHoje(agora.getDate())
    }
    atualizarRelogio()
    const timer = setInterval(atualizarRelogio, 1000)
    return () => clearInterval(timer)
  }, [])

  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({})
  
  // Estados para Produto/Insumo
  const [novoInsumo, setNovoInsumo] = useState<Partial<Insumo>>({
    unidade: 'unidade',
    quantidade: 0,
    preco_custo: 0,
    preco_venda: 0,
    margem_lucro: 0,
    minimo: 5,
    status: 'Ativo'
  })
  const [insumoEditandoId, setInsumoEditandoId] = useState<number | null>(null)

  // Formulário de novo/editar Serviço
  const [novoServico, setNovoServico] = useState({
    nome: '',
    unidade: 'Unidade',
    valorVenda: '',
    status: 'Ativo' as 'Ativo' | 'Inativo'
  })
  const [servicoEditandoId, setServicoEditandoId] = useState<string | null>(null)

  // Gerador de código automático (SERV-001, SERV-002...)
  const gerarProximoCodigoServico = () => {
    const proximoNum = servicos.length + 1
    return `SERV-${String(proximoNum).padStart(3, '0')}`
  }

  const handleIniciarEdicaoServico = (s: Servico) => {
    setServicoEditandoId(s.id)
    setNovoServico({
      nome: s.nome,
      unidade: s.unidade,
      valorVenda: s.valorVenda.toString(),
      status: s.status
    })
  }

  const handleCancelarEdicaoServico = () => {
    setServicoEditandoId(null)
    setNovoServico({ nome: '', unidade: 'Unidade', valorVenda: '', status: 'Ativo' })
  }

  const handleSalvarServico = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoServico.nome || !novoServico.valorVenda) return

    if (servicoEditandoId !== null) {
      setServicos(servicos.map(s => s.id === servicoEditandoId ? {
        ...s,
        nome: novoServico.nome,
        unidade: novoServico.unidade,
        valorVenda: Number(novoServico.valorVenda),
        status: novoServico.status
      } : s))
      setServicoEditandoId(null)
    } else {
      const itemServico: Servico = {
        id: gerarProximoCodigoServico(),
        nome: novoServico.nome,
        unidade: novoServico.unidade,
        valorVenda: Number(novoServico.valorVenda),
        status: novoServico.status
      }
      setServicos([...servicos, itemServico])
    }

    setNovoServico({ nome: '', unidade: 'Unidade', valorVenda: '', status: 'Ativo' })
  }

  const [novaOrdem, setNovaOrdem] = useState<Partial<OrdemServico>>({
    status: 'Em Aberto',
    status_pagamento: 'A pagar',
    status_entrega: 'Agendado',
    forma_pagamento: 'PIX',
    quantidade: 1,
    valor_unitario: 0,
    desconto: 0,
    frete: 0,
    data_pedido: typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '',
    vendedor: ''
  })

  useEffect(() => {
    if (usuarioAtual && !novaOrdem.vendedor) {
      setNovaOrdem((prev) => ({ ...prev, vendedor: usuarioAtual.nome }))
    }
  }, [usuarioAtual])

  const [novoFinanceiro, setNovoFinanceiro] = useState<Partial<FinanceiroItem>>({ tipo: 'Entrada' })
  
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senhaUsuario, setSenhaUsuario] = useState('')
  const [cargoUsuario, setCargoUsuario] = useState('Operador')
  const [permissoesUsuario, setPermissoesUsuario] = useState<string[]>(['dashboard'])

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

  const fetchUsuariosUpdateCurrent = async (_payload: any) => {
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

  const handleClienteChange = (nomeClienteSelecionado: string) => {
    const clienteEncontrado = clientes.find((c) => c.nome === nomeClienteSelecionado)
    if (clienteEncontrado) {
      setNovaOrdem((prev) => ({
        ...prev,
        cliente: clienteEncontrado.nome,
        telefone_cliente: clienteEncontrado.telefone || '',
        documento_cliente: clienteEncontrado.cnpj || clienteEncontrado.rg || ''
      }))
    } else {
      setNovaOrdem((prev) => ({
        ...prev,
        cliente: nomeClienteSelecionado,
        telefone_cliente: '',
        documento_cliente: ''
      }))
    }
  }

  const calcularValorTotal = (qtd = novaOrdem.quantidade || 1, unit = novaOrdem.valor_unitario || 0, desc = novaOrdem.desconto || 0, frt = novaOrdem.frete || 0) => {
    const subtotal = Number(qtd) * Number(unit)
    const total = subtotal - Number(desc) + Number(frt)
    return Math.max(0, total)
  }

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

  // GERENCIAMENTO DE PRODUTOS / INSUMOS
  const handleIniciarEdicaoInsumo = (item: Insumo) => {
    setInsumoEditandoId(item.id)
    setNovoInsumo({
      nome: item.nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      preco_custo: item.preco_custo,
      preco_venda: item.preco_venda,
      margem_lucro: item.margem_lucro,
      minimo: item.minimo,
      status: item.status || 'Ativo'
    })
  }

  const handleCancelarEdicaoInsumo = () => {
    setInsumoEditandoId(null)
    setNovoInsumo({ unidade: 'unidade', quantidade: 0, preco_custo: 0, preco_venda: 0, margem_lucro: 0, minimo: 5, status: 'Ativo' })
  }

  const handleSalvarInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoInsumo.nome) {
      alert('Nome do produto é obrigatório!')
      return
    }

    const custo = Number(novoInsumo.preco_custo || 0)
    const venda = Number(novoInsumo.preco_venda || 0)
    const margem = custo > 0 ? ((venda - custo) / custo) * 100 : 0

    if (insumoEditandoId !== null) {
      await supabase
        .from('insumos')
        .update({
          nome: novoInsumo.nome,
          quantidade: Number(novoInsumo.quantidade || 0),
          unidade: novoInsumo.unidade || 'unidade',
          preco_custo: custo,
          preco_venda: venda,
          margem_lucro: Number(margem.toFixed(2)),
          minimo: Number(novoInsumo.minimo || 5),
          status: novoInsumo.status || 'Ativo'
        })
        .eq('id', insumoEditandoId)

      setInsumoEditandoId(null)
    } else {
      const item = {
        id: Date.now(),
        nome: novoInsumo.nome,
        quantidade: Number(novoInsumo.quantidade || 0),
        unidade: novoInsumo.unidade || 'unidade',
        preco_custo: custo,
        preco_venda: venda,
        margem_lucro: Number(margem.toFixed(2)),
        minimo: Number(novoInsumo.minimo || 5),
        status: novoInsumo.status || 'Ativo'
      }
      await supabase.from('insumos').insert([item])
    }

    setNovoInsumo({ unidade: 'unidade', quantidade: 0, preco_custo: 0, preco_venda: 0, margem_lucro: 0, minimo: 5, status: 'Ativo' })
  }

  const handleAjustarEstoque = async (id: number, delta: number) => {
    const item = insumos.find((i) => i.id === id)
    if (!item) return

    const novaQtd = Math.max(0, item.quantidade + delta)
    await supabase.from('insumos').update({ quantidade: novaQtd }).eq('id', id)
  }

  const handleExcluirInsumo = async (id: number) => {
    if (confirm('Deseja excluir este item do catálogo?')) {
      await supabase.from('insumos').delete().eq('id', id)
    }
  }

  const handleAdicionarOrdem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaOrdem.cliente || !novaOrdem.produto || novaOrdem.valor_unitario === undefined) {
      alert('Preencha os campos obrigatórios do pedido!')
      return
    }

    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const dia = String(agora.getDate()).padStart(2, '0')
    const hora = String(agora.getHours()).padStart(2, '0')
    const min = String(agora.getMinutes()).padStart(2, '0')
    const seg = String(agora.getSeconds()).padStart(2, '0')
    const numeroGerado = `PED-${ano}${mes}${dia}-${hora}${min}${seg}`

    const qtd = Number(novaOrdem.quantidade || 1)
    const unit = Number(novaOrdem.valor_unitario || 0)
    const desc = Number(novaOrdem.desconto || 0)
    const frt = Number(novaOrdem.frete || 0)
    const valorTotalCalc = calcularValorTotal(qtd, unit, desc, frt)

    const item = {
      id: Date.now(),
      numero_pedido: numeroGerado,
      cliente: novaOrdem.cliente,
      telefone_cliente: novaOrdem.telefone_cliente || '',
      documento_cliente: novaOrdem.documento_cliente || '',
      produto: novaOrdem.produto,
      detalhes: novaOrdem.detalhes || '',
      quantidade: qtd,
      valor_unitario: unit,
      desconto: desc,
      frete: frt,
      valor: valorTotalCalc,
      forma_pagamento: novaOrdem.forma_pagamento || 'PIX',
      status_pagamento: novaOrdem.status_pagamento || 'A pagar',
      status_entrega: novaOrdem.status_entrega || 'Agendado',
      status: novaOrdem.status || 'Em Aberto',
      data: new Date().toLocaleDateString('pt-BR'),
      data_pedido: novaOrdem.data_pedido || new Date().toISOString().split('T')[0],
      data_entrega: novaOrdem.data_entrega || '',
      vendedor: novaOrdem.vendedor || usuarioAtual?.nome || 'Geral'
    }

    await supabase.from('ordens').insert([item])

    if (item.status_pagamento === 'Pago') {
      await supabase.from('financeiro').insert([
        {
          id: Date.now() + 1,
          descricao: `Pedido ${numeroGerado} - ${item.cliente}`,
          tipo: 'Entrada',
          valor: valorTotalCalc,
          data: new Date().toLocaleDateString('pt-BR')
        }
      ])
    }

    setNovaOrdem({
      status: 'Em Aberto',
      status_pagamento: 'A pagar',
      status_entrega: 'Agendado',
      forma_pagamento: 'PIX',
      quantidade: 1,
      valor_unitario: 0,
      desconto: 0,
      frete: 0,
      data_pedido: typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '',
      vendedor: usuarioAtual?.nome || ''
    })
  }

  const handleMudarStatusOrdem = async (id: number, novoStatus: 'Em Aberto' | 'Em Andamento' | 'Finalizado') => {
    await supabase.from('ordens').update({ status: novoStatus }).eq('id', id)
  }

  const handleImprimirOrdem = (ordem: OrdemServico) => {
    const janelaImpressao = window.open('', '_blank', 'width=800,height=700')
    if (!janelaImpressao) return

    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Pedido ${ordem.numero_pedido || '#' + ordem.id} - IGX Gráfica</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: bold; color: #b45309; }
            .info-box { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #f1f1f1; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">IGX GRÁFICA</div>
              <div>Sistema de Gestão & Impressão</div>
            </div>
            <div style="text-align: right;">
              <h2>PEDIDO / OS: ${ordem.numero_pedido || '#' + ordem.id}</h2>
              <div>Status: <b>${ordem.status}</b></div>
            </div>
          </div>

          <div class="info-box">
            <h3>Dados do Cliente</h3>
            <p><b>Cliente / Empresa:</b> ${ordem.cliente}</p>
            <p><b>Telefone / WhatsApp:</b> ${ordem.telefone_cliente || 'Não informado'}</p>
            <p><b>CNPJ / RG:</b> ${ordem.documento_cliente || 'Não informado'}</p>
          </div>

          <div class="info-box">
            <h3>Detalhes do Produto e Valores</h3>
            <table>
              <tr>
                <th>Produto / Serviço</th>
                <th>Qtd</th>
                <th>Vlr Unitário</th>
                <th>Desconto</th>
                <th>Frete</th>
                <th>Total</th>
              </tr>
              <tr>
                <td><b>${ordem.produto}</b><br><small>${ordem.detalhes || ''}</small></td>
                <td>${ordem.quantidade || 1}</td>
                <td>R$ ${Number(ordem.valor_unitario || 0).toFixed(2)}</td>
                <td>R$ ${Number(ordem.desconto || 0).toFixed(2)}</td>
                <td>R$ ${Number(ordem.frete || 0).toFixed(2)}</td>
                <td><b>R$ ${Number(ordem.valor).toFixed(2)}</b></td>
              </tr>
            </table>

            <div class="grid" style="margin-top: 15px;">
              <p><b>Forma de Pagamento:</b> ${ordem.forma_pagamento || '-'}</p>
              <p><b>Status Pagamento:</b> <span style="color: ${ordem.status_pagamento === 'Pago' ? 'green' : 'red'}; font-weight: bold;">${ordem.status_pagamento}</span></p>
              <p><b>Status de Entrega:</b> ${ordem.status_entrega || '-'}</p>
              <p><b>Data de Entrega:</b> ${ordem.data_entrega || 'A combinar'}</p>
              <p><b>Vendedor:</b> ${ordem.vendedor || '-'}</p>
              <p><b>Data do Pedido:</b> ${ordem.data_pedido || '-'}</p>
            </div>
          </div>

          <div class="footer">
            <p>IGX Gráfica — Qualidade e Agilidade em Impressão Digital e Offset.</p>
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    janelaImpressao.document.close()
  }

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

  const handleExcluirUsuario = async (id: number) => {
    if (confirm('Deseja excluir este usuário?')) {
      await supabase.from('usuarios').delete().eq('id', id)
    }
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

  const togglePermissao = (perm: string) => {
    if (permissoesUsuario.includes(perm)) {
      setPermissoesUsuario(permissoesUsuario.filter((p) => p !== perm))
    } else {
      setPermissoesUsuario([...permissoesUsuario, perm])
    }
  }

  const totalEntradas = financeiro
    .filter((f) => f.tipo === 'Entrada')
    .reduce((acc, f) => acc + Number(f.valor), 0)

  const totalSaidas = financeiro
    .filter((f) => f.tipo === 'Saída')
    .reduce((acc, f) => acc + Number(f.valor), 0)

  const saldoTotal = totalEntradas - totalSaidas
  const alertasEstoque = insumos.filter((i) => Number(i.quantidade) <= Number(i.minimo))

  const hojeStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : ''
  const pedidosNoPrazo = ordens.filter(
    (o) => o.status !== 'Finalizado' && o.data_entrega && o.data_entrega <= hojeStr
  )

  if (!usuarioAtual) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0 grid grid-cols-3 opacity-30 pointer-events-none filter blur-[1px]">
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=800"
              alt="Impressão Gráfica"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1572044162444-ad60f1284dea?auto=format&fit=crop&q=80&w=800"
              alt="Rolos de Papel e Impressão"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800"
              alt="Tintas e Acabamento"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="absolute inset-0 z-0 bg-neutral-950/80 backdrop-blur-sm" />

        <div className="relative z-10 bg-neutral-950/95 text-white border border-amber-500/40 rounded-3xl p-8 max-w-4xl w-full shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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

          <div className="bg-neutral-900/90 p-6 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-6 shadow-inner">
            <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                ⏱️ Horário Oficial
              </div>
              <div className="text-4xl font-black text-white tracking-wider font-mono">
                {horaAtual || '00:00:00'}
              </div>
              <div className="text-xs text-neutral-400 capitalize mt-1">
                {dataAtual || 'Carregando data...'}
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                📅 Calendário Operacional
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => (
                  <span key={idx} className="font-bold text-neutral-500 py-1">{dia}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const diaNum = i + 1
                  const isHoje = diaNum === diaHoje
                  return (
                    <div
                      key={i}
                      className={`py-1.5 rounded-lg text-xs font-medium transition ${
                        isHoje
                          ? 'bg-amber-400 text-black font-black shadow-md'
                          : 'text-neutral-300 hover:bg-neutral-900'
                      }`}
                    >
                      {diaNum}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'pedidos', label: 'Pedidos / OS', icon: FileText },
              { id: 'clientes', label: 'Clientes', icon: Users },
              { id: 'estoque', label: 'Catálogo', icon: Package },
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
              <p className="text-sm text-neutral-400">Visão geral operacional e prazos da sua gráfica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">PEDIDOS ATIVOS</span>
                <p className="text-3xl font-black mt-2 text-amber-400">
                  {ordens.filter((o) => o.status !== 'Finalizado').length}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">ALERTAS DE ESTOQUE</span>
                <p className="text-3xl font-black mt-2 text-amber-500">{alertasEstoque.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <h2>Estoque Abaixo do Mínimo ({alertasEstoque.length})</h2>
                </div>
                {alertasEstoque.length === 0 ? (
                  <p className="text-xs text-neutral-400">Nenhum item com estoque crítico no momento.</p>
                ) : (
                  <div className="space-y-2">
                    {alertasEstoque.map((item) => (
                      <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex justify-between items-center text-sm">
                        <span className="font-bold text-white">{item.nome}</span>
                        <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg font-bold">
                          {item.quantidade} {item.unidade} (Mín: {item.minimo})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-5 h-5" />
                  <h2>Pedidos Próximos ou no Prazo de Entrega ({pedidosNoPrazo.length})</h2>
                </div>
                {pedidosNoPrazo.length === 0 ? (
                  <p className="text-xs text-neutral-400">Nenhum pedido pendente com entrega para hoje ou vencida.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pedidosNoPrazo.map((ordem) => (
                      <div key={ordem.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex justify-between items-center text-sm">
                        <div>
                          <span className="text-xs text-amber-400 font-bold">{ordem.numero_pedido || '#' + ordem.id}</span>
                          <p className="font-bold text-white">{ordem.cliente} — <span className="text-neutral-400 text-xs">{ordem.produto}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'pedidos' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Pedidos / Ordens de Serviço</h1>
              <p className="text-sm text-neutral-400">Gerenciamento de ordens e produção</p>
            </div>

            <form onSubmit={handleAdicionarOrdem} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
              <h2 className="text-lg font-bold text-amber-400">Novo Pedido / OS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Cliente</label>
                  <input
                    type="text"
                    list="lista-clientes-pedido"
                    required
                    placeholder="Selecione ou digite o cliente..."
                    value={novaOrdem.cliente || ''}
                    onChange={(e) => handleClienteChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <datalist id="lista-clientes-pedido">
                    {clientes.map((c) => (
                      <option key={c.id} value={c.nome} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={novaOrdem.telefone_cliente || ''}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, telefone_cliente: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={novaOrdem.documento_cliente || ''}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, documento_cliente: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    placeholder="Documento"
                  />
                </div>
              </div>

              {/* CAMPO DE AUTOCOMPLETAR PARA PRODUTOS E SERVIÇOS (Apenas Ativos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Produto / Serviço (Autocompletar)</label>
                  <input
                    type="text"
                    required
                    list="lista-catalogo-ativo"
                    placeholder="Digite para buscar produto ou serviço ativo..."
                    value={novaOrdem.produto || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setNovaOrdem((prev) => ({ ...prev, produto: val }))
                      
                      const prodEncontrado = insumos.find((i) => i.nome.toLowerCase() === val.toLowerCase() && i.status !== 'Inativo')
                      if (prodEncontrado) {
                        setNovaOrdem((prev) => ({ ...prev, valor_unitario: prodEncontrado.preco_venda }))
                      } else {
                        const servEncontrado = servicos.find((s) => s.nome.toLowerCase() === val.toLowerCase() && s.status === 'Ativo')
                        if (servEncontrado) {
                          setNovaOrdem((prev) => ({ ...prev, valor_unitario: servEncontrado.valorVenda }))
                        }
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <datalist id="lista-catalogo-ativo">
                    {insumos.filter(i => i.status !== 'Inativo').map((i) => (
                      <option key={`prod-${i.id}`} value={i.nome}>[Produto] R$ {i.preco_venda}</option>
                    ))}
                    {servicos.filter(s => s.status === 'Ativo').map((s) => (
                      <option key={`serv-${s.id}`} value={s.nome}>[{s.id} - Serviço] R$ {s.valorVenda}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Detalhes / Especificações</label>
                  <input
                    type="text"
                    value={novaOrdem.detalhes || ''}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, detalhes: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Papel Couché 150g, Cor 4x0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={novaOrdem.quantidade || 1}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, quantidade: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Vlr Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaOrdem.valor_unitario || 0}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, valor_unitario: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaOrdem.desconto || 0}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, desconto: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Frete (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaOrdem.frete || 0}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, frete: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Forma Pagamento</label>
                  <select
                    value={novaOrdem.forma_pagamento || 'PIX'}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, forma_pagamento: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão Crédito">Cartão Crédito</option>
                    <option value="Cartão Débito">Cartão Débito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Faturado">Faturado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Status Pagto</label>
                  <select
                    value={novaOrdem.status_pagamento || 'A pagar'}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, status_pagamento: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="A pagar">A pagar</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Data de Entrega Prevista</label>
                  <input
                    type="date"
                    value={novaOrdem.data_entrega || ''}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, data_entrega: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Vendedor</label>
                  <input
                    type="text"
                    value={novaOrdem.vendedor || ''}
                    onChange={(e) => setNovaOrdem({ ...novaOrdem, vendedor: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl transition shadow-lg shadow-amber-400/20 text-sm"
                  >
                    Registrar Pedido
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-800 font-bold">Lista de Pedidos</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                    <tr>
                      <th className="p-4">Nº Pedido</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Pagamento</th>
                      <th className="p-4">Status Produção</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {ordens.map((ordem) => (
                      <tr key={ordem.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-mono font-bold text-amber-400">{ordem.numero_pedido || '#' + ordem.id}</td>
                        <td className="p-4 font-bold">{ordem.cliente}</td>
                        <td className="p-4">{ordem.produto}</td>
                        <td className="p-4 font-bold text-emerald-400">R$ {Number(ordem.valor).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${ordem.status_pagamento === 'Pago' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {ordem.status_pagamento}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={ordem.status}
                            onChange={(e) => handleMudarStatusOrdem(ordem.id, e.target.value as any)}
                            className="bg-neutral-950 border border-neutral-800 text-xs rounded-lg px-2 py-1 text-white font-semibold focus:outline-none"
                          >
                            <option value="Em Aberto">Em Aberto</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Finalizado">Finalizado</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleImprimirOrdem(ordem)}
                            title="Imprimir Pedido / OS"
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 inline-flex items-center"
                          >
                            <Printer className="w-4 h-4" />
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

        {abaAtiva === 'clientes' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
              <p className="text-sm text-neutral-400">Cadastro de clientes e empresas parceiras</p>
            </div>

            <form onSubmit={handleAdicionarCliente} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-amber-400">Novo Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Nome do Cliente / Empresa"
                  value={novoCliente.nome || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Telefone / WhatsApp"
                  value={novoCliente.telefone || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="CNPJ ou RG"
                  value={novoCliente.cnpj || ''}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-amber-400/20"
              >
                Cadastrar Cliente
              </button>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-800 font-bold">Clientes Cadastrados</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                    <tr>
                      <th className="p-4">Nome / Empresa</th>
                      <th className="p-4">Telefone</th>
                      <th className="p-4">Documento</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {clientes.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-bold">{c.nome}</td>
                        <td className="p-4">{c.telefone}</td>
                        <td className="p-4">{c.cnpj || c.rg || '-'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleExcluirCliente(c.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
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
              <h1 className="text-2xl font-bold">Catálogo</h1>
              <p className="text-sm text-neutral-400">Gerenciamento de produtos, insumos e serviços</p>
            </div>

            {/* Sub-abas do Catálogo */}
            <div className="flex border-b border-neutral-800 gap-4">
              <button
                onClick={() => setAbaCatalogo('produtos')}
                className={`pb-3 font-bold text-sm border-b-2 transition ${
                  abaCatalogo === 'produtos'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                📦 Produtos (Estoque)
              </button>
              <button
                onClick={() => setAbaCatalogo('servicos')}
                className={`pb-3 font-bold text-sm border-b-2 transition ${
                  abaCatalogo === 'servicos'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                🛠️ Serviços
              </button>
            </div>

            {/* ABA 1: PRODUTOS / ESTOQUE */}
            {abaCatalogo === 'produtos' && (
              <div className="space-y-6">
                <form onSubmit={handleSalvarInsumo} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-amber-400">
                    {insumoEditandoId !== null ? 'Editar Produto / Insumo' : 'Novo Produto / Insumo'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Nome do Item</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Papel Couché A4"
                        value={novoInsumo.nome || ''}
                        onChange={(e) => setNovoInsumo({ ...novoInsumo, nome: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Quantidade</label>
                      <input
                        type="number"
                        placeholder="Quantidade Inicial"
                        value={novoInsumo.quantidade || 0}
                        onChange={(e) => setNovoInsumo({ ...novoInsumo, quantidade: Number(e.target.value) })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Preço de Venda (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={novoInsumo.preco_venda || 0}
                        onChange={(e) => setNovoInsumo({ ...novoInsumo, preco_venda: Number(e.target.value) })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Status</label>
                      <select
                        value={novoInsumo.status || 'Ativo'}
                        onChange={(e) => setNovoInsumo({ ...novoInsumo, status: e.target.value as any })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-amber-400/20"
                    >
                      {insumoEditandoId !== null ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </button>
                    {insumoEditandoId !== null && (
                      <button
                        type="button"
                        onClick={handleCancelarEdicaoInsumo}
                        className="bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-neutral-800 font-bold">Lista de Produtos</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                        <tr>
                          <th className="p-4">Nome</th>
                          <th className="p-4">Qtd</th>
                          <th className="p-4">Preço Venda</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {insumos.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-950/50">
                            <td className="p-4 font-bold">{item.nome}</td>
                            <td className="p-4">{item.quantidade} {item.unidade}</td>
                            <td className="p-4 text-emerald-400 font-bold">R$ {Number(item.preco_venda).toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${item.status === 'Inativo' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {item.status || 'Ativo'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleIniciarEdicaoInsumo(item)}
                                title="Editar Produto"
                                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 inline-flex items-center"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAjustarEstoque(item.id, 1)}
                                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-bold"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleAjustarEstoque(item.id, -1)}
                                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-bold"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleExcluirInsumo(item.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition inline-flex"
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

            {/* ABA 2: SERVIÇOS */}
            {abaCatalogo === 'servicos' && (
              <div className="space-y-6">
                <form onSubmit={handleSalvarServico} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-amber-400">
                    {servicoEditandoId !== null ? `Editar Serviço (${servicoEditandoId})` : 'Novo Serviço'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Código</label>
                      <input
                        type="text"
                        disabled
                        value={servicoEditandoId !== null ? servicoEditandoId : gerarProximoCodigoServico()}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-amber-400 font-mono font-bold w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Nome do Serviço</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Criação de Arte"
                        value={novoServico.nome}
                        onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Unidade</label>
                      <select
                        value={novoServico.unidade}
                        onChange={(e) => setNovoServico({ ...novoServico, unidade: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      >
                        <option value="Unidade">Unidade</option>
                        <option value="Caixa">Caixa</option>
                        <option value="Resma">Resma</option>
                        <option value="Cento">Cento</option>
                        <option value="Milheiro">Milheiro</option>
                        <option value="m²">m²</option>
                        <option value="Hora">Hora</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Valor de Venda (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0,00"
                        value={novoServico.valorVenda}
                        onChange={(e) => setNovoServico({ ...novoServico, valorVenda: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 items-center justify-between pt-2">
                    <div className="w-48">
                      <label className="block text-xs text-neutral-400 mb-1">Status</label>
                      <select
                        value={novoServico.status}
                        onChange={(e) => setNovoServico({ ...novoServico, status: e.target.value as any })}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 w-full"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-amber-400/20"
                      >
                        {servicoEditandoId !== null ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                      </button>
                      {servicoEditandoId !== null && (
                        <button
                          type="button"
                          onClick={handleCancelarEdicaoServico}
                          className="bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-neutral-800 font-bold">Serviços Cadastrados</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                        <tr>
                          <th className="p-4">Código</th>
                          <th className="p-4">Nome</th>
                          <th className="p-4">Unidade</th>
                          <th className="p-4">Valor Venda</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {servicos.map((s) => (
                          <tr key={s.id} className="hover:bg-neutral-950/50">
                            <td className="p-4 font-mono font-bold text-amber-400">{s.id}</td>
                            <td className="p-4 font-bold">{s.nome}</td>
                            <td className="p-4">{s.unidade}</td>
                            <td className="p-4 text-emerald-400 font-bold">R$ {s.valorVenda.toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${s.status === 'Inativo' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleIniciarEdicaoServico(s)}
                                title="Editar Serviço"
                                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 inline-flex items-center"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setServicos(servicos.map(item => item.id === s.id ? { ...item, status: item.status === 'Ativo' ? 'Inativo' : 'Ativo' } : item))
                                }}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded-lg font-bold"
                              >
                                Alternar Status
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
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Controle Financeiro</h1>
              <p className="text-sm text-neutral-400">Fluxo de caixa e movimentações</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">TOTAL ENTRADAS</span>
                <p className="text-3xl font-black mt-2 text-emerald-400">R$ {totalEntradas.toFixed(2)}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">TOTAL SAÍDAS</span>
                <p className="text-3xl font-black mt-2 text-red-400">R$ {totalSaidas.toFixed(2)}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="text-xs text-neutral-400 font-semibold">SALDO EM CAIXA</span>
                <p className={`text-3xl font-black mt-2 ${saldoTotal >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  R$ {saldoTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-800 font-bold">Histórico de Movimentações</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                    <tr>
                      <th className="p-4">Data</th>
                      <th className="p-4">Descrição</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {financeiro.map((f) => (
                      <tr key={f.id} className="hover:bg-neutral-950/50">
                        <td className="p-4">{f.data}</td>
                        <td className="p-4 font-bold">{f.descricao}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${f.tipo === 'Entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {f.tipo}
                          </span>
                        </td>
                        <td className={`p-4 text-right font-bold ${f.tipo === 'Entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {f.tipo === 'Entrada' ? '+' : '-'} R$ {Number(f.valor).toFixed(2)}
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
              <h1 className="text-2xl font-bold">Controle de Usuários e Permissões</h1>
              <p className="text-sm text-neutral-400">Gerencie quem pode acessar cada área do sistema</p>
            </div>

            <form onSubmit={handleSalvarUsuario} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-amber-400">
                {usuarioEditandoId !== null ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Nome de Usuário"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="password"
                  required
                  placeholder="Senha"
                  value={senhaUsuario}
                  onChange={(e) => setSenhaUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Cargo (Ex: Gerente, Operador)"
                  value={cargoUsuario}
                  onChange={(e) => setCargoUsuario(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">Permissões de Acesso</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'pedidos', label: 'Pedidos / OS' },
                    { id: 'clientes', label: 'Clientes' },
                    { id: 'estoque', label: 'Catálogo' },
                    { id: 'financeiro', label: 'Financeiro' },
                    { id: 'usuarios', label: 'Usuários' }
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-3 rounded-xl cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={permissoesUsuario.includes(p.id)}
                        onChange={() => togglePermissao(p.id)}
                        className="accent-amber-400"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-amber-400/20"
                >
                  {usuarioEditandoId !== null ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
                {usuarioEditandoId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicao}
                    className="bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-800 font-bold">Usuários Cadastrados</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase">
                    <tr>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Cargo</th>
                      <th className="p-4">Permissões</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-950/50">
                        <td className="p-4 font-bold">{u.nome}</td>
                        <td className="p-4">{u.cargo}</td>
                        <td className="p-4 text-xs text-neutral-400">{u.permissoes?.join(', ')}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleIniciarEdicaoUsuario(u)}
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 inline-flex"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirUsuario(u.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition inline-flex"
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