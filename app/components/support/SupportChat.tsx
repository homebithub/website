import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceSmileIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MessageCircle, Minus, Reply } from 'lucide-react';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { API_BASE_URL } from '~/config/api';
import { useAuth } from '~/contexts/useAuth';
import { CHAT_ALLOWED_FILE_TYPES, CHAT_ATTACHMENT_LIMIT_BYTES, CHAT_MESSAGE_LIMIT } from '~/config/chat';
import { supportService, type SupportChat as Chat, type SupportMessage } from '~/services/support.service';

const STORAGE_KEY = 'homebit_support_chat';
const QUICK_REACTIONS = ['👍', '❤️', '😊', '🙏'];
const ticketRef = (n:number) => `HB-${new Date().getFullYear()}-${String(n).padStart(6,'0')}`;
const messageTime = (value:string) => new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(value));
const dayLabel = (value:string) => { const d=new Date(value), today=new Date(), yesterday=new Date(Date.now()-86400000); const key=(x:Date)=>x.toDateString(); return key(d)===key(today)?'Today':key(d)===key(yesterday)?'Yesterday':new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(d) };

export default function SupportChat() {
  const { user } = useAuth();
  const account = (user as any)?.user ?? user;
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<SupportMessage | null>(null); const [emojiOpen, setEmojiOpen] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [unread, setUnread] = useState(0);
  const [rating,setRating]=useState(0); const [ratingComment,setRatingComment]=useState('');
  const [launcherBottom,setLauncherBottom]=useState(24);
  const fileRef = useRef<HTMLInputElement>(null); const bottomRef = useRef<HTMLDivElement>(null); const previousCount = useRef(0);
  const typingTimer = useRef<number | undefined>(undefined);

  useEffect(() => { setName(account?.first_name || account?.firstName || ''); setEmail(account?.email || ''); const saved = localStorage.getItem(STORAGE_KEY); if (saved) { try { setChat(JSON.parse(saved)); } catch {} } }, [account]);
  useEffect(() => { const show = () => setOpen(true); window.addEventListener('open-support-chat', show); return () => window.removeEventListener('open-support-chat', show); }, []);

  const refresh = useCallback(async () => {
    if (!chat) return;
    try {
      const data = await supportService.messages(chat.id, chat.access_token);
      if (!open && data.messages.length > previousCount.current) { const incoming=data.messages.slice(previousCount.current).filter((m) => m.sender_type === 'agent').length; setUnread((n) => n + incoming); if(incoming>0)setOpen(true) }
      previousCount.current = data.messages.length; setMessages(data.messages); setChat((old) => old ? { ...old, ...data.chat, access_token: old.access_token } : old);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not refresh chat'); }
  }, [chat?.id, chat?.access_token, open]);
  useEffect(() => { refresh(); if (!chat) return; const id = window.setInterval(refresh, open?1000:5000); return () => window.clearInterval(id); }, [chat?.id, open, refresh]);
  useEffect(() => { if (open) { setUnread(0); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); } }, [open, messages.length]);
  useEffect(()=>{if(!chat||!open)return; const seen=()=>supportService.presence(chat.id,chat.access_token,false).then(p=>setChat(old=>old?{...old,...p,access_token:old.access_token}:old)).catch(()=>{});seen();const id=window.setInterval(seen,15000);return()=>window.clearInterval(id)},[chat?.id,chat?.access_token,open]);
  useEffect(() => {
    let frame = 0;
    const positionLauncher = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const footer = document.querySelector<HTMLElement>('[data-site-footer]');
        if (!footer) { setLauncherBottom(24); return; }
        const top = footer.getBoundingClientRect().top;
        const covered = Math.max(0, window.innerHeight - top);
        setLauncherBottom(Math.max(24, covered + 16));
      });
    };
    positionLauncher();
    window.addEventListener('scroll', positionLauncher, { passive: true });
    window.addEventListener('resize', positionLauncher);
    const observer = new ResizeObserver(positionLauncher);
    const footer = document.querySelector<HTMLElement>('[data-site-footer]');
    if (footer) observer.observe(footer);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('scroll', positionLauncher); window.removeEventListener('resize', positionLauncher); observer.disconnect(); };
  }, []);

  function noteTyping(value:string){setDraft(value);if(!chat)return;supportService.presence(chat.id,chat.access_token,true).catch(()=>{});window.clearTimeout(typingTimer.current);typingTimer.current=window.setTimeout(()=>supportService.presence(chat.id,chat.access_token,false).catch(()=>{}),1800)}

  async function send(payload?: Record<string, unknown>) {
    const body = draft.trim(); if (!chat && !body) return; if (body.length > CHAT_MESSAGE_LIMIT) return;
    setBusy(true); setError('');
    try {
      if (!chat) {
        const created = await supportService.create({ name: name.trim() || 'Website visitor', email: email.trim(), message: body, sourceURL: window.location.href });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(created)); setChat(created); setDraft('');
      } else {
        await supportService.send(chat.id, chat.access_token, { body, reply_to_id: replyTo?.id, ...payload }); setDraft(''); setReplyTo(null); await refresh();
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send message'); } finally { setBusy(false); }
  }

  async function upload(file?: File) {
    if (!file) return; if (file.size > CHAT_ATTACHMENT_LIMIT_BYTES) { setError('Files must be 10 MB or smaller.'); return; }
    if (!CHAT_ALLOWED_FILE_TYPES.includes(file.type)) { setError('Please upload an image, PDF, text, or Word document.'); return; }
    setBusy(true); setError('');
    try {
      const data = new FormData(); data.append('files', file);
      const res = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, { method: 'POST', body: data, credentials: 'include' });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || 'Upload failed');
      const item = json.data?.[0] || json.documents?.[0] || json.data?.documents?.[0]; const url = item?.url || item?.file_url;
      if (!url) throw new Error('The upload completed without a file URL');
      await send({ attachment_url: url, attachment_name: file.name, attachment_type: file.type, attachment_size: file.size });
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  const remaining = CHAT_MESSAGE_LIMIT - draft.length;
  return <>
    <button style={{ bottom: launcherBottom }} onClick={() => setOpen(true)} aria-label="Chat with Homebit Support" className="fixed right-6 z-50 hidden h-14 items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 text-sm font-semibold text-white shadow-2xl shadow-purple-500/40 transition-[bottom,transform] duration-200 hover:scale-105 lg:flex">
      <MessageCircle className="h-5 w-5" /> Help {unread > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-xs text-purple-700">{unread}</span>}
    </button>
    {open && <section aria-label="Homebit Support chat" className="fixed inset-3 z-[70] flex flex-col overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-2xl dark:border-purple-500/30 dark:bg-[#13131a] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[390px]">
      <header className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 font-bold">HB</div><div className="min-w-0 flex-1"><h2 className="font-bold">Homebit Support</h2><p className="text-xs text-white/80">Mon–Fri · 8 AM–5 PM EAT</p></div>
        <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/15" aria-label="Minimize"><Minus className="h-5 w-5" /></button><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/15" aria-label="Close"><XMarkIcon className="h-5 w-5" /></button>
      </header>
      {!chat ? <div className="flex flex-1 flex-col justify-center space-y-4 p-5">
        <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">How can we help? 👋</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your first message opens a support ticket. We’ll reply here and notify you if you step away.</p></div>
        <input value={name} onChange={(e)=>setName(e.target.value)} maxLength={120} placeholder="Your name" className="rounded-xl border border-purple-200 bg-transparent px-3 py-2.5 text-sm dark:border-purple-500/30" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} maxLength={320} type="email" placeholder="Email (optional, for updates)" className="rounded-xl border border-purple-200 bg-transparent px-3 py-2.5 text-sm dark:border-purple-500/30" />
        <textarea value={draft} onChange={(e)=>setDraft(e.target.value.slice(0, CHAT_MESSAGE_LIMIT))} rows={5} placeholder="Tell us what you need help with…" className="resize-none rounded-xl border border-purple-200 bg-transparent p-3 text-sm dark:border-purple-500/30" />
        <div className="flex justify-between text-xs text-gray-400"><span>Replies are usually during working hours</span><span>{remaining}</span></div>{error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy || !draft.trim()} onClick={()=>send()} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Opening ticket…' : 'Start chat'}</button>
      </div> : <>
        <div className="border-b border-purple-100 px-4 py-2 text-xs text-gray-500 dark:border-purple-500/20 dark:text-gray-400"><b>{ticketRef(chat.ticket_number)}</b> · <span className="capitalize">{chat.status}</span> · {chat.admin_typing_until&&new Date(chat.admin_typing_until)>new Date()?<span className="text-purple-500">Support is typing…</span>:chat.admin_last_seen_at?`Support seen ${messageTime(chat.admin_last_seen_at)}`:'Support will reply soon'}</div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((m,i) => { const mine=m.sender_type==='customer'; const replied=m.reply_to_id?messages.find(x=>x.id===m.reply_to_id):undefined; const showDay=i===0||dayLabel(messages[i-1].created_at)!==dayLabel(m.created_at); return <div key={m.id}>{showDay&&<div className="my-4 flex items-center gap-2 text-[10px] text-gray-400"><span className="h-px flex-1 bg-purple-500/20"/><span>{dayLabel(m.created_at)}</span><span className="h-px flex-1 bg-purple-500/20"/></div>}<div className={`group flex ${mine?'justify-end':'justify-start'}`}><div className="max-w-[82%]">{replied&&<div className="mb-1 rounded-lg border-l-2 border-purple-400 bg-purple-500/10 px-2 py-1 text-[11px] text-gray-500 dark:text-gray-300">↩ {replied.body||replied.attachment_name}</div>}<div className={`rounded-2xl px-3 py-2 text-sm ${mine?'rounded-br-md bg-gradient-to-r from-purple-600 to-pink-600 text-white':'rounded-bl-md bg-purple-50 text-gray-800 dark:bg-white/10 dark:text-gray-100'}`}><p className="whitespace-pre-wrap break-words">{m.body}</p>{m.attachment_url&&<a className="mt-1 block underline" target="_blank" rel="noreferrer" href={m.attachment_url}>📎 {m.attachment_name||'Attachment'}</a>}{!mine&&m.sender_id&&<p className="mb-1 text-[10px] font-semibold text-purple-500">{m.sender_id}</p>}<p className={`mt-1 text-right text-[9px] ${mine?'text-white/70':'text-gray-400'}`}>{messageTime(m.created_at)}</p></div><div className={`mt-1 flex items-center gap-1 ${mine?'justify-end':''}`}><button onClick={()=>setReplyTo(m)} title="Reply" className="rounded p-1 opacity-60 hover:bg-purple-500/10 hover:opacity-100"><Reply className="h-3.5 w-3.5"/></button>{QUICK_REACTIONS.map(e=><button key={e} onClick={async()=>{try{await supportService.react(m.id,chat.access_token,e);await refresh()}catch(err){setError(err instanceof Error?err.message:'Could not add reaction')}}} className={`text-xs ${m.reactions?.customer===e?'rounded-full bg-purple-100 px-1':''}`}>{e}</button>)}{Object.entries(m.reactions||{}).filter(([,e])=>e).map(([actor,e])=><span key={actor} className="rounded-full bg-purple-500/10 px-1.5 text-xs">{e}</span>)}</div></div></div></div>})}<div ref={bottomRef}/></div>
        {replyTo&&<div className="mx-3 flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs dark:bg-white/10"><Reply className="h-3.5 w-3.5"/><span className="flex-1 truncate">{replyTo.body||replyTo.attachment_name}</span><button onClick={()=>setReplyTo(null)}>×</button></div>}
        {chat.status==='closed'&&!chat.rated_at&&<div className="mx-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3"><p className="text-sm font-semibold">How was your support experience?</p><div className="my-2 flex gap-1">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} className={`text-xl ${n<=rating?'text-purple-500':'text-gray-400'}`}>★</button>)}</div><textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value.slice(0,1000))} placeholder="Anything we could do better? (optional)" className="w-full rounded-lg bg-purple-50 p-2 text-xs dark:bg-white/10"/><button disabled={!rating||busy} onClick={async()=>{setBusy(true);try{const rated=await supportService.rate(chat.id,chat.access_token,rating,ratingComment);setChat(old=>old?{...old,...rated,access_token:old.access_token}:old)}catch(e){setError(e instanceof Error?e.message:'Could not save rating')}finally{setBusy(false)}}} className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-xs font-semibold text-white disabled:opacity-50">Submit rating</button></div>}
        {chat.rated_at&&<p className="mx-3 rounded-lg bg-purple-500/10 p-2 text-center text-xs text-purple-500">Thanks for rating Homebit Support {chat.rating}/5.</p>}
        {error&&<p className="px-4 py-1 text-xs text-red-500">{error}</p>}
        <footer className="relative border-t border-purple-100 p-3 dark:border-purple-500/20">{emojiOpen&&<div className="absolute bottom-16 left-3"><EmojiPicker width={330} height={360} theme={Theme.AUTO} onEmojiClick={(e:EmojiClickData)=>{setDraft(d=>(d+e.emoji).slice(0,CHAT_MESSAGE_LIMIT));setEmojiOpen(false)}}/></div>}<div className="flex items-end gap-1"><button onClick={()=>setEmojiOpen(v=>!v)} className="p-2"><FaceSmileIcon className="h-5 w-5"/></button><button onClick={()=>fileRef.current?.click()} disabled={busy} className="p-2"><PaperClipIcon className="h-5 w-5"/></button><input ref={fileRef} type="file" hidden onChange={e=>upload(e.target.files?.[0])}/><textarea rows={1} disabled={chat.status==='closed'} value={draft} maxLength={CHAT_MESSAGE_LIMIT} onChange={e=>noteTyping(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={chat.status==='closed'?'This chat is closed':'Write a message…'} className="max-h-28 flex-1 resize-none rounded-xl bg-purple-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:bg-white/10"/><button onClick={()=>send()} disabled={busy||(!draft.trim())||chat.status==='closed'} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white disabled:opacity-40"><PaperAirplaneIcon className="h-5 w-5"/></button></div><div className={`mt-1 text-right text-[10px] ${remaining<100?'text-amber-500':'text-gray-400'}`}>{remaining.toLocaleString()} characters left</div></footer>
      </>}
    </section>}
  </>;
}
