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
  Instagram,
  Linkedin,
  Monitor,
  Moon,
  Palette,
  Settings,
  Info,
  Sun,
  Upload,
  Youtube,
  Play,
  Plus,
} from "lucide-react";
import { useAppLogic } from "./hooks/useAppLogic";
import { themeClasses, ThemePreference } from "./constants/themeClasses";
import { webEngines, otherEngines } from "./constants/engines";

// Sub-componentes modulares desacoplados
import { SettingsPanel } from "./components/SettingsPanel";
import { YouTubeSection } from "./components/YouTubeSection";
import { MusicSection } from "./components/MusicSection";
import { WorkspaceSection } from "./components/WorkspaceSection";
import { ModalsContainer } from "./components/ModalsContainer";
import VideoModal from "./components/VideoModal";

export default function App() {
  const logic = useAppLogic();
  const tc = themeClasses[logic.currentAppliedTheme];
  const [isCreditsSubmenuOpen, setIsCreditsSubmenuOpen] = React.useState(false);
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
  const isWebEngineSelected = webEngines.some(
    (engine) => engine.id === logic.activeEngineId,
  );
  const selectEngine = (engineId: string) => {
    logic.setActiveEngineId(engineId);
    logic.setIsAiMode(false);
    logic.setIsMenuOpen(false);
    logic.setIsSubmenuOpen(false);
    logic.setIsThemeSubmenuOpen(false);
    logic.setIsDataSubmenuOpen(false);
    setIsCreditsSubmenuOpen(false);
  };
  const isTouchInput = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const YoutubeTutorialContent = () => (
    <div
      className={`space-y-4 text-[0.85rem] sm:text-[0.9rem] leading-relaxed ${tc.text} opacity-90`}
    >
      <p>
        Para buscar e assistir vídeos diretamente no{" "}
        <strong>Search Mini</strong>, você precisa de uma chave de API gratuita
        do <strong>YouTube Data API v3</strong>.
      </p>
      <ol className="list-decimal list-inside space-y-2 ml-2">
        <li>
          Acesse o{" "}
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Google Cloud Console
          </a>
          .
        </li>
        <li>
          Crie um <strong>Novo Projeto</strong> ou selecione um existente.
        </li>
        <li>
          Acesse <strong>APIs & Serviços</strong> &gt;{" "}
          <strong>Biblioteca</strong>.
        </li>
        <li>
          Busque por <strong>YouTube Data API v3</strong> e clique em{" "}
          <strong>Ativar</strong>.
        </li>
        <li>
          Abra as <strong>Credenciais</strong>, clique em{" "}
          <strong>Criar Credenciais</strong> e escolha{" "}
          <strong>Chave de API</strong>.
        </li>
        <li>
          Copie a chave gerada e cole nas configurações (ícone de engrenagem).
        </li>
      </ol>
      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <Youtube className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Prefere um guia em vídeo?</h4>
          <a
            href="https://www.youtube.com/watch?v=tGJPSytMU5g"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600"
          >
            Assistir tutorial no YouTube <Play className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );

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

      <main className="flex flex-col items-center p-4 relative min-h-screen">
        <motion.div
          layout
          className={`w-full flex justify-center z-50 ${logic.activeEngineId === "youtube" || logic.activeEngineId === "workspace" || logic.activeEngineId === "music" ? "mt-12 sm:mt-20 mb-8" : "mt-[45vh] -translate-y-1/2 mb-0"}`}
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
                            <span className="flex min-w-0 flex-col items-start">
                              <span>Web</span>
                              {isWebEngineSelected && (
                                <span className="text-[0.68rem] opacity-55">
                                  {logic.currentActiveEngine.name}
                                </span>
                              )}
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
                  {logic.activeEngineId === "youtube" &&
                    logic.youtubeApiKey && (
                      <button
                        type="button"
                        onClick={() => logic.setYoutubeTutorialModalOpen(true)}
                        className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${tc.buttonText} ${tc.buttonHoverBg} opacity-60 hover:opacity-100`}
                        title="Ver API Tutorial"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                </div>
              </form>

              {(logic.activeEngineId === "youtube" ||
                logic.activeEngineId === "workspace") && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {logic.activeEngineId === "workspace" && (
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
                  )}

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
              {(logic.showSettingsPanel &&
                (logic.activeEngineId === "youtube" ||
                  logic.activeEngineId === "workspace")) ||
              (logic.activeEngineId === "youtube" && !logic.youtubeApiKey) ? (
                <SettingsPanel
                  tc={tc}
                  activeEngineId={logic.activeEngineId}
                  youtubeApiKey={logic.youtubeApiKey}
                  setYoutubeApiKey={logic.setYoutubeApiKey}
                  isAiMode={false}
                  isMonochromeMode={logic.isMonochromeMode}
                  setIsMonochromeMode={logic.setIsMonochromeMode}
                  workspaceSearchFallback={logic.workspaceSearchFallback}
                  setWorkspaceSearchFallback={logic.setWorkspaceSearchFallback}
                  setShowSettingsPanel={logic.setShowSettingsPanel}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {!logic.isAiMode &&
          logic.activeEngineId === "youtube" &&
          !logic.youtubeApiKey && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full max-w-2xl mt-6 p-6 sm:p-8 rounded-3xl border ${tc.settingsPanelBg} ${tc.settingsPanelBorder} shadow-xl`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${tc.text} flex items-center gap-3`}
              >
                <Info className="w-6 h-6 text-blue-500" /> Configuração do
                YouTube
              </h2>
              <YoutubeTutorialContent />
            </motion.div>
          )}

        {!logic.isAiMode && logic.activeEngineId === "youtube" && (
          <div className="w-full max-w-6xl mt-4">
            {!logic.youtubeApiKey ? (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
                <p className="font-semibold text-red-300">
                  YouTube não carregou
                </p>
                <p className="mt-1 text-red-100/90">
                  A propriedade <strong>youtubeApiKey</strong> está vazia ou não
                  foi carregada corretamente.
                </p>
                <p className="mt-2 text-red-100/80">
                  Abra a configuração do YouTube e cole a sua chave da API do
                  Google Cloud.
                </p>
              </div>
            ) : logic.youtubeStatus.type === "error" ? (
              <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                <p className="font-semibold text-amber-300">
                  Diagnóstico do YouTube
                </p>
                <p className="mt-1 text-amber-100/90">
                  {logic.youtubeStatus.message}
                </p>
                <p className="mt-2 text-amber-100/80">
                  {logic.youtubeStatus.details}
                </p>
              </div>
            ) : logic.youtubeStatus.type === "loading" ? (
              <div className="mb-4 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm">
                <p className="font-semibold text-blue-300">
                  Carregando vídeos...
                </p>
                <p className="mt-1 text-blue-100/90">
                  {logic.youtubeStatus.message}
                </p>
                <p className="mt-2 text-blue-100/80">
                  {logic.youtubeStatus.details}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {!logic.isAiMode &&
          logic.activeEngineId === "youtube" &&
          logic.youtubeApiKey &&
          (logic.hasPerformedSearch || logic.isViewingFeed) && (
            <YouTubeSection
              tc={tc}
              isMonochromeMode={logic.isMonochromeMode}
              currentAppliedTheme={logic.currentAppliedTheme}
              channelResultsList={logic.channelResultsList}
              videoResultsList={logic.videoResultsList}
              userSubscriptions={logic.userSubscriptions}
              isViewingFeed={logic.isViewingFeed}
              selectedChannelId={logic.selectedChannelId}
              isContentLoading={logic.isContentLoading}
              nextPageToken={logic.nextPageToken}
              handleChannelSelection={logic.handleChannelSelection}
              toggleChannelSubscription={logic.toggleChannelSubscription}
              setSelectedVideoId={logic.setSelectedVideoId}
              loadMoreVideos={logic.loadMoreVideos}
            />
          )}

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
      </main>

      <VideoModal
        selectedVideoId={logic.selectedVideoId}
        onClose={() => logic.setSelectedVideoId(null)}
      />

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
        youtubeTutorialModalOpen={logic.youtubeTutorialModalOpen}
        setYoutubeTutorialModalOpen={logic.setYoutubeTutorialModalOpen}
        YoutubeTutorialContent={YoutubeTutorialContent}
      />

      <style>{`
        :root { font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
