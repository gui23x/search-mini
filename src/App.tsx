import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  Database,
  Download,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  Upload,
  Plus,
} from "lucide-react";
import { useAppLogic } from "./hooks/useAppLogic";
import { themeClasses, ThemePreference } from "./constants/themeClasses";
import { webEngines, otherEngines } from "./constants/engines";

// Sub-componentes modulares desacoplados
import { SettingsPanel } from "./components/SettingsPanel";
import { NotesSettingsPanel } from "./components/NotesSettingsPanel";
import { MusicSection } from "./components/MusicSection";
import { WorkspaceSection } from "./components/WorkspaceSection";
import { NotesSection } from "./components/NotesSection";
import { ModalsContainer } from "./components/ModalsContainer";

export default function App() {
  const logic = useAppLogic();
  const tc = themeClasses[logic.currentAppliedTheme];
  const [isCreditsSubmenuOpen, setIsCreditsSubmenuOpen] = React.useState(false);
  const [showNotesLimitAlert, setShowNotesLimitAlert] = React.useState(false);
  const menuSurfaceClass = `${tc.bg} ${
    logic.currentAppliedTheme === "light" ||
    logic.currentAppliedTheme === "pastel"
      ? "border-[#c2b3a3]"
      : "border-white/20"
  } transition-colors duration-500`;
  const menuItemHoverClass = `${tc.buttonHoverBg} ${tc.buttonHoverText} transition-colors cursor-pointer`;
  const selectedIndicatorClass =
    logic.currentAppliedTheme === "light" ||
    logic.currentAppliedTheme === "pastel"
      ? "before:bg-[#8a8a8a]"
      : "before:bg-white/80";
  const menuShadowClass =
    logic.currentAppliedTheme === "light" ||
    logic.currentAppliedTheme === "pastel"
      ? "shadow-lg shadow-[#5c5c5c]/10"
      : "shadow-lg shadow-black/20";
  const themeIcons: Record<ThemePreference, React.ReactNode> = {
    system: <Monitor className="h-[17px] w-[17px] opacity-70" />,
    light: <Sun className="h-[17px] w-[17px] opacity-70" />,
    dark: <Moon className="h-[17px] w-[17px] opacity-70" />,
    black: <Circle className="h-[17px] w-[17px] opacity-70" />,
    pastel: <Palette className="h-[17px] w-[17px] opacity-70" />,
  };
  const filteredWorkspaceCards = logic.workspaceCards.filter((card) =>
    card.title.toLowerCase().includes(logic.searchQuery.toLowerCase()),
  );
  const filteredNotes = logic.notesSearchMode === "title"
    ? logic.notes.filter((note) => note.title.toLowerCase().includes(logic.searchQuery.trim().toLowerCase()))
    : logic.notes;
  const isWebEngineSelected = webEngines.some(
    (engine) => engine.id === logic.activeEngineId,
  );
  const selectEngine = (engineId: string) => {
    logic.setActiveEngineId(engineId);
    logic.setIsAiMode(false);
    setShowNotesLimitAlert(false);
    logic.setIsMenuOpen(false);
    logic.setIsSubmenuOpen(false);
    logic.setIsThemeSubmenuOpen(false);
    logic.setIsDataSubmenuOpen(false);
    setIsCreditsSubmenuOpen(false);
  };
  const isTouchInput = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const addNote = () => {
    if (logic.notes.filter((note) => !note.content.trim()).length >= 2) {
      setShowNotesLimitAlert(true);
      return;
    }
    setShowNotesLimitAlert(false);
    logic.setNotes((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: "Nova nota",
        content: "",
      },
    ]);
    logic.setSearchQuery("");
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${tc.bg} ${tc.text} ${tc.selection}`}
    >
      <input
        type="file"
        accept=".json"
        ref={logic.fileInputRef}
        onChange={logic.handleImportData}
        className="hidden"
      />

      <motion.main
        layout
        transition={{ layout: { duration: 0.38, ease: [0.25, 1, 0.5, 1] } }}
        className={`flex flex-col items-center p-4 relative ${logic.activeEngineId === "notes" ? "max-sm:h-[100dvh] max-sm:min-h-0 max-sm:overflow-hidden" : "min-h-screen"}`}
      >
        <motion.div
          layout
          className={`w-full flex justify-center z-50 ${logic.activeEngineId === "workspace" || logic.activeEngineId === "music" || logic.activeEngineId === "notes" ? "mt-12 sm:mt-20 mb-8" : "mt-[45vh] -translate-y-1/2 mb-0"}`}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ layout: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } }}
            className="relative w-full max-w-[480px] flex flex-col items-center"
          >
            <div className="w-[90%] sm:w-[85%] flex items-center gap-2 transition-all duration-500 relative z-20 focus-within:w-full focus-within:-translate-y-0.5">
              <form
                onSubmit={logic.executeSearch}
                className={`search-box flex-1 flex items-center rounded-[14px] px-3.5 py-2 backdrop-blur-xl transition-all duration-500 ${tc.searchBoxBg} ${tc.searchBoxBorder} ${tc.searchBoxFocusBg} ${tc.searchBoxFocusBorder} ${tc.searchBoxShadow} border`}
              >
                <div className="relative" ref={logic.menuContainerRef}>
                  <button
                    type="button"
                    aria-expanded={logic.isMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      logic.setIsMenuOpen(!logic.isMenuOpen);
                      logic.setIsSubmenuOpen(false);
                      logic.setIsThemeSubmenuOpen(false);
                      logic.setIsDataSubmenuOpen(false);
                      setIsCreditsSubmenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[0.85rem] font-medium ${tc.buttonText} ${tc.buttonHoverBg} ${tc.buttonHoverText}`}
                  >
                    <span>{logic.currentActiveEngine.name}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 opacity-60 transition-transform ${logic.isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {logic.isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="menu"
                        className={`absolute top-[calc(100%+10px)] -left-3.5 z-30 w-[min(218px,calc(100vw-16px))] rounded-[20px] border p-2.5 ${menuShadowClass} ${menuSurfaceClass}`}
                      >
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (!isTouchInput()) logic.setIsSubmenuOpen(true);
                          }}
                          onMouseLeave={() => {
                            if (!isTouchInput()) logic.setIsSubmenuOpen(false);
                          }}
                        >
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={logic.isSubmenuOpen}
                            onFocus={() => {
                              if (!isTouchInput()) logic.setIsSubmenuOpen(true);
                            }}
                            onClick={() => {
                              if (isTouchInput()) {
                                logic.setIsSubmenuOpen(!logic.isSubmenuOpen);
                              }
                            }}
                            className={`relative w-full flex items-center justify-between px-3 py-2.5 pl-4 text-left text-[0.85rem] rounded-xl ${isWebEngineSelected ? `${tc.text} ${tc.channelCardSelectedBg}` : tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:rounded-full ${isWebEngineSelected ? selectedIndicatorClass : "before:bg-transparent"}`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <Globe className="h-[17px] w-[17px] shrink-0 opacity-70" />
                              <span className="flex min-w-0 flex-col items-start">
                                <span>Web</span>
                                {isWebEngineSelected && (
                                  <span className="text-[0.68rem] opacity-55">
                                    {logic.currentActiveEngine.name}
                                  </span>
                                )}
                              </span>
                            </span>
                            <ChevronRight className="h-[17px] w-[17px] opacity-50" />
                          </button>
                          <AnimatePresence>
                            {logic.isSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-full z-40 w-[min(174px,calc(100vw-24px))] pt-1.5 sm:left-full sm:top-0 sm:pt-0 sm:pl-4"
                              >
                                <div
                                  role="menu"
                                  className={`rounded-[18px] border p-1.5 ${menuShadowClass} ${menuSurfaceClass}`}
                                >
                                  {webEngines.map((engine) => {
                                    const selected =
                                      logic.activeEngineId === engine.id;
                                    return (
                                      <button
                                        key={engine.id}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => selectEngine(engine.id)}
                                        className={`relative w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.8rem] ${selected ? `${tc.text} ${tc.channelCardSelectedBg} font-medium` : tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:rounded-full ${selected ? selectedIndicatorClass : "before:bg-transparent"} [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                      >
                                        {engine.icon}
                                        {engine.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {otherEngines.map((engine) => {
                          const selected = logic.activeEngineId === engine.id;
                          return (
                            <button
                              key={engine.id}
                              type="button"
                              role="menuitem"
                              onClick={() => selectEngine(engine.id)}
                              className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 pl-4 text-left text-[0.85rem] rounded-xl ${selected ? `${tc.text} ${tc.channelCardSelectedBg} font-medium` : tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:rounded-full ${selected ? selectedIndicatorClass : "before:bg-transparent"} [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                            >
                              {engine.icon}
                              {engine.name}
                            </button>
                          );
                        })}

                        <div
                          className={`my-2 border-t ${tc.settingsDivider}`}
                        />
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (!isTouchInput())
                              logic.setIsThemeSubmenuOpen(true);
                          }}
                          onMouseLeave={() => {
                            if (!isTouchInput())
                              logic.setIsThemeSubmenuOpen(false);
                          }}
                        >
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={logic.isThemeSubmenuOpen}
                            onFocus={() => {
                              if (!isTouchInput())
                                logic.setIsThemeSubmenuOpen(true);
                            }}
                            onClick={() => {
                              if (isTouchInput()) {
                                logic.setIsThemeSubmenuOpen(
                                  !logic.isThemeSubmenuOpen,
                                );
                              }
                            }}
                            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[0.85rem] rounded-xl ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Palette className="h-[17px] w-[17px] opacity-70" />
                              <span>Tema</span>
                            </span>
                            <ChevronRight className="h-[17px] w-[17px] opacity-50" />
                          </button>
                          <AnimatePresence>
                            {logic.isThemeSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-full z-40 w-[min(140px,calc(100vw-24px))] pt-1.5 sm:bottom-[-4px] sm:left-full sm:top-auto sm:w-[140px] sm:pt-0 sm:pl-4"
                              >
                                <div
                                  role="menu"
                                  className={`rounded-[18px] border p-1.5 ${menuShadowClass} ${menuSurfaceClass}`}
                                >
                                  {(
                                    [
                                      "system",
                                      "light",
                                      "dark",
                                      "black",
                                      "pastel",
                                    ] as ThemePreference[]
                                  ).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                        logic.setThemePreference(t);
                                        logic.setIsMenuOpen(false);
                                        logic.setIsThemeSubmenuOpen(false);
                                      }}
                                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.8rem] ${logic.themePreference === t ? `${tc.text} font-medium` : tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                    >
                                      {themeIcons[t]}
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (!isTouchInput())
                              logic.setIsDataSubmenuOpen(true);
                          }}
                          onMouseLeave={() => {
                            if (!isTouchInput())
                              logic.setIsDataSubmenuOpen(false);
                          }}
                        >
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={logic.isDataSubmenuOpen}
                            onFocus={() => {
                              if (!isTouchInput())
                                logic.setIsDataSubmenuOpen(true);
                            }}
                            onClick={() => {
                              if (isTouchInput()) {
                                logic.setIsDataSubmenuOpen(
                                  !logic.isDataSubmenuOpen,
                                );
                              }
                            }}
                            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[0.85rem] rounded-xl ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Database className="h-[17px] w-[17px] opacity-70" />
                              <span>Data</span>
                            </span>
                            <ChevronRight className="h-[17px] w-[17px] opacity-50" />
                          </button>
                          <AnimatePresence>
                            {logic.isDataSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-full z-40 w-[min(140px,calc(100vw-24px))] pt-1.5 sm:bottom-[-4px] sm:left-full sm:top-auto sm:w-[140px] sm:pt-0 sm:pl-4"
                              >
                                <div
                                  role="menu"
                                  className={`rounded-[18px] border p-1.5 ${menuShadowClass} ${menuSurfaceClass}`}
                                >
                                  <button
                                    type="button"
                                    onClick={logic.handleExportData}
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                  >
                                    <Download className="opacity-70" />
                                    Exportar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      logic.fileInputRef.current?.click()
                                    }
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                  >
                                    <Upload className="opacity-70" />
                                    Importar
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div
                          className={`my-2 border-t ${tc.settingsDivider}`}
                        />
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (!isTouchInput()) setIsCreditsSubmenuOpen(true);
                          }}
                          onMouseLeave={() => {
                            if (!isTouchInput()) setIsCreditsSubmenuOpen(false);
                          }}
                        >
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isCreditsSubmenuOpen}
                            onFocus={() => {
                              if (!isTouchInput())
                                setIsCreditsSubmenuOpen(true);
                            }}
                            onClick={() => {
                              if (isTouchInput()) {
                                setIsCreditsSubmenuOpen(!isCreditsSubmenuOpen);
                              }
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Code2 className="h-[17px] w-[17px] opacity-70" />
                              <span>
                                <span className="block text-[0.68rem] opacity-55">
                                  Desenvolvido por
                                </span>
                                <span className={`block ${tc.text}`}>
                                  Gui23x
                                </span>
                              </span>
                            </span>
                            <ChevronRight className="h-[17px] w-[17px] opacity-50" />
                          </button>
                          <AnimatePresence>
                            {isCreditsSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-full z-40 w-[min(174px,calc(100vw-24px))] pt-1.5 sm:left-full sm:top-auto sm:bottom-0 sm:w-[174px] sm:pt-0 sm:pl-4"
                              >
                                <div
                                  role="menu"
                                  className={`rounded-[18px] border p-1.5 ${menuShadowClass} ${menuSurfaceClass}`}
                                >
                                  <a
                                    role="menuitem"
                                    href="https://github.com/gui23x"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                  >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                  </a>
                                  <a
                                    role="menuitem"
                                    href="https://www.instagram.com/dsngui"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                  >
                                    <Instagram className="h-4 w-4" />
                                    Instagram
                                  </a>
                                  <a
                                    role="menuitem"
                                    href="https://www.linkedin.com/in/guilherme-gomes-da-silva/?locale=en"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8rem] ${tc.buttonText} ${menuItemHoverClass} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-current [&>svg]:h-[17px] [&>svg]:w-[17px]`}
                                  >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={`w-px h-[18px] mx-2.5 ${tc.divider}`} />

                <input
                  ref={logic.searchInputRef}
                  type="text"
                  value={logic.searchQuery}
                  onChange={(e) => {
                    logic.setSearchQuery(e.target.value);
                    if (logic.activeEngineId === "music")
                      logic.setMusicInputError("");
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder={
                    logic.activeEngineId === "music"
                      ? "Cole uma URL do YouTube para adicionar música..."
                      : logic.activeEngineId === "notes"
                        ? logic.notesSearchMode === "title" ? "Pesquisar pelo título das notas..." : `Pesquisar no ${webEngines.find((engine) => engine.id === logic.lastSearchEngineId)?.name || "Google"}...`
                      : `Pesquisar no ${logic.currentActiveEngine.name}...`
                  }
                  className={`flex-1 bg-transparent border-none outline-none text-[0.95rem] ${tc.text} ${tc.inputPlaceholder} w-full`}
                />

                <div className="flex items-center ml-1 gap-1">
                  {logic.activeEngineId === "music" && (
                    <button
                      type="submit"
                      aria-label="Adicionar música à playlist"
                      title="Adicionar música à playlist"
                      className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${tc.buttonText} ${tc.buttonHoverBg} ${tc.buttonHoverText}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {logic.activeEngineId === "notes" && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={addNote}
                    className={`flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${tc.searchBoxBg} ${tc.searchBoxBorder} ${tc.buttonText} ${tc.buttonHoverBg}`}
                    title="Adicionar nota"
                    aria-label="Adicionar nova nota"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => logic.setShowSettingsPanel(!logic.showSettingsPanel)}
                    className={`flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${tc.searchBoxBg} ${tc.searchBoxBorder} ${tc.buttonText} ${tc.buttonHoverBg}`}
                    title="Configurações"
                    aria-label="Configurar notas"
                    aria-expanded={logic.showSettingsPanel}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              )}

              {logic.activeEngineId === "workspace" && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      logic.setCardFormData({
                        title: "",
                        url: "",
                        icon: "",
                        image: "",
                      });
                      logic.setEditingCardId(null);
                      logic.setWorkspaceModalOpen(true);
                    }}
                    className={`flex items-center justify-center w-[42px] h-[42px] rounded-[14px] backdrop-blur-xl transition-all border hover:-translate-y-0.5 ${tc.searchBoxBg} ${tc.searchBoxBorder} ${tc.buttonText} ${tc.buttonHoverBg}`}
                    title="Adicionar card"
                    aria-label="Adicionar card ao workspace"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      logic.setShowSettingsPanel(!logic.showSettingsPanel)
                    }
                    className={`flex items-center justify-center w-[42px] h-[42px] rounded-[14px] backdrop-blur-xl transition-all border hover:-translate-y-0.5 ${tc.searchBoxBg} ${tc.searchBoxBorder} ${tc.buttonText} ${tc.buttonHoverBg}`}
                    title="Configurações"
                    aria-label="Abrir configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {logic.showSettingsPanel && logic.activeEngineId === "workspace" ? (
                <SettingsPanel
                  tc={tc}
                  activeEngineId={logic.activeEngineId}
                  isMonochromeMode={logic.isMonochromeMode}
                  setIsMonochromeMode={logic.setIsMonochromeMode}
                  workspaceSearchFallback={logic.workspaceSearchFallback}
                  setWorkspaceSearchFallback={logic.setWorkspaceSearchFallback}
                  setShowSettingsPanel={logic.setShowSettingsPanel}
                />
              ) : logic.showSettingsPanel && logic.activeEngineId === "notes" ? (
                <NotesSettingsPanel
                  tc={tc}
                  notesSearchMode={logic.notesSearchMode}
                  setNotesSearchMode={logic.setNotesSearchMode}
                  noteSize={logic.noteSize}
                  setNoteSize={logic.setNoteSize}
                  setShowSettingsPanel={logic.setShowSettingsPanel}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {!logic.isAiMode && logic.activeEngineId === "workspace" && (
          <WorkspaceSection
            tc={tc}
            isMonochromeMode={logic.isMonochromeMode}
            filteredWorkspaceCards={filteredWorkspaceCards}
            setCardFormData={logic.setCardFormData}
            setEditingCardId={logic.setEditingCardId}
            setWorkspaceModalOpen={logic.setWorkspaceModalOpen}
            workspaceCards={logic.workspaceCards}
          />
        )}

        {!logic.isAiMode && logic.activeEngineId === "music" && (
          <MusicSection
            tc={tc}
            tracks={logic.musicTracks}
            setTracks={logic.setMusicTracks}
            musicInputError={logic.musicInputError}
          />
        )}

        {!logic.isAiMode && logic.activeEngineId === "notes" && (
          <NotesSection
            tc={tc}
            notes={logic.notes}
            setNotes={logic.setNotes}
            noteSize={logic.noteSize}
            filteredNotes={filteredNotes}
          />
        )}
      </motion.main>

      <AnimatePresence>
        {showNotesLimitAlert && logic.activeEngineId === "notes" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowNotesLimitAlert(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="notes-limit-title"
              aria-describedby="notes-limit-description"
              className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${tc.menuBg} ${tc.menuBorder}`}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="notes-limit-title" className={`text-sm font-semibold ${tc.text}`}>
                Termine uma nota antes de continuar
              </h2>
              <p id="notes-limit-description" className={`mt-2 text-sm leading-6 ${tc.buttonText}`}>
                Você já tem duas notas sem texto. Escreva em uma delas antes de adicionar outra.
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setShowNotesLimitAlert(false)}
                className={`mt-4 w-full rounded-lg py-2 text-xs font-medium transition-colors ${tc.settingsButtonBg} ${tc.settingsButtonHoverBg}`}
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModalsContainer
        tc={tc}
        workspaceModalOpen={logic.workspaceModalOpen}
        setWorkspaceModalOpen={logic.setWorkspaceModalOpen}
        cardFormData={logic.cardFormData}
        setCardFormData={logic.setCardFormData}
        workspaceCards={logic.workspaceCards}
        setWorkspaceCards={logic.setWorkspaceCards}
        editingCardId={logic.editingCardId}
        exportDataModalOpen={logic.exportDataModalOpen}
        setExportDataModalOpen={logic.setExportDataModalOpen}
        exportDataJson={logic.exportDataJson}
      />

      <style>{`
        :root { font-family: var(--app-font-family); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
