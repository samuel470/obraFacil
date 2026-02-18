import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../shared/api/client'
import { enqueue, flushQueue } from '../shared/offline/queue'

export function App() {
  const logged = Boolean(localStorage.getItem('accessToken'))
  return (
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
  )
}

function Auth() {
  const nav = useNavigate(); const [email, setEmail] = useState('responsavel@obrafacil.app'); const [senha, setSenha] = useState('123456')
  async function login(e) {
    e.preventDefault(); const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); nav('/')
  }
  return <main className="page"><h1>ObraFácil</h1><form className="card" onSubmit={login}><input value={email} onChange={(e) => setEmail(e.target.value)} /><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /><button>Entrar</button></form></main>
}

function Dashboard() {
  const [projects, setProjects] = useState([])
  useEffect(() => { api.get('/projects').then((r) => setProjects(r.data)) }, [])
  const avg = useMemo(() => projects.length ? Math.round(projects.reduce((a, p) => a + (p.progresso || 0), 0) / projects.length) : 0, [projects])
  return <main className="page"><header className="sticky"><h2>Dashboard</h2><p>Progresso médio: {avg}%</p></header><section className="grid">{projects.map((p) => <Link key={p.id} className="card" to={`/projects/${p.id}`}><h3>{p.nome}</h3><p>{p.endereco}</p><progress value={p.progresso} max="100"/></Link>)}</section></main>
}

function ProjectDetail() {
  const { id } = useParams(); const [tab, setTab] = useState('status'); const [project, setProject] = useState(null)
  const [diary, setDiary] = useState('')
  useEffect(() => { api.get(`/projects/${id}`).then((r) => setProject(r.data)); flushQueue(async (item) => api.post(item.url, item.body)) }, [id])
  async function saveDiary() {
    const body = { data: new Date().toISOString().slice(0, 10), descricao: diary, clima: 'SOL', ocorrencias: 'Sem ocorrências', idempotencyKey: crypto.randomUUID(), clientGeneratedId: crypto.randomUUID() }
    if (!navigator.onLine) { enqueue({ url: `/projects/${id}/diaries`, body }); setDiary(''); return }
    await api.post(`/projects/${id}/diaries`, body); setDiary('')
  }
  async function aiSummary() { const { data } = await api.post(`/projects/${id}/executive-summary`); alert(data.summary) }
  if (!project) return <main className="page">Carregando...</main>
  return <main className="page"><header className="sticky"><h2>{project.nome}</h2><div className="tabs">{['status','financeiro','rnc','documentos','diario'].map((t)=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div></header>
    {tab==='status' && <section className="card"><p>Progresso: {project.progresso}%</p><button onClick={aiSummary}>Resumo Executivo IA</button></section>}
    {tab==='financeiro' && <CrudList title="Pagamentos" path={`/projects/${id}/payments`} />}
    {tab==='rnc' && <CrudList title="RNC" path={`/projects/${id}/nonconformities`} />}
    {tab==='documentos' && <CrudList title="Documentos" path={`/projects/${id}/documents`} />}
    {tab==='diario' && <section className="card"><textarea value={diary} onChange={(e)=>setDiary(e.target.value)} placeholder="Diário de obra (offline-ready)"/><button onClick={saveDiary}>Salvar diário</button><p>{navigator.onLine?'Online':'Offline - será sincronizado'}</p></section>}
    <Link className="card" to={`/chat/${id}`}>Abrir chat em tempo real</Link>
  </main>
}

function CrudList({ title, path }) {
  const [items, setItems] = useState([])
  useEffect(() => { api.get(path).then((r) => setItems(r.data)) }, [path])
  return <section className="card"><h3>{title}</h3><ul>{items.map((i) => <li key={i.id}>{i.titulo || i.nome || i.descricao}</li>)}</ul></section>
}

function Chat() {
  const { id } = useParams(); const [items, setItems] = useState([]); const [text, setText] = useState('')
  useEffect(() => { api.get(`/projects/${id}/messages`).then((r) => setItems(r.data)) }, [id])
  async function send() { const { data } = await api.post(`/projects/${id}/messages`, { text, isDecision: false, idempotencyKey: crypto.randomUUID(), clientGeneratedId: crypto.randomUUID() }); setItems((old) => [...old, data]); setText('') }
  return <main className="page"><h2>Chat</h2><section className="card">{items.map((m) => <p key={m.id}><b>{m.isDecision ? 'DECISÃO:' : ''}</b> {m.text}</p>)}</section><div className="card"><input value={text} onChange={(e) => setText(e.target.value)} /><button onClick={send}>Enviar</button></div></main>
}

function Profile() {
  const [me, setMe] = useState(null); const nav = useNavigate()
  useEffect(() => { api.get('/me').then((r) => setMe(r.data)) }, [])
  return <main className="page"><h2>Perfil</h2><section className="card"><pre>{JSON.stringify(me, null, 2)}</pre><button onClick={() => { localStorage.clear(); nav('/auth') }}>Sair</button></section></main>
}

function Notifications() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/notifications').then((r) => setItems(r.data)) }, [])
  return <main className="page"><h2>Notificações</h2><section className="card">{items.map((n) => <div key={n.id}><p>{n.titulo}</p><small>{n.lido ? 'Lida' : 'Nova'}</small></div>)}</section></main>
}

function BottomNav() { return <nav className="bottom"><Link to="/">Dashboard</Link><Link to="/notifications">Notificações</Link><Link to="/profile">Perfil</Link></nav> }
