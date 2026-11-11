import React from 'react';

export interface SearchEngine {
    id: string;
    name: string;
    url: string;
    icon: React.ReactNode;
}

export interface WorkspaceCard {
    id: string;
    title: string;
    url: string;
    icon: string;
    image: string;
}

export interface MusicTrack {
    id: string;
    videoId: string;
    title: string;
    url: string;
}
