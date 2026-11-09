import React, { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  X,
} from "lucide-react";
import { MusicTrack } from "../types";

interface MusicSectionProps {
  tc: any;
  tracks: MusicTrack[];
  setTracks: React.Dispatch<React.SetStateAction<MusicTrack[]>>;
  musicInputError: string;
}

interface YouTubePlayer {
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getVideoData: () => { title: string };
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type RepeatMode = "off" | "all" | "one";

let youtubeApiPromise: Promise<YouTubeApi> | undefined;

const loadYouTubeApi = () => {
  if (window.YT) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("A API do player do YouTube não foi inicializada."));
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = undefined;
      reject(new Error("Não foi possível carregar o player do YouTube."));
    };
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
};

const MusicTrackCard: React.FC<{
  track: MusicTrack;
  active: boolean;
  tc: any;
  isShuffleOn: boolean;
  selectionMode: boolean;
  isSelected: boolean;
  isDropTarget: boolean;
  onSelect: () => void;
  onToggleSelection: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}> = ({ track, active, tc, isShuffleOn, selectionMode, isSelected, isDropTarget, onSelect, onToggleSelection, onMove, onDragStart, onDragEnd, onDragOver, onDrop }) => (
  <div
    draggable={!isShuffleOn && !selectionMode}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className={`group flex cursor-grab items-center gap-3 rounded-xl border p-2 transition-all active:cursor-grabbing ${active ? `${tc.channelCardSelectedBg} ${tc.channelCardSelectedBorder}` : `${tc.videoCardBg} ${tc.videoCardBorder}`} ${isShuffleOn || selectionMode ? "cursor-default" : ""} ${isDropTarget ? "ring-2 ring-blue-400/70" : ""}`}
  >
    {selectionMode && (
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelection}
        onClick={(event) => event.stopPropagation()}
        aria-label={`Selecionar ${track.title} para exclusão`}
        className="h-4 w-4 flex-shrink-0 accent-red-500"
      />
    )}
    <button
      type="button"
      onClick={selectionMode ? onToggleSelection : onSelect}
      disabled={selectionMode}
      className="flex min-w-0 flex-1 items-center gap-3 text-left"
      aria-current={active ? "true" : undefined}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      <img
        src={`https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`}
        alt=""
        className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
        referrerPolicy="no-referrer"
      />
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${tc.text}`}>
          {track.title}
        </span>
        <span className={`mt-1 block text-xs ${tc.videoMetaText}`}>
          YouTube
        </span>
      </span>
    </button>
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={isShuffleOn || selectionMode}
        aria-label={`Mover ${track.title} para cima`}
        className={`rounded p-1 disabled:opacity-30 ${tc.buttonText} ${tc.buttonHoverBg}`}
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={isShuffleOn || selectionMode}
        aria-label={`Mover ${track.title} para baixo`}
        className={`rounded p-1 disabled:opacity-30 ${tc.buttonText} ${tc.buttonHoverBg}`}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

export const MusicSection: React.FC<MusicSectionProps> = ({ tc, tracks, setTracks, musicInputError }) => {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(
    () => tracks[0]?.id ?? null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [playerMessage, setPlayerMessage] = useState("");
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const draggedTrackIdRef = useRef<string | null>(null);
  const [dropTargetTrackId, setDropTargetTrackId] = useState<string | null>(null);
  const latestStateRef = useRef({
    tracks,
    currentTrackId,
    repeatMode,
    isShuffleOn,
    isPlaying,
  });

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

  latestStateRef.current = {
    tracks,
    currentTrackId,
    repeatMode,
    isShuffleOn,
    isPlaying,
  };

  useEffect(() => {
    let cancelled = false;
    let createdPlayer: YouTubePlayer | null = null;

    loadYouTubeApi()
      .then((youtube) => {
        if (cancelled || !playerHostRef.current) return;
        createdPlayer = new youtube.Player(playerHostRef.current, {
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              playerRef.current = target;
              const { tracks: savedTracks, currentTrackId: selectedId, isPlaying: shouldPlay } =
                latestStateRef.current;
              const selectedTrack = savedTracks.find((track) => track.id === selectedId);
              if (!selectedTrack) return;
              if (shouldPlay) target.loadVideoById(selectedTrack.videoId);
              else target.cueVideoById(selectedTrack.videoId);
            },
            onStateChange: ({ data, target }) => {
              if (!window.YT) return;
              if (data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setPlayerMessage("");
                const title = target.getVideoData().title;
                const playingId = latestStateRef.current.currentTrackId;
                if (title && playingId) {
                  setTracks((previousTracks) => {
                    if (previousTracks.find((track) => track.id === playingId)?.title === title) {
                      return previousTracks;
                    }
                    return previousTracks.map((track) =>
                      track.id === playingId ? { ...track, title } : track,
                    );
                  });
                }
              } else if (data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (data === window.YT.PlayerState.ENDED) {
                const { tracks: savedTracks, currentTrackId: selectedId, repeatMode: mode, isShuffleOn: shuffle } =
                  latestStateRef.current;
                const selectedIndex = savedTracks.findIndex((track) => track.id === selectedId);
                const endedTrack = savedTracks[selectedIndex];
                if (mode === "one" && endedTrack) {
                  target.seekTo(0, true);
                  target.playVideo();
                  return;
                }
                if (selectedIndex < 0 || savedTracks.length < 2) {
                  setIsPlaying(false);
                  return;
                }
                let nextIndex = selectedIndex + 1;
                if (shuffle) {
                  const choices = savedTracks
                    .map((_, index) => index)
                    .filter((index) => index !== selectedIndex);
                  nextIndex = choices[Math.floor(Math.random() * choices.length)];
                } else if (nextIndex >= savedTracks.length) {
                  if (mode !== "all") {
                    setIsPlaying(false);
                    return;
                  }
                  nextIndex = 0;
                }
                setCurrentTrackId(savedTracks[nextIndex].id);
                setIsPlaying(true);
              }
            },
            onError: ({ data }) => {
              const message =
                data === 101 || data === 150
                  ? "Este vídeo não permite reprodução incorporada."
                  : "O YouTube não conseguiu reproduzir esta faixa.";
              setPlayerMessage(message);
              setIsPlaying(false);
            },
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Falha ao iniciar o player de música.", error);
        setPlayerMessage(
          error instanceof Error ? error.message : "Não foi possível iniciar o player do YouTube.",
        );
      });

    return () => {
      cancelled = true;
      playerRef.current = null;
      createdPlayer?.destroy();
    };
  }, [setTracks]);

  useEffect(() => {
    if (!tracks.some((track) => track.id === currentTrackId)) {
      setCurrentTrackId(tracks[0]?.id ?? null);
      setIsPlaying(false);
    }
    setSelectedTrackIds((selectedIds) =>
      selectedIds.filter((id) => tracks.some((track) => track.id === id)),
    );
  }, [currentTrackId, tracks]);

  useEffect(() => {
    if (!playerRef.current || !currentTrack) return;
    if (isPlaying) playerRef.current.loadVideoById(currentTrack.videoId);
    else playerRef.current.cueVideoById(currentTrack.videoId);
  }, [currentTrack?.videoId]);

  const selectTrack = (track: MusicTrack) => {
    setCurrentTrackId(track.id);
    setIsPlaying(true);
    setPlayerMessage("");
    playerRef.current?.loadVideoById(track.videoId);
  };

  const handleTogglePlay = () => {
    if (!currentTrack && tracks[0]) {
      selectTrack(tracks[0]);
      return;
    }
    if (isPlaying) playerRef.current?.pauseVideo();
    else if (currentTrack) playerRef.current?.playVideo();
    setIsPlaying((playing) => !playing);
  };

  const moveTrack = (direction: -1 | 1) => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
    if (isShuffleOn && tracks.length > 1) {
      const choices = tracks.filter((track) => track.id !== currentTrackId);
      selectTrack(choices[Math.floor(Math.random() * choices.length)]);
      return;
    }
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + direction + tracks.length) % tracks.length;
    selectTrack(tracks[nextIndex]);
  };

  const reorderTrack = (sourceId: string, targetId: string) => {
    if (isShuffleOn || sourceId === targetId) return;
    setTracks((previousTracks) => {
      const sourceIndex = previousTracks.findIndex((track) => track.id === sourceId);
      const targetIndex = previousTracks.findIndex((track) => track.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return previousTracks;
      const reordered = [...previousTracks];
      const [movedTrack] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, movedTrack);
      return reordered;
    });
  };

  const confirmDeleteSelected = () => {
    const deletedCurrentTrack = selectedTrackIds.includes(currentTrackId ?? "");
    setTracks((previousTracks) =>
      previousTracks.filter((track) => !selectedTrackIds.includes(track.id)),
    );
    if (deletedCurrentTrack) {
      const nextTrack = tracks.find((track) => !selectedTrackIds.includes(track.id));
      setCurrentTrackId(nextTrack?.id ?? null);
      setIsPlaying(false);
      playerRef.current?.pauseVideo();
    }
    setSelectedTrackIds([]);
    setIsDeleteConfirmationOpen(false);
    setIsSelectionMode(false);
  };

  const repeatLabel =
    repeatMode === "off"
      ? "Repetição desativada"
      : repeatMode === "all"
        ? "Repetir playlist"
        : "Repetir faixa";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 w-full max-w-4xl"
    >
      <div
        className={`relative isolate mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border p-4 sm:p-7 ${tc.settingsPanelBg} ${tc.settingsPanelBorder}`}
      >
        <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-8">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <p className={`mb-3 text-[10px] font-bold uppercase tracking-[0.22em] ${tc.settingsLabelText}`}>
              Tocando agora
            </p>
            <h2 className={`break-words text-2xl font-bold sm:text-3xl ${tc.text}`}>
              {currentTrack?.title ?? "Sua próxima trilha"}
            </h2>
            <p className={`mt-2 text-sm ${tc.videoMetaText}`}>
              {currentTrack ? "YouTube" : "Adicione uma URL do YouTube à playlist"}
            </p>

            <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-1.5 sm:gap-3 md:mt-8 md:justify-start">
              <button
                type="button"
                onClick={() => moveTrack(-1)}
                disabled={tracks.length === 0}
                aria-label="Faixa anterior"
                className={`rounded-full p-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${tc.buttonText} ${tc.buttonHoverBg}`}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={tracks.length === 0}
                aria-label={isPlaying ? "Pausar música" : "Reproduzir música"}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${tc.text} ${tc.settingsButtonBg} ${tc.settingsButtonHoverBg}`}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => moveTrack(1)}
                disabled={tracks.length === 0}
                aria-label="Próxima faixa"
                className={`rounded-full p-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${tc.buttonText} ${tc.buttonHoverBg}`}
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setRepeatMode((mode) =>
                    mode === "off" ? "all" : mode === "all" ? "one" : "off",
                  )
                }
                title={repeatLabel}
                aria-label={repeatLabel}
                aria-pressed={repeatMode !== "off"}
                className={`rounded-full p-2.5 transition-colors ${repeatMode !== "off" ? tc.text : tc.buttonText} ${tc.buttonHoverBg}`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsShuffleOn((shuffle) => !shuffle)}
                title={isShuffleOn ? "Desativar aleatório" : "Ativar aleatório"}
                aria-label={isShuffleOn ? "Desativar aleatório" : "Ativar aleatório"}
                aria-pressed={isShuffleOn}
                className={`rounded-full p-2.5 transition-colors ${isShuffleOn ? tc.text : tc.buttonText} ${tc.buttonHoverBg}`}
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-2xl ${tc.videoCardBg} md:max-w-none`}>
            {currentTrack ? (
              <>
                <img
                  src={`https://i.ytimg.com/vi/${currentTrack.videoId}/hqdefault.jpg`}
                  alt={`Capa de ${currentTrack.title}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 text-left text-white sm:bottom-4 sm:left-4">
                  <Music2 className="h-4 w-4" />
                  <span className="max-w-[30ch] truncate text-sm font-medium">{currentTrack.title}</span>
                </div>
              </>
            ) : (
              <div className={`flex h-full flex-col items-center justify-center gap-3 ${tc.videoMetaText}`}>
                <Music2 className="h-10 w-10 opacity-50" />
                <span className="text-sm">Sua playlist começa aqui</span>
              </div>
            )}
            <div
              ref={playerHostRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.01]"
            />
          </div>
        </div>
      </div>

      {musicInputError && (
        <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {musicInputError}
        </p>
      )}
      {playerMessage && (
        <p role="status" className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
          {playerMessage}
        </p>
      )}

      <div className="mb-4 mt-8 flex items-center justify-between gap-3 px-1">
        <h3 className={`text-lg font-bold ${tc.text}`}>Minha playlist</h3>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${tc.videoMetaText}`}>
            {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
          </span>
          <button
            type="button"
            onClick={() => setIsPlaylistVisible((visible) => !visible)}
            aria-expanded={isPlaylistVisible}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${tc.buttonText} ${tc.buttonHoverBg}`}
          >
            {isPlaylistVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPlaylistVisible ? "Ocultar" : "Mostrar"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                setIsPlaylistVisible(true);
                return;
              }
              if (selectedTrackIds.length > 0) {
                setIsDeleteConfirmationOpen(true);
                return;
              }
              setIsSelectionMode(false);
              setSelectedTrackIds([]);
            }}
            disabled={tracks.length === 0}
            aria-label={
              isSelectionMode
                ? `Excluir ${selectedTrackIds.length} músicas selecionadas`
                : "Selecionar músicas para excluir"
            }
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isSelectionMode ? "text-red-500" : tc.buttonText} ${tc.buttonHoverBg}`}
          >
            <Trash2 className="h-4 w-4" />
            {isSelectionMode
              ? selectedTrackIds.length > 0
                ? `Excluir (${selectedTrackIds.length})`
                : "Cancelar seleção"
              : "Excluir"}
          </button>
        </div>
      </div>

      {isPlaylistVisible && isSelectionMode && tracks.length > 0 && (
        <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${tc.videoCardBorder} ${tc.videoMetaText}`}>
          <span>Selecione os cards que deseja remover.</span>
          <button
            type="button"
            onClick={() =>
              setSelectedTrackIds((selectedIds) =>
                selectedIds.length === tracks.length ? [] : tracks.map((track) => track.id),
              )
            }
            className={`rounded-md px-2 py-1 ${tc.text} ${tc.buttonHoverBg}`}
          >
            {selectedTrackIds.length === tracks.length ? "Desmarcar todas" : "Selecionar todas"}
          </button>
        </div>
      )}

      {isPlaylistVisible && tracks.length === 0 ? (
        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${tc.videoCardBorder} ${tc.videoMetaText}`}>
          Adicione links de vídeos ou músicas do YouTube para montar sua playlist.
        </div>
      ) : isPlaylistVisible && tracks.length > 0 ? (
        <div
          className="mx-auto max-h-[320px] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl pr-2 sm:max-h-[360px]"
          role="region"
          aria-label="Playlist. Arraste os cartões para mudar a ordem."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
            <MusicTrackCard
              key={track.id}
              track={track}
              active={track.id === currentTrackId}
              tc={tc}
              isShuffleOn={isShuffleOn}
              selectionMode={isSelectionMode}
              isSelected={selectedTrackIds.includes(track.id)}
              isDropTarget={dropTargetTrackId === track.id}
              onSelect={() => selectTrack(track)}
              onToggleSelection={() =>
                setSelectedTrackIds((selectedIds) =>
                  selectedIds.includes(track.id)
                    ? selectedIds.filter((id) => id !== track.id)
                    : [...selectedIds, track.id],
                )
              }
              onMove={(direction) => {
                const index = tracks.findIndex((item) => item.id === track.id);
                const targetIndex = index + direction;
                if (targetIndex < 0 || targetIndex >= tracks.length || isShuffleOn || isSelectionMode) return;
                reorderTrack(track.id, tracks[targetIndex].id);
              }}
              onDragStart={(event) => {
                draggedTrackIdRef.current = track.id;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", track.id);
              }}
              onDragEnd={() => {
                draggedTrackIdRef.current = null;
                setDropTargetTrackId(null);
              }}
              onDragOver={(event) => {
                if (isShuffleOn || isSelectionMode) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropTargetTrackId(track.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = draggedTrackIdRef.current ?? event.dataTransfer.getData("text/plain");
                reorderTrack(sourceId, track.id);
                draggedTrackIdRef.current = null;
                setDropTargetTrackId(null);
              }}
            />
            ))}
          </div>
        </div>
      ) : null}
      {isDeleteConfirmationOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsDeleteConfirmationOpen(false);
          }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-playlist-title"
            aria-describedby="delete-playlist-description"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${tc.settingsPanelBg} ${tc.settingsPanelBorder}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 id="delete-playlist-title" className={`text-lg font-bold ${tc.text}`}>
                  Excluir músicas selecionadas?
                </h4>
                <p id="delete-playlist-description" className={`mt-2 text-sm ${tc.videoMetaText}`}>
                  {selectedTrackIds.length} {selectedTrackIds.length === 1 ? "música será removida" : "músicas serão removidas"} da playlist salva neste dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(false)}
                aria-label="Fechar confirmação"
                className={`rounded-lg p-2 ${tc.buttonText} ${tc.buttonHoverBg}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(false)}
                className={`rounded-xl px-4 py-2 text-sm ${tc.buttonText} ${tc.buttonHoverBg}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteSelected}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
};
