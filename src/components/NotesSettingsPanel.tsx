import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, X } from "lucide-react";
import { NoteSize, NotesSearchMode } from "../types";

interface NotesSettingsPanelProps {
  tc: any;
  notesSearchMode: NotesSearchMode;
  setNotesSearchMode: (value: NotesSearchMode) => void;
  noteSize: NoteSize;
  setNoteSize: (value: NoteSize) => void;
  setShowSettingsPanel: (value: boolean) => void;
}

interface SelectOption<Value extends string> {
  value: Value;
  label: string;
}

interface CustomSelectProps<Value extends string> {
  label: string;
  value: Value;
  options: SelectOption<Value>[];
  tc: any;
  onChange: (value: Value) => void;
}

const CustomSelect = <Value extends string,>({
  label,
  value,
  options,
  tc,
  onChange,
}: CustomSelectProps<Value>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative w-full sm:w-auto sm:min-w-[190px]"
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.text} ${tc.buttonHoverBg}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="listbox"
            aria-label={label}
            className={`absolute right-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border p-1.5 shadow-xl backdrop-blur-xl ${tc.menuBg} ${tc.menuBorder}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isSelected ? `${tc.text} ${tc.channelCardSelectedBg}` : tc.buttonText} ${tc.buttonHoverBg} ${tc.buttonHoverText}`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const NotesSettingsPanel: React.FC<NotesSettingsPanelProps> = ({
  tc,
  notesSearchMode,
  setNotesSearchMode,
  noteSize,
  setNoteSize,
  setShowSettingsPanel,
}) => (
  <motion.div
    initial={{ height: 0, opacity: 0, y: -6, marginTop: 0 }}
    animate={{ height: "auto", opacity: 1, y: 0, marginTop: 24 }}
    exit={{ height: 0, opacity: 0, y: -6, marginTop: 0 }}
    transition={{
      height: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
      opacity: { duration: 0.2 },
      y: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
      marginTop: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
    }}
    className="w-full"
  >
    <div
      className={`space-y-4 rounded-xl border p-4 backdrop-blur-md ${tc.settingsPanelBg} ${tc.settingsPanelBorder}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className={`text-xs font-medium ${tc.settingsLabelText}`}>
          Pesquisar por
        </span>
        <CustomSelect
          label="Pesquisar por"
          value={notesSearchMode}
          onChange={setNotesSearchMode}
          tc={tc}
          options={[
            { value: "title", label: "Título dos cards" },
            { value: "web", label: "Busca web" },
          ]}
        />
      </div>
      <div
        className={`flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${tc.settingsDivider}`}
      >
        <span className={`text-xs font-medium ${tc.settingsLabelText}`}>
          Tamanho dos cards
        </span>
        <CustomSelect
          label="Tamanho dos cards"
          value={noteSize}
          onChange={setNoteSize}
          tc={tc}
          options={[
            { value: "small", label: "Pequeno · 5 linhas" },
            { value: "medium", label: "Médio · 8 linhas" },
            { value: "large", label: "Grande · 12 linhas" },
          ]}
        />
      </div>
      <button
        type="button"
        onClick={() => setShowSettingsPanel(false)}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-medium transition-colors ${tc.settingsButtonBg} ${tc.settingsButtonHoverBg}`}
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
        Fechar configurações
      </button>
    </div>
  </motion.div>
);
