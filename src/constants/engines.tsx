import React from 'react';
import { Music2, Globe, Bird, Shield, Search, Layout, StickyNote } from 'lucide-react';
import { SearchEngine } from '../types';

export const webEngines: SearchEngine[] = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: <Search className="w-4 h-4" /> },
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: <Bird className="w-4 h-4" /> },
    { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q=', icon: <Shield className="w-4 h-4" /> },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: <Globe className="w-4 h-4" /> },
];

export const otherEngines: SearchEngine[] = [
    { id: 'music', name: 'Música', url: 'https://www.youtube.com/results?search_query=', icon: <Music2 className="w-4 h-4" /> },
    { id: 'workspace', name: 'Workspace', url: '', icon: <Layout className="w-4 h-4" /> },
    { id: 'notes', name: 'Notas', url: '', icon: <StickyNote className="w-4 h-4" /> },
];

export const allEngines: SearchEngine[] = [...webEngines, ...otherEngines];
