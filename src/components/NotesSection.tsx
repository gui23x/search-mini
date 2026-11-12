import React, { DragEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GripVertical, Trash2 } from "lucide-react";
import { NoteCard, NoteSize } from "../types";

interface NotesSectionProps {
  tc: any;
  notes: NoteCard[];
  setNotes: React.Dispatch<React.SetStateAction<NoteCard[]>>;
  noteSize: NoteSize;
  filteredNotes: NoteCard[];
}

const rowCountBySize: Record<NoteSize, number> = {
  small: 5,
  medium: 8,
  large: 12,
};

const notesViewportHeightBySize: Record<NoteSize, string> = {
  small: "max-h-[25.75rem]",
  medium: "max-h-[34.75rem]",
  large: "max-h-[46.75rem]",
};

export const NotesSection: React.FC<NotesSectionProps> = ({
  tc,
  notes,
  setNotes,
  noteSize,
  filteredNotes,
}) => {
  const draggedNoteId = useRef<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const updateNote = (id: string, changes: Partial<NoteCard>) => {
    setNotes((previous) =>
      previous.map((note) => (note.id === id ? { ...note, ...changes } : note)),
    );
  };

  const moveNote = (targetId: string) => {
    const sourceId = draggedNoteId.current;
    draggedNoteId.current = null;
    setDropTargetId(null);
    if (!sourceId || sourceId === targetId) return;

    setNotes((previous) => {
      const sourceIndex = previous.findIndex((note) => note.id === sourceId);
      const targetIndex = previous.findIndex((note) => note.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return previous;
      const reordered = [...previous];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });
  };

  const cardMarkup = (note: NoteCard) => (
    <motion.article
      key={note.id}
      layout
      onDragOver={(event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setDropTargetId(note.id);
      }}
      onDrop={(event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        moveNote(note.id);
      }}
      onDragLeave={() => setDropTargetId((current) => current === note.id ? null : current)}
      className={`group break-inside-avoid rounded-2xl border p-4 transition-shadow ${tc.videoCardBg} ${tc.videoCardBorder} ${dropTargetId === note.id ? "ring-2 ring-blue-400/70" : ""}`}
    >
      <header className="mb-3 flex items-center gap-2">
        <div className="group/drag relative">
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              draggedNoteId.current = note.id;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", note.id);
            }}
            onDragEnd={() => {
              draggedNoteId.current = null;
              setDropTargetId(null);
            }}
            aria-label={`Arrastar nota ${note.title || "sem título"}`}
            title="Arraste para mover o card"
            className={`cursor-grab touch-none rounded-md p-1 opacity-45 hover:opacity-100 active:cursor-grabbing ${tc.buttonText} ${tc.buttonHoverBg}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover/drag:opacity-100">
            Arraste para mover o card
          </span>
        </div>
        <input
          type="text"
          value={note.title}
          onChange={(event) => updateNote(note.id, { title: event.target.value })}
          aria-label="Título da nota"
          placeholder="Título"
          className={`min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none ${tc.text}`}
        />
        <button
          type="button"
          onClick={() => setNotes((previous) => previous.filter((item) => item.id !== note.id))}
          aria-label={`Excluir ${note.title || "nota"}`}
          title="Excluir nota"
          className={`rounded-lg p-1.5 opacity-45 transition-opacity hover:opacity-100 ${tc.buttonText} hover:text-red-400`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>
      <textarea
        value={note.content}
        onChange={(event) => {
          const value = event.target.value.replace(/(^|\n)- /g, "$1○ ");
          updateNote(note.id, { content: value });
        }}
        aria-label={`Texto da nota ${note.title || "sem título"}`}
        placeholder="Escreva sua nota..."
        rows={rowCountBySize[noteSize]}
        spellCheck="false"
        className={`no-scrollbar w-full resize-none bg-transparent text-sm leading-6 outline-none ${tc.text} ${tc.inputPlaceholder}`}
      />
    </motion.article>
  );

  return (
    <motion.section
      layout
      transition={{ layout: { duration: 0.38, ease: [0.25, 1, 0.5, 1] } }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl px-2 max-sm:flex-1 max-sm:min-h-0 max-sm:overflow-y-auto max-sm:overscroll-contain"
      aria-label="Notas"
    >
      {filteredNotes.length > 0 ? (
        <div
          className={`notes-scroll-area overflow-y-auto overscroll-contain pr-4 ${notesViewportHeightBySize[noteSize]} max-sm:max-h-none max-sm:overflow-visible`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map(cardMarkup)}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className={`mt-8 text-center text-sm ${tc.buttonText}`}>
          {notes.length === 0
            ? "Suas notas aparecerão aqui. Crie uma para começar."
            : "Nenhuma nota encontrada com esse título."}
        </div>
      )}
    </motion.section>
  );
};
