import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon, type IconName } from './Icon'
import { projects, starters, assistantReplies, type Language, type Project } from './fixtures'

type Message = { role: 'user' | 'assistant'; text: string }
type Modal = 'new' | 'settings' | 'guide' | 'runtimes' | 'git' | null

function FileMark({ name }: { name: string }) {
  const extension = name.split('.').pop()
  return <span className={`file-mark ${extension}`}>{extension === 'py' ? 'Py' : extension === 'ts' ? 'TS' : extension === 'js' ? 'JS' : extension === 'html' ? '‹›' : extension === 'sql' ? 'SQL' : 'M↓'}</span>
}

export default function App() {
  const [project, setProject] = useState<Project>({ ...projects[0], files: { ...projects[0].files } })
  const [activeFile, setActiveFile] = useState('')
  const [openedFiles, setOpenedFiles] = useState<string[]>([])
  const [welcome, setWelcome] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [assistantOpen, setAssistantOpen] = useState(window.innerWidth > 900)
  const [explorerOpen, setExplorerOpen] = useState(window.innerWidth > 640)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalTab, setTerminalTab] = useState('Terminal')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newName, setNewName] = useState('')
  const [language, setLanguage] = useState<Language>('Python')
  const [validation, setValidation] = useState('')
  const [notice, setNotice] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(false)
  const [appVersion, setAppVersion] = useState('0.1.0')
  const [dirtyFiles, setDirtyFiles] = useState<string[]>([])
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const upload = useRef<HTMLInputElement>(null)
  const messageEnd = useRef<HTMLDivElement>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const lineNumbers = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => { window.api?.getAppInfo().then(info => setAppVersion(info.version)).catch(() => setNotice('Les informations desktop ne sont pas disponibles.')) }, [])
  useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timeout) }, [notice])
  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages])
  useEffect(() => {
    if (modal) { previousFocus.current = document.activeElement as HTMLElement; closeButton.current?.focus() }
    else previousFocus.current?.focus()
  }, [modal])
  useEffect(() => {
    const protectChanges = (event: BeforeUnloadEvent) => {
      if (!dirtyFiles.length || window.api) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', protectChanges)
    return () => window.removeEventListener('beforeunload', protectChanges)
  }, [dirtyFiles])
  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        setNotice('Les modifications restent dans cette session. Utilisez Exporter pour conserver le fichier.')
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); setExplorerOpen(true) }
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [])

  function openFile(name: string) { setActiveFile(name); setWelcome(false); setCursor({ line: 1, column: 1 }); setOpenedFiles(previous => previous.includes(name) ? previous : [...previous, name]); if (window.innerWidth <= 640) setExplorerOpen(false) }
  function openProject(next: Project) {
    if (dirtyFiles.length) { setNotice('Exportez les fichiers modifiés avant de changer de projet.'); return false }
    setProject({ ...next, files: { ...next.files } }); setDirtyFiles([])
    const first = Object.keys(next.files)[0]
    setOpenedFiles([first]); setActiveFile(first); setCursor({ line: 1, column: 1 }); setWelcome(false); setModal(null)
    return true
  }
  function closeFile(name: string) { const remaining = openedFiles.filter(file => file !== name); setOpenedFiles(remaining); if (name === activeFile) { setActiveFile(remaining[remaining.length - 1] || ''); if (!remaining.length) setWelcome(true) } }
  function createProject(event: FormEvent) {
    event.preventDefault()
    if (!/^[\p{L}\p{N}_ -]{2,40}$/u.test(newName.trim())) { setValidation('Choisissez un nom de 2 à 40 caractères, sans caractères spéciaux.'); return }
    if (!openProject({ id: 'session', name: newName.trim(), description: 'Votre nouveau projet', language, time: 'Cette session', color: 'blue', files: starters[language] })) return
    setNotice('Projet créé dans cette session. Exportez vos fichiers pour les conserver.'); setNewName(''); setValidation('')
  }
  async function importFiles(files: FileList | null) {
    if (!files?.length) return
    const imported: Record<string, string> = {}
    for (const file of Array.from(files)) {
      if (file.size > 500_000) { setNotice(`${file.name} dépasse la limite de 500 Ko.`); continue }
      try { imported[file.name] = await file.text() } catch { setNotice(`Impossible de lire ${file.name}.`) }
    }
    if (Object.keys(imported).length) openProject({ id: 'import', name: 'fichiers-importés', description: 'Fichiers ouverts', language: 'TypeScript', color: 'blue', time: 'Cette session', files: imported })
    if (upload.current) upload.current.value = ''
  }
  function exportFile() {
    if (!activeFile) return
    const url = URL.createObjectURL(new Blob([project.files[activeFile]], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = activeFile; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    setDirtyFiles(previous => previous.filter(name => name !== activeFile)); setNotice(`${activeFile} a été exporté.`)
  }
  function sendMessage(text: string, response?: string) {
    if (!text.trim()) return
    setMessages(previous => [...previous, { role: 'user', text: text.trim() }, { role: 'assistant', text: response || 'Le panneau Claude est actuellement une démonstration locale, sans appel à une IA. Vous pouvez explorer les suggestions ci-dessus. La connexion à Claude et le partage explicite du contexte sont prévus dans la feuille de route.' }]); setPrompt('')
  }
  const fileNames = Object.keys(project.files).filter(name => !searchOpen || !query || `${name}\n${project.files[name]}`.toLowerCase().includes(query.toLowerCase()))
  const code = project.files[activeFile] || ''
  const activity: { icon: IconName; label: string; action: () => void; active?: boolean }[] = [
    { icon: 'files', label: 'Explorateur', action: () => { setExplorerOpen(!explorerOpen); setSearchOpen(false) }, active: explorerOpen && !searchOpen },
    { icon: 'search', label: 'Rechercher', action: () => { setSearchOpen(!searchOpen); setExplorerOpen(true) }, active: searchOpen },
    { icon: 'branch', label: 'Contrôle de version', action: () => setModal('git') },
    { icon: 'blocks', label: 'Langages et runtimes', action: () => setModal('runtimes') },
    { icon: 'spark', label: 'Assistant Claude', action: () => setAssistantOpen(!assistantOpen), active: assistantOpen }
  ]

  return <div className="app-shell">
    <header className="titlebar">
      <div className="title-brand"><img src="./20code-icon.png" alt="" /><strong><span>20</span>Code</strong></div>
      <nav className="menubar" aria-label="Menu principal">
        <button onClick={() => upload.current?.click()}>Fichier</button><button onClick={() => setModal('settings')}>Édition</button><button onClick={() => setAssistantOpen(!assistantOpen)}>Affichage</button><button onClick={() => setModal('new')}>Projet</button><button onClick={() => setModal('guide')}>Aide</button>
      </nav>
      <button className="command-search" onClick={() => { setSearchOpen(true); setExplorerOpen(true) }}><Icon name="search" size={14} /><span>Rechercher dans votre espace</span><kbd>Ctrl K</kbd></button>
      <div className="title-right"><span className="version">v{appVersion}</span><button className="icon-button" title="Disposition des panneaux" onClick={() => setAssistantOpen(!assistantOpen)}><Icon name="panel" size={17} /></button></div>
    </header>

    <div className={`workspace ${explorerOpen ? '' : 'no-explorer'} ${assistantOpen ? '' : 'no-assistant'}`}>
      <nav className="activitybar" aria-label="Outils">
        <div className="activity-top">{activity.map(item => <button key={item.label} title={item.label} aria-label={item.label} aria-pressed={!!item.active} className={item.active ? 'active' : ''} onClick={item.action}><Icon name={item.icon} size={22} /></button>)}</div>
        <div className="activity-bottom"><button title="Guide de démarrage" aria-label="Guide de démarrage" onClick={() => setModal('guide')}><Icon name="help" size={22} /></button><button title="Paramètres" aria-label="Paramètres" onClick={() => setModal('settings')}><Icon name="settings" size={22} /></button><div className="profile" title="Espace local">20</div></div>
      </nav>

      {explorerOpen && <aside className="explorer">
        <div className="panel-heading"><span>{searchOpen ? 'RECHERCHE' : 'EXPLORATEUR'}</span><button className="icon-button" onClick={() => setModal('new')} title="Nouveau projet"><Icon name="plus" size={17} /></button></div>
        {searchOpen && <div className="file-search"><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Nom ou contenu…" aria-label="Rechercher un fichier" /></div>}
        <div className="project-heading"><Icon name="chevron" size={12} style={{ transform: 'rotate(90deg)' }} /><span>{project.name.toUpperCase()}</span><span className="project-dot" /></div>
        <div className="file-tree">{fileNames.map(name => <button className={activeFile === name && !welcome ? 'selected' : ''} key={name} onClick={() => openFile(name)}><FileMark name={name} /><span>{name}</span>{dirtyFiles.includes(name) && <span className="dirty-dot" />}</button>)}{!fileNames.length && <p className="search-empty">Aucun fichier ne correspond à votre recherche.</p>}</div>
        <div className="explorer-bottom"><div className="local-label"><span className="green-dot" /> ESPACE LOCAL</div><p>Une idée. Tous vos langages.</p><button onClick={() => setModal('runtimes')}><Icon name="blocks" size={15} /> Gérer les runtimes <Icon name="chevron" size={13} /></button></div>
      </aside>}

      <main className="main-area">
        <div className="tabbar"><button className={`editor-tab welcome-tab ${welcome ? 'selected' : ''}`} onClick={() => setWelcome(true)}><Icon name="home" size={15} /><span>Bienvenue</span></button>{openedFiles.map(name => <div className={`editor-tab ${!welcome && activeFile === name ? 'selected' : ''}`} key={name}><button onClick={() => openFile(name)}><FileMark name={name} />{name}{dirtyFiles.includes(name) && <span className="dirty-dot" />}</button><button aria-label={`Fermer ${name}`} onClick={() => closeFile(name)}><Icon name="close" size={12} /></button></div>)}<div className="tab-space" /><button className="icon-button" title="Afficher le terminal" onClick={() => setTerminalOpen(!terminalOpen)}><Icon name="terminal" size={17} /></button></div>

        {welcome ? <div className="welcome-content">
          <div className="welcome-hero"><div className="eyebrow"><span className="blue-dot" /> VOTRE ATELIER DE DÉVELOPPEMENT</div><h1>Les grandes idées<br />commencent par <span>une ligne.</span></h1><p>Un espace pour coder, explorer et créer.<br />Tous vos langages. Un seul logiciel. Votre rythme.</p><div className="hero-actions"><button className="primary-button" onClick={() => setModal('new')}><Icon name="plus" size={18} /> Nouveau projet <kbd>+</kbd></button><button className="secondary-button" onClick={() => upload.current?.click()}><Icon name="folder" size={17} /> Ouvrir des fichiers</button></div><div className="hero-watermark" aria-hidden="true">{'</>'}</div></div>
          <section className="recent-section"><div className="section-heading"><h2>Un point de départ</h2><span>PROJETS EXEMPLES</span></div><div className="project-list">{projects.map(item => <button className="project-card" key={item.id} onClick={() => openProject(item)}><span className={`project-icon ${item.color}`}><Icon name={item.language === 'HTML' ? 'code' : 'folder'} size={21} /></span><span className="project-details"><strong>{item.name}</strong><span>{item.description}</span></span><span className={`language-badge ${item.color}`}>{item.language}</span><Icon name="arrow" size={16} /></button>)}</div></section>
          <section className="toolkit-section"><div className="section-heading"><h2>Moins de configuration. Plus de création.</h2></div><div className="toolkit-grid"><button className="toolkit-card" onClick={() => setModal('runtimes')}><div className="toolkit-icon"><Icon name="blocks" size={20} /></div><strong>Vos langages, réunis.</strong><p>Python, JavaScript, C++ et bien plus.<br />Un environnement qui vous suit.</p><span>Explorer les langages <Icon name="arrow" size={14} /></span></button><button className="toolkit-card ai-card" onClick={() => { setAssistantOpen(true); sendMessage('Comment démarrer mon premier projet ?', assistantReplies.start) }}><div className="toolkit-icon"><Icon name="spark" size={20} /></div><strong>Une idée de plus, avec Claude.</strong><p>Un assistant à vos côtés pour<br />comprendre et améliorer votre code.</p><span>Découvrir l’assistant <Icon name="arrow" size={14} /></span></button></div></section>
          <div className="welcome-footer"><span><Icon name="code" size={15} /> Conçu pour les esprits qui construisent.</span><button onClick={() => setModal('guide')}>Guide de démarrage <Icon name="external" size={12} /></button></div>
        </div> : <div className="editor-container"><div className="editor-toolbar"><span>{project.name} <Icon name="chevron" size={12} /> <FileMark name={activeFile} /> {activeFile}</span><div><button onClick={exportFile} title="Exporter le fichier"><Icon name="download" size={14} /> Exporter</button><button onClick={() => { setTerminalOpen(true); setTerminalTab('Terminal') }} title="Aperçu de l’exécution"><Icon name="play" size={14} /> Exécuter</button></div></div><div className="code-editor" style={{ fontSize }}><div className="line-numbers" ref={lineNumbers} aria-hidden="true">{code.split('\n').map((_, index) => <div key={index}>{index + 1}</div>)}</div><textarea ref={editor} aria-label={`Éditeur de ${activeFile}`} spellCheck={false} wrap={wordWrap ? 'soft' : 'off'} value={code} onScroll={event => { if (lineNumbers.current) lineNumbers.current.scrollTop = event.currentTarget.scrollTop }} onSelect={event => { const before = event.currentTarget.value.slice(0, event.currentTarget.selectionStart); const lines = before.split('\n'); setCursor({ line: lines.length, column: lines[lines.length - 1].length + 1 }) }} onKeyDown={event => { if (event.key === 'Tab') { event.preventDefault(); const start = event.currentTarget.selectionStart; const end = event.currentTarget.selectionEnd; const next = code.slice(0, start) + '  ' + code.slice(end); setProject(previous => ({ ...previous, files: { ...previous.files, [activeFile]: next } })); setDirtyFiles(previous => previous.includes(activeFile) ? previous : [...previous, activeFile]); requestAnimationFrame(() => editor.current?.setSelectionRange(start + 2, start + 2)) } }} onChange={event => { const value = event.target.value; setProject(previous => ({ ...previous, files: { ...previous.files, [activeFile]: value } })); setDirtyFiles(previous => previous.includes(activeFile) ? previous : [...previous, activeFile]) }} /></div><div className="editor-hint">Fichiers de session · Exportez vos modifications pour les conserver.</div></div>}

        {terminalOpen && <section className="terminal-panel"><div className="terminal-header"><div>{['Terminal', 'Sortie', 'Problèmes'].map(tab => <button key={tab} className={terminalTab === tab ? 'active' : ''} onClick={() => setTerminalTab(tab)}>{tab}{tab === 'Problèmes' && <span>—</span>}</button>)}</div><button className="icon-button" title="Fermer le terminal" onClick={() => setTerminalOpen(false)}><Icon name="close" size={15} /></button></div><div className="terminal-output">{terminalTab === 'Terminal' ? <><p><span className="terminal-green">20Code</span> <span className="muted">— aperçu du terminal</span></p><p className="muted">Les runtimes desktop ne sont pas encore connectés. Aucun code n’a été exécuté.</p><p><span className="terminal-blue">~/projets/{project.name}</span> <span className="terminal-green">›</span> <span className="terminal-cursor" /></p></> : terminalTab === 'Sortie' ? <p className="muted">La sortie de vos programmes apparaîtra ici après connexion du moteur d’exécution.</p> : <p className="muted">L’analyse du code sera disponible avec l’intégration de Monaco. Aucun diagnostic n’a été lancé.</p>}</div></section>}
      </main>

      {assistantOpen && <aside className="assistant-panel"><div className="assistant-heading"><span><Icon name="spark" size={17} /> Assistant IA</span><button className="icon-button" title="Fermer l’assistant" onClick={() => setAssistantOpen(false)}><Icon name="close" size={15} /></button></div><div className="assistant-model"><span className="claude-symbol"><Icon name="spark" size={22} /></span><strong>Claude</strong><span className="demo-tag">DÉMO</span><span className="model-dot" /></div><div className="assistant-messages">{messages.length ? <>{messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}><span>{message.role === 'user' ? 'Vous' : 'Claude · exemple local'}</span><p>{message.text}</p></div>)}<button className="reset-chat" onClick={() => setMessages([])}>Nouvelle conversation</button><div ref={messageEnd} /></> : <div className="assistant-empty"><div className="assistant-orbit"><Icon name="spark" size={27} /></div><h2>Votre code.<br />Un regard en plus.</h2><p>Une question, une idée ou un blocage ?<br />Explorez votre assistant de code.</p><div className="prompt-suggestions"><button onClick={() => sendMessage('Explique-moi l’exemple Python', assistantReplies.explain)}><Icon name="code" size={16} /><span>Comprendre l’exemple Python</span><Icon name="arrow" size={14} /></button><button onClick={() => sendMessage('Comment améliorer cet exemple ?', assistantReplies.improve)}><Icon name="spark" size={16} /><span>Améliorer cet exemple</span><Icon name="arrow" size={14} /></button><button onClick={() => sendMessage('Par où commencer ?', assistantReplies.start)}><Icon name="book" size={16} /><span>Démarrer un nouveau projet</span><Icon name="arrow" size={14} /></button></div><div className="assistant-tip"><Icon name="help" size={15} /><p>Les réponses sont des exemples locaux.<br />La connexion à Claude arrive à une prochaine étape.</p></div></div>}</div><div className="composer-area"><div className="context-pill"><Icon name="file" size={12} /> {welcome ? 'Aucun fichier partagé' : activeFile}<span>· contexte démo</span></div><form className="composer" onSubmit={event => { event.preventDefault(); sendMessage(prompt) }}><textarea aria-label="Message pour l’assistant de démonstration" placeholder="Une question sur votre code…" value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(prompt) } }} /><div className="composer-bottom"><span><Icon name="spark" size={12} /> Claude · Démonstration</span><button type="submit" disabled={!prompt.trim()} aria-label="Envoyer le message"><Icon name="arrow" size={16} /></button></div></form><p className="privacy-note"><Icon name="check" size={11} /> Aucun code envoyé à un service externe.</p></div></aside>}
    </div>

    <footer className="statusbar"><div><button onClick={() => setModal('git')}><Icon name="branch" size={12} /> main · démo</button><button onClick={() => setTerminalOpen(!terminalOpen)}><Icon name="terminal" size={12} /> {window.api ? 'Desktop' : 'Aperçu web'}</button><span className="status-divider" /><span className="status-ready"><span className="green-dot" /> Espace prêt</span></div><div><span>{welcome ? 'Bienvenue dans 20Code' : `Ln ${cursor.line}, Col ${cursor.column}`}</span><span>UTF-8</span><span>{welcome ? '20Code' : activeFile.split('.').pop()?.toUpperCase()}</span><button title="Paramètres" onClick={() => setModal('settings')}><Icon name="settings" size={12} /></button></div></footer>
    <input ref={upload} type="file" multiple accept=".py,.js,.ts,.tsx,.jsx,.html,.css,.json,.md,.txt,.sql,.c,.cpp,.h,.java" hidden onChange={event => void importFiles(event.target.files)} />
    {notice && <div className="toast" role="status"><Icon name="check" size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Fermer la notification"><Icon name="close" size={14} /></button></div>}

    {modal && <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) setModal(null) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onKeyDown={event => { if (event.key !== 'Tab') return; const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, select, a, [tabindex="0"]')).filter(element => !element.hasAttribute('disabled')); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } }}><div className="modal-heading"><span className="eyebrow">VOTRE ESPACE 20CODE</span><button ref={closeButton} className="icon-button" title="Fermer" onClick={() => setModal(null)}><Icon name="close" /></button></div><h2 id="modal-title">{modal === 'new' ? 'Donnons vie à votre idée.' : modal === 'settings' ? 'À votre façon.' : modal === 'runtimes' ? 'Un espace. Plusieurs langages.' : modal === 'git' ? 'Votre code, version après version.' : 'Votre première ligne.'}</h2>
      {modal === 'new' && <form onSubmit={createProject}><p className="modal-description">Créez un projet de session à partir d’un fichier de départ.</p><label className="field-label">Nom du projet<input value={newName} onChange={event => { setNewName(event.target.value); setValidation('') }} placeholder="ma-prochaine-idée" maxLength={40} /></label><label className="field-label">Langage<select value={language} onChange={event => setLanguage(event.target.value as Language)}>{Object.keys(starters).map(name => <option key={name}>{name}</option>)}</select></label>{validation && <p className="field-error" role="alert">{validation}</p>}<p className="session-note">Le projet reste dans cette session. Vous pouvez exporter chaque fichier.</p><button className="primary-button full-width" type="submit"><Icon name="plus" /> Créer le projet</button></form>}
      {modal === 'settings' && <><p className="modal-description">Des réglages simples pour trouver votre rythme. Ils s’appliquent à cette session.</p><label className="setting-row"><span>Taille du texte de l’éditeur</span><select value={fontSize} onChange={event => setFontSize(Number(event.target.value))}>{[12, 14, 16, 18, 20].map(size => <option key={size} value={size}>{size} px</option>)}</select></label><label className="setting-row"><span>Retour à la ligne automatique</span><input type="checkbox" checked={wordWrap} onChange={event => setWordWrap(event.target.checked)} /></label><label className="setting-row"><span>Afficher l’assistant</span><input type="checkbox" checked={assistantOpen} onChange={event => setAssistantOpen(event.target.checked)} /></label><div className="about-app"><img src="./20code-icon.png" alt="Icône de 20Code" /><div><strong>20Code {appVersion}</strong><p>{window.api ? 'Application desktop Electron' : 'Aperçu de l’interface desktop'} · Première étape</p></div></div></>}
      {modal === 'guide' && <><p className="modal-description">Votre atelier est prêt. Voici comment l’explorer.</p><ol className="guide-steps"><li><strong>Choisissez votre point de départ</strong><p>Ouvrez un projet exemple ou créez le vôtre dans le langage de votre choix.</p></li><li><strong>Écrivez, expérimentez</strong><p>Ouvrez un fichier dans l’explorateur. L’éditeur est modifiable, avec indentation et numéros de ligne.</p></li><li><strong>Gardez votre travail</strong><p>Exportez le fichier actif pour conserver vos modifications. Les projets sont temporaires à cette étape.</p></li><li><strong>Explorez votre assistant</strong><p>Découvrez les réponses de démonstration. L’IA réelle et les runtimes font partie des prochaines étapes.</p></li></ol><button className="primary-button full-width" onClick={() => setModal('new')}>Créer mon premier projet <Icon name="arrow" /></button></>}
      {modal === 'runtimes' && <><p className="modal-description">Des fichiers de départ pour créer dès aujourd’hui. Les moteurs d’exécution seront intégrés au desktop dans une prochaine étape.</p><div className="runtime-list">{['Python', 'JavaScript', 'TypeScript', 'HTML', 'SQL', 'C / C++', 'Java'].map(name => <div key={name}><Icon name="code" size={17} /><strong>{name}</strong><span>{name in starters ? 'Fichier de départ disponible' : 'À venir'}</span></div>)}</div></>}
      {modal === 'git' && <><p className="modal-description">L’intégration Git est prévue pour suivre vos modifications et gérer les versions de vos projets desktop.</p><div className="feature-empty"><Icon name="branch" size={38} /><h3>Chaque étape compte.</h3><p>Pour le moment, exportez vos fichiers et gérez leur historique avec votre outil Git habituel. Aucun dépôt n’est connecté à cette interface.</p></div></>}
    </section></div>}
  </div>
}
