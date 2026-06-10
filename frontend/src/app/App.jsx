import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { api } from '../shared/api/client'
import { enqueue, flushQueue } from '../shared/offline/queue'

// Toast
const ToastCtx = createContext(null)
function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const add = useCallback((msg, type = 'info') => {
    const id = Math.random()
    setList(p => [...p, { id, msg, type }])
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  const toast = { success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-list">
        {list.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
const useToast = () => useContext(ToastCtx)

// Shared UI
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-icon" onClick={onClose}>x</button>
        </div>
        {children}
      </div>
    </div>
  )
}
function Spinner() { return <div className="spinner" /> }
function Badge({ label, color = 'slate' }) { return <span className={`badge badge--${color}`}>{label}</span> }
function Empty({ text }) { return <p className="empty">{text}</p> }

const SEV_COLOR = { BAIXA: 'green', MEDIA: 'amber', ALTA: 'orange', CRITICA: 'red' }
const PAY_COLOR = { PENDENTE: 'amber', PAGO: 'green', ATRASADO: 'red' }
const RNC_COLOR = { ABERTO: 'red', EM_TRATAMENTO: 'amber', FECHADO: 'green' }
const STATUS_COLOR = { CONCLUIDO: 'green', EM_ANDAMENTO: 'amber', PLANEJAMENTO: 'slate' }

// App
export function App() {
  const logged = Boolean(localStorage.getItem('accessToken'))
  return (
    <ToastProvider>
      <div className="shell">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={logged ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/projects/:id" element={logged ? <ProjectDetail /> : <Navigate to="/auth" />} />
          <Route path="/chat/:id" element={logged ? <Chat /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={logged ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/notifications" element={logged ? <Notifications /> : <Navigate to="/auth" />} />
        </Routes>
        {logged && <BottomNav />}
      </div>
    </ToastProvider>
  )
}

// Auth
function Auth() {
  const nav = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  async function login(e) {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      nav('/')
    } catch { toast.error('Credenciais invalidas. Verifique e-mail e senha.') }
    finally { setLoading(false) }
  }
  return (
    <main className="page page--center">
      <div className="auth-box">
        <h1 className="brand">ObraFacil</h1>
        <p className="brand-sub">Gestao de obras simplificada</p>
        <form className="card" onSubmit={login}>
          <label>E-mail</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          <label>Senha</label>
          <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="Sua senha" />
          <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </main>
  )
}

// Dashboard
function Dashboard() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const toast = useToast()

  async function load() {
    try {
      const [pRes, sRes] = await Promise.all([api.get('/projects'), api.get('/dashboard/stats')])
      setProjects(pRes.data); setStats(sRes.data)
    } catch { toast.error('Erro ao carregar projetos.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <main className="page">
      <header className="sticky">
        <div className="row"><h2>Dashboard</h2><button className="btn-sm" onClick={() => setShowCreate(true)}>+ Nova Obra</button></div>
      </header>
      {loading ? <Spinner /> : (
        <>
          {stats && <StatsCards stats={stats} />}
          <section className="grid mt-16">
            {projects.map(p => (
              <Link key={p.id} className="card project-card" to={`/projects/${p.id}`}>
                <div className="row"><h3>{p.nome}</h3><Badge label={p.status} color={STATUS_COLOR[p.status]} /></div>
                <p className="text-muted">{p.endereco}</p>
                <div className="progress-wrap mt-8"><progress value={p.progresso || 0} max="100" /><span>{p.progresso || 0}%</span></div>
              </Link>
            ))}
            {projects.length === 0 && <Empty text="Nenhuma obra cadastrada. Crie a primeira!" />}
          </section>
        </>
      )}
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />}
    </main>
  )
}

function StatsCards({ stats }) {
  const fmt = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  return (
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-value">{stats.total}</span><span className="stat-label">Obras</span></div>
      <div className="stat-card stat-card--amber"><span className="stat-value">{stats.emAndamento}</span><span className="stat-label">Em andamento</span></div>
      <div className="stat-card stat-card--green"><span className="stat-value">{stats.concluido}</span><span className="stat-label">Concluidas</span></div>
      <div className="stat-card stat-card--red"><span className="stat-value">{stats.rncAbertas}</span><span className="stat-label">RNCs abertas</span></div>
      <div className="stat-card stat-card--orange"><span className="stat-value">{stats.pagamentosVencendo}</span><span className="stat-label">Pgtos. vencendo</span></div>
      <div className="stat-card stat-card--blue"><span className="stat-value stat-value--sm">{fmt(stats.orcamentoTotal)}</span><span className="stat-label">Orcamento total</span></div>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ nome: '', endereco: '', clientId: '', orcamentoTotal: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { await api.post('/projects', { ...form, orcamentoTotal: Number(form.orcamentoTotal) }); toast.success('Obra criada!'); onCreated() }
    catch (err) { toast.error(err?.response?.data?.message || 'Erro ao criar obra.') }
    finally { setLoading(false) }
  }
  return (
    <Modal title="Nova Obra" onClose={onClose}>
      <form onSubmit={submit} className="form-stack">
        <label>Nome *</label><input required value={form.nome} onChange={set('nome')} placeholder="Ex: Residencial Jardins" />
        <label>Endereco</label><input value={form.endereco} onChange={set('endereco')} placeholder="Rua, numero, cidade" />
        <label>ID do cliente (UUID) *</label><input required value={form.clientId} onChange={set('clientId')} />
        <label>Orcamento total (R$) *</label><input required type="number" min="0" step="0.01" value={form.orcamentoTotal} onChange={set('orcamentoTotal')} />
        <button disabled={loading}>{loading ? 'Criando...' : 'Criar obra'}</button>
      </form>
    </Modal>
  )
}

// Project Detail
const TABS = ['status', 'etapas', 'financeiro', 'rnc', 'documentos', 'diario']

function ProjectDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('status')
  const [project, setProject] = useState(null)
  const toast = useToast()
  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => toast.error('Projeto nao encontrado.'))
    flushQueue(item => api.post(item.url, item.body))
  }, [id])
  if (!project) return <main className="page"><Spinner /></main>
  return (
    <main className="page">
      <header className="sticky">
        <div className="row"><div><h2>{project.nome}</h2><p className="text-muted">{project.endereco}</p></div><Badge label={project.status} color={STATUS_COLOR[project.status]} /></div>
        <div className="tabs mt-8">{TABS.map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      </header>
      {tab === 'status'     && <StatusTab project={project} />}
      {tab === 'etapas'     && <StagesTab projectId={id} />}
      {tab === 'financeiro' && <FinancialTab projectId={id} />}
      {tab === 'rnc'        && <RncTab projectId={id} />}
      {tab === 'documentos' && <DocumentsTab projectId={id} />}
      {tab === 'diario'     && <DiaryTab projectId={id} />}
      <Link className="card mt-16 text-center" to={`/chat/${id}`}>Abrir chat em tempo real</Link>
    </main>
  )
}

function StatusTab({ project }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const toast = useToast()
  async function aiSummary() {
    setLoading(true); setSummary(null)
    try { const { data } = await api.post(`/projects/${project.id}/executive-summary`); setSummary(data.summary); toast.success('Resumo gerado!') }
    catch (err) { toast.error(err?.response?.data?.message || 'Erro ao gerar resumo.') }
    finally { setLoading(false) }
  }
  return (
    <div className="mt-16">
      <div className="card">
        <h3>Progresso geral</h3>
        <div className="progress-wrap progress-wrap--large mt-8"><progress value={project.progresso || 0} max="100" /><span className="progress-pct">{project.progresso || 0}%</span></div>
        <div className="row mt-16">
          <div><span className="stat-label">Orcamento</span><p className="amount">{Number(project.orcamentoTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
          <button className="btn-outline" onClick={aiSummary} disabled={loading}>{loading ? 'Gerando...' : 'Resumo IA'}</button>
        </div>
      </div>
      {summary && <div className="card mt-8 summary-card"><h4>Resumo Executivo</h4><p className="summary-text">{summary}</p></div>}
    </div>
  )
}

function StagesTab({ projectId }) {
  const [stages, setStages] = useState([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const [expanded, setExpanded] = useState(null); const [addForm, setAddForm] = useState({ nome: '', ordem: '' }); const [addLoading, setAddLoading] = useState(false)
  const toast = useToast()
  async function load() { try { const r = await api.get(`/projects/${projectId}/stages`); setStages(r.data) } catch { toast.error('Erro ao carregar etapas.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [projectId])
  async function addStage(e) {
    e.preventDefault(); setAddLoading(true)
    try { const { data } = await api.post(`/projects/${projectId}/stages`, { nome: addForm.nome, ordem: Number(addForm.ordem) }); setStages(s => [...s, data]); toast.success('Etapa criada!'); setShowAdd(false); setAddForm({ nome: '', ordem: '' }) }
    catch { toast.error('Erro ao criar etapa.') } finally { setAddLoading(false) }
  }
  if (loading) return <Spinner />
  return (
    <div className="mt-16">
      <div className="row mb-8"><h3>Etapas</h3><button className="btn-sm" onClick={() => setShowAdd(true)}>+ Etapa</button></div>
      {stages.map(s => (
        <div key={s.id} className="card mb-8">
          <div className="row clickable" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div style={{ flex: 1 }}><b>{s.nome}</b><div className="progress-wrap mt-4"><progress value={s.progresso || 0} max="100" /><span>{s.progresso || 0}%</span></div></div>
            <div className="row gap-8">{s.concluido && <Badge label="Concluido" color="green" />}<span className="chevron">{expanded === s.id ? 'v' : '>'}</span></div>
          </div>
          {expanded === s.id && <ChecklistSection projectId={projectId} stageId={s.id} onUpdate={load} />}
        </div>
      ))}
      {stages.length === 0 && <Empty text="Nenhuma etapa cadastrada." />}
      {showAdd && (
        <Modal title="Nova Etapa" onClose={() => setShowAdd(false)}>
          <form onSubmit={addStage} className="form-stack">
            <label>Nome *</label><input required value={addForm.nome} onChange={e => setAddForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Fundacao" />
            <label>Ordem *</label><input required type="number" min="1" value={addForm.ordem} onChange={e => setAddForm(f => ({ ...f, ordem: e.target.value }))} />
            <button disabled={addLoading}>{addLoading ? 'Criando...' : 'Criar etapa'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function ChecklistSection({ projectId, stageId, onUpdate }) {
  const [items, setItems] = useState([]); const [showAdd, setShowAdd] = useState(false); const [newRotulo, setNewRotulo] = useState('')
  const toast = useToast()
  async function load() { try { const r = await api.get(`/projects/${projectId}/stages/${stageId}/checklist`); setItems(r.data) } catch { toast.error('Erro ao carregar checklist.') } }
  useEffect(() => { load() }, [stageId])
  async function toggle(item) { try { await api.patch(`/projects/${projectId}/stages/${stageId}/checklist/${item.id}`, { concluido: !item.concluido }); await load(); onUpdate() } catch { toast.error('Erro ao atualizar item.') } }
  async function addItem(e) {
    e.preventDefault(); if (!newRotulo.trim()) return
    try { const { data } = await api.post(`/projects/${projectId}/stages/${stageId}/checklist`, { rotulo: newRotulo }); setItems(i => [...i, data]); setNewRotulo(''); setShowAdd(false); onUpdate() }
    catch { toast.error('Erro ao adicionar item.') }
  }
  async function remove(itemId) { try { await api.delete(`/projects/${projectId}/stages/${stageId}/checklist/${itemId}`); setItems(i => i.filter(x => x.id !== itemId)); onUpdate() } catch { toast.error('Erro ao remover item.') } }
  return (
    <div className="checklist">
      {items.map(item => (
        <div key={item.id} className="checklist-item">
          <label><input type="checkbox" checked={Boolean(item.concluido)} onChange={() => toggle(item)} /><span className={item.concluido ? 'done' : ''}>{item.rotulo}</span></label>
          <button className="btn-icon" onClick={() => remove(item.id)}>X</button>
        </div>
      ))}
      {showAdd ? (
        <form onSubmit={addItem} className="checklist-add-form">
          <input autoFocus value={newRotulo} onChange={e => setNewRotulo(e.target.value)} placeholder="Descricao do item" />
          <button type="submit" className="btn-sm">Add</button>
          <button type="button" className="btn-sm btn-outline" onClick={() => setShowAdd(false)}>X</button>
        </form>
      ) : <button className="btn-link mt-8" onClick={() => setShowAdd(true)}>+ Adicionar item</button>}
    </div>
  )
}

function FinancialTab({ projectId }) {
  const [payments, setPayments] = useState([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const toast = useToast()
  async function load() { try { const r = await api.get(`/projects/${projectId}/payments`); setPayments(r.data) } catch { toast.error('Erro ao carregar pagamentos.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [projectId])
  async function markPaid(p) { try { await api.patch(`/projects/${projectId}/payments/${p.id}`, { status: 'PAGO' }); toast.success('Marcado como pago!'); load() } catch { toast.error('Erro ao atualizar.') } }
  async function del(p) { try { await api.delete(`/projects/${projectId}/payments/${p.id}`); setPayments(old => old.filter(x => x.id !== p.id)) } catch { toast.error('Erro ao excluir.') } }
  const total = payments.reduce((s, p) => s + Number(p.valor || 0), 0)
  const totalPago = payments.filter(p => p.status === 'PAGO').reduce((s, p) => s + Number(p.valor || 0), 0)
  const fmt = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (loading) return <Spinner />
  return (
    <div className="mt-16">
      <div className="row mb-8"><h3>Pagamentos</h3><button className="btn-sm" onClick={() => setShowAdd(true)}>+ Pagamento</button></div>
      <div className="stats-grid-2 mb-8">
        <div className="stat-card"><span className="stat-value stat-value--sm">{fmt(total)}</span><span className="stat-label">Total</span></div>
        <div className="stat-card stat-card--green"><span className="stat-value stat-value--sm">{fmt(totalPago)}</span><span className="stat-label">Pago</span></div>
      </div>
      {payments.map(p => (
        <div key={p.id} className="card mb-8">
          <div className="row"><div><b>{p.descricao}</b><p className="text-muted">{p.categoria} · venc. {p.dataVencimento}</p></div><div className="text-right"><p className="amount">{fmt(Number(p.valor))}</p><Badge label={p.status} color={PAY_COLOR[p.status]} /></div></div>
          <div className="row mt-8 gap-8">
            {p.status === 'PENDENTE' && <button className="btn-sm btn-green" onClick={() => markPaid(p)}>Pago</button>}
            <button className="btn-sm btn-outline btn-danger-text" onClick={() => del(p)}>Excluir</button>
          </div>
        </div>
      ))}
      {payments.length === 0 && <Empty text="Nenhum pagamento cadastrado." />}
      {showAdd && (
        <Modal title="Novo Pagamento" onClose={() => setShowAdd(false)}>
          <PaymentForm projectId={projectId} onCreated={p => { setPayments(old => [...old, p]); setShowAdd(false); toast.success('Pagamento adicionado!') }} />
        </Modal>
      )}
    </div>
  )
}

function PaymentForm({ projectId, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ descricao: '', categoria: '', valor: '', dataVencimento: '', status: 'PENDENTE' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { const { data } = await api.post(`/projects/${projectId}/payments`, { ...form, valor: Number(form.valor) }); onCreated(data) }
    catch { toast.error('Erro ao criar pagamento.') } finally { setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <label>Descricao *</label><input required value={form.descricao} onChange={set('descricao')} />
      <label>Categoria</label><input value={form.categoria} onChange={set('categoria')} placeholder="Material, Mao de obra..." />
      <label>Valor (R$) *</label><input required type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} />
      <label>Vencimento *</label><input required type="date" value={form.dataVencimento} onChange={set('dataVencimento')} />
      <label>Status</label>
      <select value={form.status} onChange={set('status')}>
        <option value="PENDENTE">Pendente</option><option value="PAGO">Pago</option><option value="ATRASADO">Atrasado</option>
      </select>
      <button disabled={loading}>{loading ? 'Salvando...' : 'Adicionar pagamento'}</button>
    </form>
  )
}

function RncTab({ projectId }) {
  const [rncs, setRncs] = useState([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const toast = useToast()
  async function load() { try { const r = await api.get(`/projects/${projectId}/nonconformities`); setRncs(r.data) } catch { toast.error('Erro ao carregar RNCs.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [projectId])
  async function setStatus(rnc, status) { try { await api.patch(`/projects/${projectId}/nonconformities/${rnc.id}`, { status }); toast.success('RNC atualizada!'); load() } catch { toast.error('Erro ao atualizar.') } }
  async function del(rnc) { try { await api.delete(`/projects/${projectId}/nonconformities/${rnc.id}`); setRncs(old => old.filter(x => x.id !== rnc.id)) } catch { toast.error('Erro ao excluir.') } }
  if (loading) return <Spinner />
  return (
    <div className="mt-16">
      <div className="row mb-8"><h3>Nao Conformidades</h3><button className="btn-sm" onClick={() => setShowAdd(true)}>+ RNC</button></div>
      {rncs.map(r => (
        <div key={r.id} className="card mb-8">
          <div className="row"><div><b>{r.titulo}</b><p className="text-muted">{r.data}</p></div><div className="col gap-4"><Badge label={r.gravidade} color={SEV_COLOR[r.gravidade]} /><Badge label={r.status} color={RNC_COLOR[r.status]} /></div></div>
          <p className="mt-8 text-muted">{r.descricao}</p>
          <div className="row mt-8 gap-8">
            {r.status === 'ABERTO' && <button className="btn-sm btn-amber" onClick={() => setStatus(r, 'EM_TRATAMENTO')}>Em tratamento</button>}
            {r.status !== 'FECHADO' && <button className="btn-sm btn-green" onClick={() => setStatus(r, 'FECHADO')}>Fechar</button>}
            <button className="btn-sm btn-outline btn-danger-text" onClick={() => del(r)}>Excluir</button>
          </div>
        </div>
      ))}
      {rncs.length === 0 && <Empty text="Nenhuma nao conformidade registrada." />}
      {showAdd && (
        <Modal title="Nova RNC" onClose={() => setShowAdd(false)}>
          <RncForm projectId={projectId} onCreated={r => { setRncs(old => [...old, r]); setShowAdd(false); toast.success('RNC registrada!') }} />
        </Modal>
      )}
    </div>
  )
}

function RncForm({ projectId, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ titulo: '', descricao: '', gravidade: 'MEDIA', data: new Date().toISOString().slice(0, 10) })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { const { data } = await api.post(`/projects/${projectId}/nonconformities`, form); onCreated(data) }
    catch { toast.error('Erro ao registrar RNC.') } finally { setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <label>Titulo *</label><input required value={form.titulo} onChange={set('titulo')} />
      <label>Descricao *</label><textarea required rows={3} value={form.descricao} onChange={set('descricao')} />
      <label>Gravidade</label>
      <select value={form.gravidade} onChange={set('gravidade')}><option value="BAIXA">Baixa</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="CRITICA">Critica</option></select>
      <label>Data *</label><input required type="date" value={form.data} onChange={set('data')} />
      <button disabled={loading}>{loading ? 'Salvando...' : 'Registrar RNC'}</button>
    </form>
  )
}

function DocumentsTab({ projectId }) {
  const [docs, setDocs] = useState([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const toast = useToast()
  async function load() { try { const r = await api.get(`/projects/${projectId}/documents`); setDocs(r.data) } catch { toast.error('Erro ao carregar documentos.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [projectId])
  if (loading) return <Spinner />
  return (
    <div className="mt-16">
      <div className="row mb-8"><h3>Documentos</h3><button className="btn-sm" onClick={() => setShowAdd(true)}>+ Documento</button></div>
      {docs.map(d => (
        <div key={d.id} className="card mb-8">
          <div className="row"><div><b>{d.nome}</b><p className="text-muted">{d.tipo} | {d.data}</p></div><a href={d.url} target="_blank" rel="noreferrer" className="btn-link">Abrir</a></div>
        </div>
      ))}
      {docs.length === 0 && <Empty text="Nenhum documento anexado." />}
      {showAdd && (
        <Modal title="Novo Documento" onClose={() => setShowAdd(false)}>
          <DocForm projectId={projectId} onCreated={d => { setDocs(old => [...old, d]); setShowAdd(false); toast.success('Documento adicionado!') }} />
        </Modal>
      )}
    </div>
  )
}

function DocForm({ projectId, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ nome: '', tipo: 'CONTRATO', url: '', data: new Date().toISOString().slice(0, 10) })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { const { data } = await api.post(`/projects/${projectId}/documents`, form); onCreated(data) }
    catch { toast.error('Erro ao adicionar documento.') } finally { setLoading(false) }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <label>Nome *</label><input required value={form.nome} onChange={set('nome')} />
      <label>Tipo</label>
      <select value={form.tipo} onChange={set('tipo')}><option value="CONTRATO">Contrato</option><option value="PLANTA">Planta</option><option value="LAUDO">Laudo</option><option value="OUTRO">Outro</option></select>
      <label>URL *</label><input required type="url" value={form.url} onChange={set('url')} placeholder="https://..." />
      <label>Data *</label><input required type="date" value={form.data} onChange={set('data')} />
      <button disabled={loading}>{loading ? 'Salvando...' : 'Adicionar'}</button>
    </form>
  )
}

function DiaryTab({ projectId }) {
  const [diaries, setDiaries] = useState([]); const [loading, setLoading] = useState(true)
  const [text, setText] = useState(''); const [clima, setClima] = useState('SOL'); const [saving, setSaving] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const toast = useToast()
  useEffect(() => {
    api.get(`/projects/${projectId}/diaries`).then(r => setDiaries(r.data)).catch(() => {}).finally(() => setLoading(false))
    const on = () => setOnline(true); const off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [projectId])
  async function save() {
    if (!text.trim()) return; setSaving(true)
    const body = { data: new Date().toISOString().slice(0, 10), descricao: text, clima, ocorrencias: 'Sem ocorrencias', idempotencyKey: crypto.randomUUID(), clientGeneratedId: crypto.randomUUID() }
    try {
      if (!navigator.onLine) { enqueue({ url: `/projects/${projectId}/diaries`, body }); toast.info('Salvo offline. Sera sincronizado ao conectar.'); setText('') }
      else { const { data } = await api.post(`/projects/${projectId}/diaries`, body); setDiaries(d => [data, ...d]); setText(''); toast.success('Entrada salva!') }
    } catch { toast.error('Erro ao salvar diario.') } finally { setSaving(false) }
  }
  return (
    <div className="mt-16">
      <div className="row mb-8"><h3>Diario de Obra</h3><Badge label={online ? 'Online' : 'Offline'} color={online ? 'green' : 'amber'} /></div>
      <div className="card mb-8">
        <label>Clima</label>
        <select value={clima} onChange={e => setClima(e.target.value)}><option value="SOL">Sol</option><option value="NUBLADO">Nublado</option><option value="CHUVA">Chuva</option></select>
        <label>Relato do dia</label>
        <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Descreva o progresso, equipe, ocorrencias..." />
        <button onClick={save} disabled={saving || !text.trim()}>{saving ? 'Salvando...' : 'Salvar entrada'}</button>
      </div>
      {loading ? <Spinner /> : (
        <>
          {diaries.map(d => <div key={d.id} className="card mb-8"><div className="row"><span className="text-muted">{d.data}</span><Badge label={d.clima} color="slate" /></div><p className="mt-8">{d.descricao}</p></div>)}
          {diaries.length === 0 && <Empty text="Nenhuma entrada no diario." />}
        </>
      )}
    </div>
  )
}

// Chat
function Chat() {
  const { id } = useParams()
  const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [loading, setLoading] = useState(true); const [connected, setConnected] = useState(false)
  const bottomRef = useRef(null); const stompRef = useRef(null)
  const toast = useToast()
  useEffect(() => {
    api.get(`/projects/${id}/messages`).then(r => setMsgs(r.data)).finally(() => setLoading(false))
    let client = null
    try {
      import('sockjs-client').then(({ default: SockJS }) =>
        import('stompjs').then(({ default: Stomp }) => {
          const socket = new SockJS(`${api.defaults.baseURL}/ws`)
          client = Stomp.over(socket); client.debug = null
          client.connect({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, () => {
            setConnected(true)
            client.subscribe(`/topic/chat.${id}`, msg => {
              const m = JSON.parse(msg.body)
              setMsgs(old => old.find(x => x.id === m.id) ? old : [...old, m])
            })
          }, () => setConnected(false))
          stompRef.current = client
        })
      ).catch(() => {})
    } catch {}
    return () => { try { stompRef.current?.disconnect() } catch {} }
  }, [id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  async function send(e) {
    e.preventDefault(); if (!text.trim()) return
    const draft = text; setText('')
    try {
      await api.post(`/projects/${id}/messages`, { text: draft, isDecision: false, idempotencyKey: crypto.randomUUID(), clientGeneratedId: crypto.randomUUID() })
      if (!connected) { const r = await api.get(`/projects/${id}/messages`); setMsgs(r.data) }
    } catch { toast.error('Erro ao enviar mensagem.'); setText(draft) }
  }
  return (
    <main className="page chat-page">
      <header className="sticky"><div className="row"><h2>Chat</h2><Badge label={connected ? 'Ao vivo' : 'Polling'} color={connected ? 'green' : 'amber'} /></div></header>
      <div className="chat-messages">
        {loading ? <Spinner /> : msgs.map(m => (
          <div key={m.id} className={`chat-bubble ${m.isDecision ? 'chat-bubble--decision' : ''}`}>
            {m.isDecision && <span className="decision-tag">DECISAO</span>}
            <p>{m.text}</p>
            {m.timestamp && <span className="chat-time">{new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={send}><input value={text} onChange={e => setText(e.target.value)} placeholder="Digite uma mensagem..." /><button type="submit">Enviar</button></form>
    </main>
  )
}

// Profile
function Profile() {
  const [me, setMe] = useState(null); const [editing, setEditing] = useState(false); const [form, setForm] = useState({ nome: '', avatarUrl: '' }); const [saving, setSaving] = useState(false)
  const nav = useNavigate(); const toast = useToast()
  useEffect(() => { api.get('/me').then(r => { setMe(r.data); setForm({ nome: r.data.nome || '', avatarUrl: r.data.avatarUrl || '' }) }).catch(() => toast.error('Erro ao carregar perfil.')) }, [])
  async function save(e) {
    e.preventDefault(); setSaving(true)
    try { const { data } = await api.patch('/me', form); setMe(m => ({ ...m, nome: data.nome, avatarUrl: data.avatarUrl })); setEditing(false); toast.success('Perfil atualizado!') }
    catch { toast.error('Erro ao salvar perfil.') } finally { setSaving(false) }
  }
  if (!me) return <main className="page"><Spinner /></main>
  return (
    <main className="page">
      <header className="sticky"><h2>Perfil</h2></header>
      <div className="card mt-16 text-center">
        {me.avatarUrl ? <img src={me.avatarUrl} alt="avatar" className="avatar" /> : <div className="avatar-placeholder">{(me.nome || 'U')[0].toUpperCase()}</div>}
        <h3 className="mt-8">{me.nome}</h3><p className="text-muted">{me.email}</p>
        <div className="row mt-8" style={{ justifyContent: 'center', gap: 8 }}><Badge label={me.role} color="slate" /><Badge label={me.plan} color="amber" /></div>
      </div>
      {editing ? (
        <div className="card mt-16">
          <form onSubmit={save} className="form-stack">
            <label>Nome</label><input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <label>URL do avatar</label><input type="url" value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
            <div className="row gap-8 mt-8"><button disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button><button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancelar</button></div>
          </form>
        </div>
      ) : <button className="card mt-16 btn-link-card" onClick={() => setEditing(true)}>Editar perfil</button>}
      <button className="card mt-16 btn-danger-card" onClick={() => { localStorage.clear(); nav('/auth') }}>Sair da conta</button>
    </main>
  )
}

// Notifications
function Notifications() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true)
  const toast = useToast()
  useEffect(() => { api.get('/notifications').then(r => setItems(r.data)).finally(() => setLoading(false)) }, [])
  async function markRead(id) { try { await api.patch(`/notifications/${id}/read`); setItems(old => old.map(n => n.id === id ? { ...n, lido: true } : n)) } catch { toast.error('Erro ao marcar notificacao.') } }
  async function markAll() { await Promise.all(items.filter(n => !n.lido).map(n => api.patch(`/notifications/${n.id}/read`).catch(() => {}))); setItems(old => old.map(n => ({ ...n, lido: true }))); toast.success('Todas marcadas como lidas!') }
  const unread = items.filter(n => !n.lido).length
  return (
    <main className="page">
      <header className="sticky"><div className="row"><h2>Notificacoes {unread > 0 && <span className="notif-badge">{unread}</span>}</h2>{unread > 0 && <button className="btn-link" onClick={markAll}>Marcar todas</button>}</div></header>
      {loading ? <Spinner /> : (
        <div className="mt-16">
          {items.map(n => (
            <div key={n.id} className={`card mb-8 notif-item ${n.lido ? '' : 'notif-item--unread'}`}>
              <div className="row"><div><b>{n.titulo}</b>{n.corpo && <p className="text-muted">{n.corpo}</p>}</div>{!n.lido && <button className="btn-sm" onClick={() => markRead(n.id)}>Lida</button>}</div>
            </div>
          ))}
          {items.length === 0 && <Empty text="Nenhuma notificacao." />}
        </div>
      )}
    </main>
  )
}

// Bottom Nav
function BottomNav() {
  const [unread, setUnread] = useState(0)
  useEffect(() => { api.get('/notifications').then(r => setUnread(r.data.filter(n => !n.lido).length)).catch(() => {}) }, [])
  return (
    <nav className="bottom">
      <Link to="/">Dashboard</Link>
      <Link to="/notifications" className="notif-link">Notif {unread > 0 && <span className="notif-badge">{unread}</span>}</Link>
      <Link to="/profile">Perfil</Link>
    </nav>
  )
}
