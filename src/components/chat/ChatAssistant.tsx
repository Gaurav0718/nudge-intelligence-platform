import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send, X, ArrowRight, FileText, Bot } from 'lucide-react'
import { matchIntent, ACCOUNTS } from './chatKnowledge'
import type { ChatAction, ChatDoc } from './chatKnowledge'

interface Msg {
  id: number
  role: 'user' | 'bot'
  text: string
  actions?: ChatAction[]
  docs?: ChatDoc[]
  chips?: string[]
}

let msgId = 0

const SUGGESTIONS = [
  'What is happening this week?',
  'Show me AstraZeneca',
  'Delivery Health',
  'Missed opportunities',
  'Next best actions',
  'Who are the key executives?',
]

export default function ChatAssistant() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: msgId++,
      role: 'bot',
      text: 'Hello — I am the Company Intelligence assistant. Ask me about any account, module, signal or document and I will take you straight to it.',
      chips: SUGGESTIONS.slice(0, 4),
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs, typing, open])

  const send = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return
    setInput('')
    setMsgs(m => [...m, { id: msgId++, role: 'user', text }])
    setTyping(true)

    const result = matchIntent(text)
    setTimeout(() => {
      setTyping(false)
      if (result) {
        setMsgs(m => [...m, {
          id: msgId++, role: 'bot', text: result.reply,
          actions: result.actions, docs: result.docs, chips: result.chips,
        }])
      } else {
        setMsgs(m => [...m, {
          id: msgId++, role: 'bot',
          text: 'I could not map that to a module or dossier yet. Try one of the topics below, or ask for an account such as GSK or Sanofi.',
          chips: SUGGESTIONS,
        }])
      }
    }, 420)
  }

  return (
    <>
      {/* Launcher */}
      <button className="fab-ai" onClick={() => setOpen(o => !o)}
        title={open ? 'Close assistant' : 'Company Intelligence assistant'} aria-label="AI assistant">
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--gold),#b89428)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif' }}>Intelligence Assistant</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>Accounts · Modules · Documents</div>
              </div>
            </div>
          </div>

          <div className="chat-body" ref={scrollRef}>
            {msgs.map(m => (
              <div key={m.id} className={`chat-row ${m.role === 'user' ? 'chat-user' : 'chat-bot'}`}>
                {m.role === 'bot' && (
                  <div className="chat-avatar"><Sparkles size={13} /></div>
                )}
                <div className="chat-bubble">
                  <div className="chat-text">{m.text}</div>

                  {m.actions && m.actions.length > 0 && (
                    <div className="chat-actions">
                      {m.actions.map((a, i) => (
                        <button key={i} className="chat-action" onClick={() => { nav(a.path); setOpen(false) }}>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="chat-action-label">{a.label}</span>
                            {a.desc && <span className="chat-action-desc">{a.desc}</span>}
                          </span>
                          <ArrowRight size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {m.docs && m.docs.length > 0 && (
                    <div className="chat-docs">
                      <div className="chat-docs-title"><FileText size={12} /> Related documents</div>
                      {m.docs.map((d, i) => (
                        <button key={i} className="chat-doc" onClick={() => { nav(d.path); setOpen(false) }}>
                          <span style={{ flex: 1, minWidth: 0 }}>{d.label}</span>
                          <ArrowRight size={12} style={{ flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {m.chips && m.chips.length > 0 && (
                    <div className="chat-chips">
                      {m.chips.map((c, i) => (
                        <button key={i} className="chat-chip" onClick={() => send(c)}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-row chat-bot">
                <div className="chat-avatar"><Sparkles size={13} /></div>
                <div className="chat-bubble">
                  <div className="chat-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-foot">
            <div className="chat-quick">
              {ACCOUNTS.map(a => (
                <button key={a.id} onClick={() => send(a.name)}>{a.name.split(' ')[0]}</button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Ask for an account, module or document…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send() }}
              />
              <button className="chat-send" onClick={() => send()} aria-label="Send">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
