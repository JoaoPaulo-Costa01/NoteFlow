import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Tag, LogOut, Sparkles,
  ChevronLeft, FileText, Clock,
  Hash, StickyNote, Type, X, Loader2, Check, Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';

interface NoteTag { id: string; name: string; }

interface Note {
  id:        string;
  title:     string | null;
  content:   string;
  status:    string;
  createdAt: string;
  updatedAt: string;
  tags:      NoteTag[];
}

type NavItem = 'notes' | 'tags';

export function NotesPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes]                 = useState<Note[]>([]);
  const [selectedNote, setSelectedNote]   = useState<Note | null>(null);
  const [activeNav, setActiveNav]         = useState<NavItem>('notes');
  const [searchQuery, setSearchQuery]     = useState('');
  const [isLoadingNotes, setLoadingNotes] = useState(false);
  const [isCreating, setIsCreating]       = useState(false);
  const [noteToDelete, setNoteToDelete]   = useState<Note | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const { data } = await api.get<Note[]>('/notes');
      setNotes(data);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchNotes();
  }, [authLoading, isAuthenticated, fetchNotes]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050816' }}>
        <Loader2 size={24} className="text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleCreateNote = async () => {
    setIsCreating(true);
    try {
      const { data } = await api.post<{ id: string }>('/notes', {
        title: 'Nova nota', content: 'Comece a escrever...',
      });
      await fetchNotes();
      const fresh = await api.get<Note>(`/notes/${data.id}`);
      setSelectedNote(fresh.data);
    } finally {
      setIsCreating(false);
    }
  };

  const handleNoteUpdated = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNote(updated);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await api.delete(`/notes/${noteToDelete.id}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      if (selectedNote?.id === noteToDelete.id) setSelectedNote(null);
    } finally {
      setNoteToDelete(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      (note.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeNav === 'tags') return matchesSearch && note.tags.length > 0;
    return matchesSearch;
  });

  return (
    <div className="flex h-screen text-white overflow-hidden relative" style={{ background: '#050816' }}>
      <div className="noise-overlay" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(30,64,175,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 70% 60% at 10% 60%, rgba(29,78,216,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 100%, rgba(30,64,175,0.04) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute left-0 top-0 w-px h-full z-30 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #1D4ED8 30%, #2563EB 60%, transparent 100%)',
          boxShadow:  '0 0 18px 1px #1D4ED8',
        }}
      />

      <aside
        className="w-64 h-full flex flex-col relative z-10 shrink-0"
        style={{
          background:  'rgba(11,17,32,0.95)',
          borderRight: '1px solid rgba(37,99,235,0.25)',
          boxShadow:   '1px 0 12px rgba(37,99,235,0.06)',
        }}
      >
        <header className="px-5 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0"
              style={{ background: '#1D4ED8', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }}
            >
              N
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-px h-4 bg-white/[0.08]" />
              <span className="text-white font-semibold text-sm tracking-wide">
                Note<span style={{ color: '#2563EB' }}>Flow</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateNote}
            disabled={isCreating}
            className="w-full text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
              boxShadow:  '0 0 20px rgba(37,99,235,0.3)',
            }}
          >
            {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Nova nota
          </button>
        </header>

        <div className="px-4 mb-4 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none transition caret-[#2563EB]"
              style={{
                background:  'rgba(17,24,39,0.8)',
                border:      '1px solid rgba(37,99,235,0.15)',
                color:       '#F8FAFC',
              }}
            />
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto min-h-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Menu
          </p>
          <NavButton icon={<FileText size={14} />} label="Notas" active={activeNav === 'notes'} onClick={() => { setActiveNav('notes'); setSelectedNote(null); }} />
          <NavButton icon={<Tag size={14} />}      label="Tags"  active={activeNav === 'tags'}  onClick={() => { setActiveNav('tags');  setSelectedNote(null); }} />
        </nav>

        <div className="p-4 shrink-0 flex flex-col gap-3">
          <div
            className="rounded-2xl p-3.5 flex gap-2.5 items-start"
            style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.14)' }}
          >
            <Sparkles size={13} style={{ color: '#2563EB' }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-semibold mb-0.5">IA Assistente</p>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                Abra uma nota e deixe a IA resumir ou organizar para você.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.28)', color: '#2563EB' }}
            >
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#F8FAFC' }}>Minha conta</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Plano gratuito</p>
            </div>
            <button onClick={handleLogout} className="transition-colors hover:text-red-400" style={{ color: 'rgba(255,255,255,0.25)' }} aria-label="Sair">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedNote === null ? (
            <motion.div
              key="dashboard"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardView
                notes={filteredNotes}
                activeNav={activeNav}
                isLoading={isLoadingNotes}
                onSelectNote={setSelectedNote}
                onDeleteRequest={setNoteToDelete}
              />
            </motion.div>
          ) : (
            <motion.div
              key={selectedNote.id}
              className="h-full"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <EditorView
                note={selectedNote}
                onBack={() => { setSelectedNote(null); fetchNotes(); }}
                onNoteUpdated={handleNoteUpdated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {noteToDelete && (
          <DeleteModal
            noteTitle={noteToDelete.title}
            onCancel={() => setNoteToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function DeleteModal({ noteTitle, onCancel, onConfirm }: {
  noteTitle: string | null;
  onCancel:  () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(6px)' }}
        onClick={onCancel}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl p-6"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background:     'rgba(11,17,32,0.98)',
          backdropFilter: 'blur(24px)',
          border:         '1px solid rgba(37,99,235,0.12)',
          boxShadow:      '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Trash2 size={18} className="text-red-400" />
        </div>

        <h2 className="text-white text-base font-semibold mb-1">Excluir nota</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#94A3B8' }}>
          Tem certeza que deseja excluir{' '}
          <span className="font-medium" style={{ color: '#F8FAFC' }}>
            "{noteTitle ?? 'esta nota'}"
          </span>
          ? Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.35)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            Sim, excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardView({ notes, activeNav, isLoading, onSelectNote, onDeleteRequest }: {
  notes:           Note[];
  activeNav:       NavItem;
  isLoading:       boolean;
  onSelectNote:    (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={22} className="text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const isTagsView = activeNav === 'tags';

  return (
    <section className="h-full overflow-y-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#F8FAFC' }}>
          {isTagsView ? 'Notas por Tags' : 'Suas notas'}
        </h1>
        {isTagsView ? (
          <div className="flex items-center gap-2 mt-2">
            <span
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
              style={{ color: '#2563EB', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              <Tag size={11} /> Filtrando por tags
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>{notes.length} notas</span>
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#94A3B8' }}>{notes.length} notas encontradas</p>
        )}
      </header>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <NoteCard
                note={note}
                onClick={() => onSelectNote(note)}
                onDeleteRequest={() => onDeleteRequest(note)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32" style={{ opacity: 0.35 }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <StickyNote size={28} style={{ color: '#2563EB' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>Nenhuma nota encontrada</p>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Crie sua primeira nota clicando em '+ Nova nota'</p>
        </div>
      )}
    </section>
  );
}

function NoteCard({ note, onClick, onDeleteRequest }: {
  note:            Note;
  onClick:         () => void;
  onDeleteRequest: () => void;
}) {
  const formatted = new Date(note.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <motion.article
      onClick={onClick}
      className="rounded-2xl p-5 cursor-pointer relative group"
      style={{
        background:    'rgba(11,17,32,0.9)',
        border:        '1px solid rgba(37,99,235,0.12)',
        height:        '168px',
        display:       'flex',
        flexDirection: 'column',
      }}
      whileHover={{
        y:           -4,
        background:  'rgba(17,24,39,0.95)',
        borderColor: 'rgba(37,99,235,0.35)',
        boxShadow:   '0 8px 32px rgba(29,78,216,0.12)',
        transition:  { duration: 0.18 },
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }}
        className="absolute top-3.5 right-3.5 w-6 h-6 rounded-lg items-center justify-center transition-all duration-150 hidden group-hover:flex"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)'; }}
        aria-label="Excluir nota"
      >
        <X size={11} />
      </button>

      <div className="flex-1 min-h-0 overflow-hidden pr-6">
        <h2 className="text-sm font-semibold mb-2 truncate" style={{ color: '#F8FAFC' }}>
          {note.title ?? 'Sem título'}
        </h2>
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#94A3B8' }}>
          {note.content}
        </p>
      </div>

      <footer className="shrink-0 flex items-center justify-between gap-2 mt-3 overflow-hidden">
        <div className="flex gap-1.5 overflow-hidden" style={{ maxWidth: 'calc(100% - 80px)' }}>
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
              style={{ color: '#2563EB', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              <Hash size={9} />
              <span className="truncate max-w-[60px]">{tag.name}</span>
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-xs shrink-0" style={{ color: '#94A3B8' }}>
              +{note.tags.length - 2}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: '#94A3B8' }}>
          <Clock size={10} />
          {formatted}
        </div>
      </footer>
    </motion.article>
  );
}

function TagInput({ noteId, existingTags, onTagAdded }: {
  noteId:       string;
  existingTags: NoteTag[];
  onTagAdded:   (tag: NoteTag) => void;
}) {
  const [isOpen, setIsOpen]     = useState(false);
  const [tagName, setTagName]   = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  const handleAdd = async () => {
    const name = tagName.trim();
    if (!name) return;
    if (existingTags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setError('Tag já está na nota.'); return;
    }
    setIsAdding(true);
    setError(null);
    try {
      const { data: created } = await api.post<NoteTag>('/tags', { name });
      await api.post(`/notes/${noteId}/tags`, { tagId: created.id });
      onTagAdded(created);
      setTagName('');
      setIsOpen(false);
    } catch {
      setError('Não foi possível adicionar.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  { e.preventDefault(); handleAdd(); }
    if (e.key === 'Escape') { setIsOpen(false); setTagName(''); setError(null); }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full"
        style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
        whileHover={{ color: '#ffffff', borderColor: 'rgba(37,99,235,0.45)', background: 'rgba(37,99,235,0.12)' }}
        transition={{ duration: 0.15 }}
      >
        <Plus size={13} />
        Adicionar tag
      </motion.button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(37,99,235,0.35)' }}
        >
          <Hash size={12} style={{ color: '#2563EB' }} />
          <input
            ref={inputRef}
            type="text"
            value={tagName}
            onChange={(e) => { setTagName(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="nova tag"
            className="bg-transparent text-sm placeholder-white/30 outline-none w-28 caret-[#2563EB]"
            style={{ color: '#F8FAFC' }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding || !tagName.trim()}
          className="w-7 h-7 flex items-center justify-center rounded-full disabled:opacity-40 transition-colors"
          style={{ background: 'rgba(37,99,235,0.22)', color: '#2563EB' }}
        >
          {isAdding ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
        <button
          onClick={() => { setIsOpen(false); setTagName(''); setError(null); }}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={12} />
        </button>
      </div>
      {error && <span className="text-red-400 text-xs pl-1">{error}</span>}
    </div>
  );
}

function EditorView({ note, onBack, onNoteUpdated }: {
  note: Note; onBack: () => void; onNoteUpdated: (note: Note) => void;
}) {
  const [title, setTitle]                     = useState(note.title ?? '');
  const [content, setContent]                 = useState(note.content);
  const [localTags, setLocalTags]             = useState<NoteTag[]>(note.tags);
  const [isSaving, setIsSaving]               = useState(false);
  const [loadingAiAction, setLoadingAiAction] = useState<number | null>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { autoResize(); }, [content]);

  const saveNote = useCallback(async (t: string, c: string) => {
    setIsSaving(true);
    try {
      await api.put(`/notes/${note.id}`, { title: t, content: c });
      const { data } = await api.get<Note>(`/notes/${note.id}`);
      onNoteUpdated(data);
    } finally {
      setIsSaving(false);
    }
  }, [note.id, onNoteUpdated]);

  const scheduleSave = (t: string, c: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(t, c), 1200);
  };

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const handleTitleChange   = (val: string) => { setTitle(val);   scheduleSave(val, content); };
  const handleContentChange = (val: string) => { setContent(val); autoResize(); scheduleSave(title, val); };
  const handleTagAdded      = (tag: NoteTag) => setLocalTags((prev) => [...prev, tag]);

  const handleAiAction = async (actionIndex: number) => {
    if (!content.trim() || loadingAiAction !== null) return;

    setLoadingAiAction(actionIndex);
    try {
      const { data } = await api.post<{ result: string }>('/ai', {
        content: content,
        action:  actionIndex,
      });

      const result = data.result?.trim();
      if (!result) return;

      if (actionIndex === 0) {
        const newContent = content + '\n\n---\n\n' + result;
        setContent(newContent);
        scheduleSave(title, newContent);
        autoResize();
      }

      if (actionIndex === 3) {
        setTitle(result);
        scheduleSave(result, content);
      }
    } catch {
      alert('A IA não conseguiu processar a solicitação. Tente novamente.');
    } finally {
      setLoadingAiAction(null);
    }
  };

  const isAiBusy = loadingAiAction !== null;

  const aiActions = [
    { id: 0, icon: <FileText size={15} />, label: 'Resumir',      description: 'Adiciona um resumo ao final da nota' },
    { id: 3, icon: <Type size={15} />,     label: 'Gerar título', description: 'Substitui pelo título sugerido' },
  ];

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div
        className="w-px h-full shrink-0"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(37,99,235,0.18) 30%, rgba(37,99,235,0.18) 70%, transparent)' }}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 shrink-0">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            whileHover={{ color: '#F8FAFC' }}
            transition={{ duration: 0.15 }}
          >
            <ChevronLeft size={15} />
            Voltar para lista
          </motion.button>

          <AnimatePresence>
            {isSaving && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: '#94A3B8' }}
              >
                <Loader2 size={11} className="animate-spin" />
                Salvando...
              </motion.span>
            )}
          </AnimatePresence>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-32">
          <div className="max-w-[820px] pt-4 mx-auto">
            <div className="flex gap-2 mb-8 flex-wrap items-center">
              {localTags.map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full"
                  style={{ color: '#2563EB', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <Hash size={12} />
                  {tag.name}
                </span>
              ))}
              <TagInput noteId={note.id} existingTags={localTags} onTagAdded={handleTagAdded} />
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Título da nota"
              className="w-full bg-transparent text-4xl lg:text-5xl font-bold outline-none border-none mb-10 tracking-tight leading-tight caret-[#2563EB] transition-colors duration-200"
              style={{ color: '#F8FAFC' }}
              onFocus={(e)  => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC'; }}
              onBlur={(e)   => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC'; }}
            />

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Comece a escrever sua nota..."
              className="w-full bg-transparent text-lg leading-loose outline-none border-none resize-none caret-[#2563EB] transition-colors duration-200 overflow-hidden"
              style={{ color: '#94A3B8', minHeight: '60vh' }}
              onFocus={(e)  => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC'; }}
              onBlur={(e)   => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
            />
          </div>
        </div>
      </div>

      <div
        className="w-px h-full shrink-0 hidden lg:block"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(37,99,235,0.12) 30%, rgba(37,99,235,0.12) 70%, transparent)' }}
      />

      <aside
        className="w-72 h-full shrink-0 hidden lg:flex flex-col p-6 overflow-y-auto"
        style={{ background: 'rgba(11,17,32,0.5)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
              boxShadow:  '0 0 16px rgba(37,99,235,0.35)',
            }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>IA Assistente</h3>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {isAiBusy ? 'Processando...' : 'Online e pronta'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {aiActions.map((action) => (
            <motion.button
              key={action.label}
              onClick={() => handleAiAction(action.id)}
              disabled={isAiBusy}
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl transition-colors text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(37,99,235,0.1)' }}
              whileHover={isAiBusy ? {} : { background: 'rgba(37,99,235,0.1)', borderColor: 'rgba(37,99,235,0.28)' }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: '#2563EB' }}>
                {loadingAiAction === action.id
                  ? <Loader2 size={15} className="animate-spin" />
                  : action.icon
                }
              </span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#F8FAFC' }}>{action.label}</p>
                <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>
                  {action.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {isAiBusy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 px-4 py-3 rounded-xl text-xs text-center"
            style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.14)', color: '#94A3B8' }}
          >
            A IA está analisando o conteúdo...
          </motion.div>
        )}
      </aside>

    </div>
  );
}

function NavButton({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5 relative"
      style={
        active
          ? { background: 'rgba(37,99,235,0.14)', color: '#2563EB', fontWeight: 500 }
          : { color: 'rgba(255,255,255,0.45)' }
      }
      onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; } }}
      onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
          style={{ background: '#2563EB', boxShadow: '0 0 8px #2563EB, 0 0 16px rgba(37,99,235,0.5)' }}
        />
      )}
      <span className="ml-1">{icon}</span>
      {label}
    </button>
  );
}