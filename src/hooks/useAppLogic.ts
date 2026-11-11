import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { webEngines, allEngines } from '../constants/engines';
import { WorkspaceCard, SearchEngine, MusicTrack, NoteCard, NoteSize, NotesSearchMode } from '../types';
import { ThemePreference } from '../constants/themeClasses';

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Array<{ role: 'user' | 'model'; content: string; attachments?: string[] }>;
};

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    if (hostname === 'youtu.be') {
      const id = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (hostname !== 'youtube.com' && !hostname.endsWith('.youtube.com')) return null;
    const id = parsedUrl.searchParams.get('v') ?? parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const normalizeMusicTracks = (tracks: unknown): MusicTrack[] => {
  if (!Array.isArray(tracks)) return [];
  const seenVideoIds = new Set<string>();
  return tracks.filter((track): track is MusicTrack => {
    if (
      typeof track?.id !== 'string' ||
      typeof track?.videoId !== 'string' ||
      !/^[\w-]{11}$/.test(track.videoId) ||
      typeof track?.title !== 'string' ||
      typeof track?.url !== 'string' ||
      seenVideoIds.has(track.videoId)
    ) {
      return false;
    }
    seenVideoIds.add(track.videoId);
    return true;
  });
};

const readMusicTracks = (): MusicTrack[] => {
  try {
    const savedTracks = localStorage.getItem('musicPlaylist');
    return normalizeMusicTracks(savedTracks ? JSON.parse(savedTracks) : []);
  } catch (error) {
    console.error('Não foi possível carregar a playlist salva.', error);
    return [];
  }
};

const normalizeNotes = (notes: unknown): NoteCard[] => {
  if (!Array.isArray(notes)) return [];
  return notes.flatMap((note): NoteCard[] => {
    if (typeof note !== 'object' || note === null) return [];
    const candidate = note as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.title !== 'string' ||
      typeof candidate.content !== 'string'
    ) return [];
    return [{ id: candidate.id, title: candidate.title, content: candidate.content }];
  });
};

const readNotes = (): NoteCard[] => {
  try {
    const savedNotes = localStorage.getItem('notes');
    return normalizeNotes(savedNotes ? JSON.parse(savedNotes) : []);
  } catch (error) {
    console.error('Não foi possível carregar as notas salvas.', error);
    return [];
  }
};

/**
 * Custom hook para gerenciar toda a lógica de estado do App
 */
export const useAppLogic = () => {
  const [activeEngineId, setActiveEngineId] = useState(() => {
    const savedEngine = localStorage.getItem('preferredEngine');
    return savedEngine === 'youtube' ? 'google' : savedEngine || 'google';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isMonochromeMode, setIsMonochromeMode] = useState(() => localStorage.getItem('isMonochromeMode') === 'true');
  const [workspaceSearchFallback, setWorkspaceSearchFallback] = useState(() => localStorage.getItem('workspaceSearchFallback') === 'true');
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>(readMusicTracks);
  const [musicInputError, setMusicInputError] = useState('');
  const [notes, setNotes] = useState<NoteCard[]>(readNotes);
  const [noteSize, setNoteSize] = useState<NoteSize>(() => {
    const saved = localStorage.getItem('noteSize');
    return saved === 'small' || saved === 'large' ? saved : 'medium';
  });
  const [notesSearchMode, setNotesSearchMode] = useState<NotesSearchMode>(() => localStorage.getItem('notesSearchMode') === 'web' ? 'web' : 'title');
  const musicInputErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => (localStorage.getItem('themePreference') as ThemePreference) || 'system');
  const [lastSearchEngineId, setLastSearchEngineId] = useState(() => localStorage.getItem('lastSearchEngineId') || 'google');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  const [isAiMode, setIsAiMode] = useState(false);
  const envGeminiKey = ((import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY) || '';
  const [geminiApiKey, setGeminiApiKey] = useState(() => envGeminiKey || localStorage.getItem('geminiApiKey') || '');
  const [geminiModel, setGeminiModel] = useState(() => localStorage.getItem('geminiModel') || 'gemini-1.5-flash');

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) return JSON.parse(savedSessions);
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      if (parsed.length > 0) {
        return [{ id: Date.now().toString(), title: 'Previous Chat', updatedAt: Date.now(), messages: parsed }];
      }
    }
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const chatMessages = useMemo(() => {
    if (!currentSessionId) return [];
    return chatSessions.find(s => s.id === currentSessionId)?.messages || [];
  }, [currentSessionId, chatSessions]);

  const [attachments, setAttachments] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [workspaceCards, setWorkspaceCards] = useState<WorkspaceCard[]>(() => {
    const saved = localStorage.getItem('workspaceCards');
    return saved ? JSON.parse(saved) : [];
  });
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({ title: '', url: '', icon: '', image: '' });

  const [exportDataModalOpen, setExportDataModalOpen] = useState(false);
  const [exportDataJson, setExportDataJson] = useState('');

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputAiRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAppliedTheme = useMemo<Exclude<ThemePreference, 'system'>>(() => {
    return themePreference === 'system' ? systemTheme : (themePreference as Exclude<ThemePreference, 'system'>);
  }, [themePreference, systemTheme]);

  const currentActiveEngine = useMemo(() => allEngines.find(engine => engine.id === activeEngineId) || webEngines[0], [activeEngineId]);

  useEffect(() => {
    localStorage.setItem('preferredEngine', activeEngineId);
    if (webEngines.some(e => e.id === activeEngineId)) {
      setLastSearchEngineId(activeEngineId);
      localStorage.setItem('lastSearchEngineId', activeEngineId);
    }
  }, [activeEngineId]);

  useEffect(() => {
    localStorage.removeItem('youtubeApiKey');
    localStorage.removeItem('userSubscriptions');
    localStorage.removeItem('fontPreference');
  }, []);
  useEffect(() => { localStorage.setItem('isMonochromeMode', String(isMonochromeMode)); }, [isMonochromeMode]);
  useEffect(() => { localStorage.setItem('workspaceSearchFallback', String(workspaceSearchFallback)); }, [workspaceSearchFallback]);
  useEffect(() => {
    try {
      localStorage.setItem('musicPlaylist', JSON.stringify(musicTracks));
    } catch (error) {
      console.error('Não foi possível salvar a playlist.', error);
      setMusicInputError('Não foi possível salvar a playlist neste dispositivo.');
    }
  }, [musicTracks]);
  useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Não foi possível salvar as notas.', error);
    }
  }, [notes]);
  useEffect(() => { localStorage.setItem('noteSize', noteSize); }, [noteSize]);
  useEffect(() => { localStorage.setItem('notesSearchMode', notesSearchMode); }, [notesSearchMode]);
  useEffect(() => { localStorage.setItem('themePreference', themePreference); }, [themePreference]);
  useEffect(() => { localStorage.setItem('workspaceCards', JSON.stringify(workspaceCards)); }, [workspaceCards]);
  useEffect(() => { if (!envGeminiKey) localStorage.setItem('geminiApiKey', geminiApiKey); }, [geminiApiKey, envGeminiKey]);
  useEffect(() => { localStorage.setItem('geminiModel', geminiModel); }, [geminiModel]);
  useEffect(() => { localStorage.setItem('chatSessions', JSON.stringify(chatSessions)); }, [chatSessions]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'light' : 'dark');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => () => {
    if (musicInputErrorTimeoutRef.current) clearTimeout(musicInputErrorTimeoutRef.current);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading, isAiMode]);

  useEffect(() => { searchInputRef.current?.focus(); }, []);

  const handleChatScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight >= 100);
  }, []);

  useEffect(() => {
    function handleClickOutsideMenu(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsSubmenuOpen(false);
        setIsThemeSubmenuOpen(false);
        setIsDataSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideMenu);
  }, []);

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type !== 'image/x-icon' && !file.name.endsWith('.ico'));
    if (validFiles.length < files.length) alert('Arquivos do tipo .ico não são suportados.');
    if (attachments.length + validFiles.length > 10) {
      alert('Máximo de 10 arquivos/imagens permitidos.');
      return;
    }
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setAttachments(prev => [...prev, event.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAiSubmit = async (query: string, currentAttachments: string[]) => {
    if (!geminiApiKey) {
      alert('Chave de API do Gemini não configurada.');
      setShowSettingsPanel(true);
      return;
    }
    setIsAiLoading(true);
    const newMessage = { role: 'user' as const, content: query, attachments: currentAttachments };
    const sessionIdToUse = currentSessionId || Date.now().toString();
    let messagesToSend = [...chatMessages, newMessage];

    setChatSessions(prev => {
      let updated = [...prev];
      const idx = updated.findIndex(s => s.id === sessionIdToUse);
      if (idx === -1) {
        updated.unshift({ id: sessionIdToUse, title: query.substring(0, 40) + (query.length > 40 ? '...' : ''), updatedAt: Date.now(), messages: [newMessage] });
      } else {
        updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, newMessage], updatedAt: Date.now() };
      }
      return updated;
    });

    if (!currentSessionId) setCurrentSessionId(sessionIdToUse);
    setSearchQuery('');
    setAttachments([]);

    try {
      const getParts = (msg: any) => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.attachments) {
          msg.attachments.forEach((att: string) => {
            const match = att.match(/^data:(.*?);base64,(.*)$/);
            if (match) parts.push({ inlineData: { mimeType: match, data: match } });
          });
        }
        if (parts.length === 0) parts.push({ text: "Analise as imagens anexadas." });
        return parts;
      };

      const contents: any[] = [];
      messagesToSend.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'model';
        const parts = getParts(msg);
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push(...parts);
        } else {
          contents.push({ role, parts });
        }
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        const textStr = await response.text();
        let errData;
        try { errData = JSON.parse(textStr); } catch (e) { }
        throw new Error(errData?.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';

      setChatSessions(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(s => s.id === sessionIdToUse);
        if (idx >= 0) updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, { role: 'model', content: text }], updatedAt: Date.now() };
        return updated;
      });
    } catch (error: any) {
      console.error(error);
      setChatSessions(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(s => s.id === sessionIdToUse);
        if (idx >= 0) updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, { role: 'model', content: `Erro: ${error.message}` }], updatedAt: Date.now() };
        return updated;
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearMusicInputError = useCallback(() => {
    if (musicInputErrorTimeoutRef.current) {
      clearTimeout(musicInputErrorTimeoutRef.current);
      musicInputErrorTimeoutRef.current = null;
    }
    setMusicInputError('');
  }, []);

  const executeSearch = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (isAiMode) {
      if (!searchQuery.trim() && attachments.length === 0) return;
      handleAiSubmit(searchQuery, attachments);
      return;
    }
    if (!searchQuery.trim()) {
      return;
    }
    if (activeEngineId === 'music') {
      const url = searchQuery.trim();
      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        clearMusicInputError();
        setMusicInputError('Cole uma URL válida de vídeo ou música do YouTube.');
        return;
      }
      if (musicTracks.some(track => track.videoId === videoId)) {
        setSearchQuery('');
        clearMusicInputError();
        setMusicInputError('Essa música já está na playlist.');
        musicInputErrorTimeoutRef.current = setTimeout(() => {
          setMusicInputError('');
          musicInputErrorTimeoutRef.current = null;
        }, 3000);
        return;
      }
      setMusicTracks(previousTracks => [...previousTracks, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        videoId,
        title: `Vídeo do YouTube ${musicTracks.length + 1}`,
        url,
      }]);
      setSearchQuery('');
      clearMusicInputError();
      return;
    }
    if (activeEngineId === 'workspace') {
      if (searchQuery.toLowerCase().startsWith('add:')) {
        const name = searchQuery.substring(4).trim();
        const newCard: WorkspaceCard = { id: Date.now().toString(), title: name, url: '', icon: '', image: '' };
        setWorkspaceCards(prev => [...prev, newCard]);
        setSearchQuery('');
        setCardFormData({ title: name, url: '', icon: '', image: '' });
        setEditingCardId(newCard.id);
        setWorkspaceModalOpen(true);
        return;
      }
      if (workspaceSearchFallback) {
        const fallbackEngine = webEngines.find(e => e.id === lastSearchEngineId) || webEngines[0];
        window.location.href = fallbackEngine.url + encodeURIComponent(searchQuery);
      }
      return;
    }
    if (activeEngineId === 'notes') {
      if (notesSearchMode === 'web') {
        const searchEngine = webEngines.find(engine => engine.id === lastSearchEngineId) || webEngines[0];
        window.location.href = searchEngine.url + encodeURIComponent(searchQuery);
      }
      return;
    }
    window.location.href = currentActiveEngine.url + encodeURIComponent(searchQuery);
  }, [searchQuery, activeEngineId, currentActiveEngine, workspaceSearchFallback, lastSearchEngineId, isAiMode, attachments, chatMessages, geminiApiKey, geminiModel, musicTracks, notesSearchMode, clearMusicInputError]);

  const handleExportData = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const data = { preferredEngine: activeEngineId, isMonochromeMode, workspaceSearchFallback, themePreference, workspaceCards, musicTracks, notes, noteSize, notesSearchMode, lastSearchEngineId, geminiApiKey, geminiModel, chatSessions };
    setExportDataJson(JSON.stringify(data, null, 2));
    setExportDataModalOpen(true);
    setIsMenuOpen(false); setIsDataSubmenuOpen(false);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.preferredEngine) setActiveEngineId(data.preferredEngine === 'youtube' ? 'google' : data.preferredEngine);
        if (data.isMonochromeMode !== undefined) setIsMonochromeMode(data.isMonochromeMode);
        if (data.workspaceSearchFallback !== undefined) setWorkspaceSearchFallback(data.workspaceSearchFallback);
        const importedTracks = data.musicTracks ?? data.musicPlaylist;
        if (importedTracks !== undefined) setMusicTracks(normalizeMusicTracks(importedTracks));
        if (data.themePreference) setThemePreference(data.themePreference);
        if (data.workspaceCards) setWorkspaceCards(data.workspaceCards);
        if (data.lastSearchEngineId) setLastSearchEngineId(data.lastSearchEngineId);
        if (data.geminiApiKey !== undefined) setGeminiApiKey(data.geminiApiKey);
        if (data.geminiModel !== undefined) setGeminiModel(data.geminiModel);
        if (data.chatSessions) setChatSessions(data.chatSessions);
        if (data.notes !== undefined) setNotes(normalizeNotes(data.notes));
        if (data.noteSize === 'small' || data.noteSize === 'medium' || data.noteSize === 'large') setNoteSize(data.noteSize);
        if (data.notesSearchMode === 'title' || data.notesSearchMode === 'web') setNotesSearchMode(data.notesSearchMode);
      } catch (error) {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
    setIsMenuOpen(false); setIsDataSubmenuOpen(false);
    event.target.value = '';
  };

  return {
    activeEngineId, setActiveEngineId, searchQuery, setSearchQuery, isMenuOpen, setIsMenuOpen, lastSearchEngineId,
    isSubmenuOpen, setIsSubmenuOpen, isThemeSubmenuOpen, setIsThemeSubmenuOpen, isDataSubmenuOpen, setIsDataSubmenuOpen,
    showSettingsPanel, setShowSettingsPanel, isMonochromeMode, setIsMonochromeMode,
    workspaceSearchFallback, setWorkspaceSearchFallback, musicTracks, setMusicTracks, musicInputError, setMusicInputError, themePreference, setThemePreference,
    isAiMode, setIsAiMode, geminiApiKey, setGeminiApiKey, geminiModel, setGeminiModel,
    chatSessions, setChatSessions, currentSessionId, setCurrentSessionId, showHistoryModal, setShowHistoryModal,
    chatMessages, attachments, setAttachments, isAiLoading, showScrollButton,
    workspaceCards, setWorkspaceCards, workspaceModalOpen, setWorkspaceModalOpen,
    editingCardId, setEditingCardId, cardFormData, setCardFormData,
    exportDataModalOpen, setExportDataModalOpen, exportDataJson,
    notes, setNotes, noteSize, setNoteSize, notesSearchMode, setNotesSearchMode,
    menuContainerRef, fileInputRef, fileInputAiRef, chatContainerRef, searchInputRef, messagesEndRef,
    currentAppliedTheme, currentActiveEngine, handleChatScroll, handleFileAttachment,
    executeSearch, handleExportData, handleImportData
  };
};
