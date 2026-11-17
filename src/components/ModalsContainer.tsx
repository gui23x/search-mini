import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Upload } from "lucide-react";
import { WorkspaceCard, WorkspaceCardFormData } from "../types";
import { ThemePreference } from "../constants/themeClasses";

interface ModalsContainerProps {
  tc: any;
  currentAppliedTheme: Exclude<ThemePreference, "system">;
  workspaceModalOpen: boolean;
  setWorkspaceModalOpen: (val: boolean) => void;
  cardFormData: WorkspaceCardFormData;
  setCardFormData: React.Dispatch<React.SetStateAction<WorkspaceCardFormData>>;
  workspaceCards: WorkspaceCard[];
  setWorkspaceCards: React.Dispatch<React.SetStateAction<WorkspaceCard[]>>;
  editingCardId: string | null;
  exportDataModalOpen: boolean;
  setExportDataModalOpen: (val: boolean) => void;
  exportDataJson: string;
}

/**
 * Agrupamento de modais auxiliares para manter a estrutura do App.tsx simplificada
 */
export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  tc,
  currentAppliedTheme,
  workspaceModalOpen,
  setWorkspaceModalOpen,
  cardFormData,
  setCardFormData,
  workspaceCards,
  setWorkspaceCards,
  editingCardId,
  exportDataModalOpen,
  setExportDataModalOpen,
  exportDataJson,
}) => {
  const [imageUploadError, setImageUploadError] = useState("");
  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "imageLight" | "imageDark",
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageUploadError("A imagem deve ter no máximo 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageUploadError("Não foi possível ler esta imagem.");
        return;
      }
      const imageData = reader.result;
      setCardFormData((previous) =>
        field === "image"
          ? { ...previous, image: imageData, imageLight: "", imageDark: "" }
          : { ...previous, image: "", [field]: imageData },
      );
      setImageUploadError("");
    };
    reader.onerror = () => setImageUploadError("Não foi possível ler esta imagem.");
    reader.readAsDataURL(file);
  };
  const isLightTheme = currentAppliedTheme === "light" || currentAppliedTheme === "pastel";
  const toggleDynamicImages = () => {
    setCardFormData((previous) => {
      if (previous.dynamicImages) {
        const activeThemeImage = isLightTheme
          ? previous.imageLight || previous.imageDark
          : previous.imageDark || previous.imageLight;
        return {
          ...previous,
          dynamicImages: false,
          image: activeThemeImage || previous.image,
        };
      }

      const currentImage = previous.image || previous.imageLight || previous.imageDark;
      return {
        ...previous,
        dynamicImages: true,
        image: "",
        imageLight: previous.imageLight || currentImage,
        imageDark: previous.imageDark || currentImage,
      };
    });
  };

  return (
    <>
      <AnimatePresence>
        {workspaceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setWorkspaceModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl ${tc.menuBg} ${tc.menuBorder}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-lg font-bold mb-4 ${tc.text}`}>
                {editingCardId ? "Configurar Card" : "Adicionar página"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    value={cardFormData.title}
                    onChange={(e) =>
                      setCardFormData({
                        ...cardFormData,
                        title: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                  >
                    URL do Site
                  </label>
                  <input
                    type="text"
                    value={cardFormData.url}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, url: e.target.value })
                    }
                    onBlur={() => {
                      if (!cardFormData.icon && cardFormData.url) {
                        try {
                          let chk = cardFormData.url.startsWith("http")
                            ? cardFormData.url
                            : "https://" + cardFormData.url;
                          setCardFormData((p) => ({
                            ...p,
                            icon: `https://www.google.com/s2/favicons?domain=${new URL(chk).hostname}&sz=128`,
                          }));
                        } catch {}
                      }
                    }}
                    placeholder="https://..."
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                  />
                  <p className={`mt-1 text-[10px] ${tc.settingsLabelText}`}>
                    Links de pins do Pinterest (/pin/ID) também exibem uma prévia.
                  </p>
                </div>
                <div>
                  <label
                    className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                  >
                    Ícone (URL)
                  </label>
                  <input
                    type="text"
                    value={cardFormData.icon}
                    onChange={(e) =>
                      setCardFormData({ ...cardFormData, icon: e.target.value })
                    }
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-xs font-medium ${tc.text}`}>Modo Dinâmico</p>
                    <p className={`mt-1 text-[10px] ${tc.settingsLabelText}`}>
                      Usar uma imagem diferente em cada tema
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label="Ativar Modo Dinâmico de imagens"
                    aria-checked={cardFormData.dynamicImages}
                    onClick={toggleDynamicImages}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${cardFormData.dynamicImages ? tc.settingsToggleBgOn : tc.settingsToggleBgOff}`}
                  >
                    <span
                      className={`absolute top-1 h-3 w-3 rounded-full ${tc.settingsToggleCircleBg} transition-all ${cardFormData.dynamicImages ? "left-[21px]" : "left-1"}`}
                    />
                  </button>
                </div>
                {cardFormData.dynamicImages ? (
                  <>
                    <div className="space-y-3">
                      <label
                        className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                      >
                        Imagem para tema claro/pastel
                      </label>
                      <input
                        type="text"
                        value={cardFormData.imageLight}
                        onChange={(e) =>
                          setCardFormData((previous) => ({
                            ...previous,
                            image: "",
                            imageLight: e.target.value,
                          }))
                        }
                        placeholder="https://... ou importe do computador"
                        className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Importar imagem para tema claro/pastel"
                          onChange={(event) => handleImageFileChange(event, "imageLight")}
                          className="peer sr-only"
                          id="workspace-image-light"
                        />
                        <label
                          htmlFor="workspace-image-light"
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs peer-focus-visible:outline peer-focus-visible:outline-2 ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Importar imagem do computador
                        </label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label
                        className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                      >
                        Imagem para tema escuro/preto
                      </label>
                      <input
                        type="text"
                        value={cardFormData.imageDark}
                        onChange={(e) =>
                          setCardFormData((previous) => ({
                            ...previous,
                            image: "",
                            imageDark: e.target.value,
                          }))
                        }
                        placeholder="https://... ou importe do computador"
                        className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Importar imagem para tema escuro/preto"
                          onChange={(event) => handleImageFileChange(event, "imageDark")}
                          className="peer sr-only"
                          id="workspace-image-dark"
                        />
                        <label
                          htmlFor="workspace-image-dark"
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs peer-focus-visible:outline peer-focus-visible:outline-2 ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Importar imagem do computador
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <label
                      className={`block text-[10px] font-semibold mb-1.5 tracking-wider ${tc.settingsLabelText}`}
                    >
                      Imagem (URL)
                    </label>
                    <input
                      type="text"
                      value={cardFormData.image}
                      onChange={(e) =>
                        setCardFormData((previous) => ({
                          ...previous,
                          image: e.target.value,
                          imageLight: "",
                          imageDark: "",
                        }))
                      }
                      placeholder="https://..."
                      className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="Importar imagem do computador"
                        onChange={(event) => handleImageFileChange(event, "image")}
                        className="peer sr-only"
                        id="workspace-image"
                      />
                      <label
                        htmlFor="workspace-image"
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs peer-focus-visible:outline peer-focus-visible:outline-2 ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Importar imagem do computador
                      </label>
                    </div>
                  </div>
                )}
                <p className={`text-[10px] ${tc.settingsLabelText}`}>
                  Imagens PNG, JPG ou WebP de até 1 MB ficam salvas neste navegador.
                </p>
                {imageUploadError && (
                  <p role="alert" className="text-xs text-red-500">
                    {imageUploadError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                {editingCardId && (
                  <button
                    onClick={() => {
                      setWorkspaceCards(
                        workspaceCards.filter((c) => c.id !== editingCardId),
                      );
                      setWorkspaceModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Remover
                  </button>
                )}
                <button
                  onClick={() => setWorkspaceModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const finalCard: WorkspaceCard = {
                      ...cardFormData,
                      id: editingCardId ?? Date.now().toString(),
                      title: cardFormData.title?.trim() || "Novo Card",
                    };

                    if (editingCardId) {
                      setWorkspaceCards(
                        workspaceCards.map((c) =>
                          c.id === editingCardId ? { ...c, ...finalCard } : c,
                        ),
                      );
                    } else {
                      setWorkspaceCards([...workspaceCards, finalCard]);
                    }

                    setWorkspaceModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportDataModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setExportDataModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl ${tc.menuBg} ${tc.menuBorder}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-lg font-bold mb-4 ${tc.text}`}>
                Exportar Dados
              </h2>
              <textarea
                value={exportDataJson}
                readOnly
                className={`w-full h-64 rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none font-mono ${tc.settingsInputBg} ${tc.settingsInputBorder} ${tc.settingsInputFocusBorder} ${tc.text}`}
              />
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => {
                    const blob = new Blob([exportDataJson], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "search-mini-backup.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                  className="p-2.5 rounded-lg text-xs font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-colors flex items-center justify-center"
                  title="Baixar backup JSON"
                  aria-label="Baixar backup JSON"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(exportDataJson)
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-medium ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => setExportDataModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium ${tc.buttonText} ${tc.buttonHoverBg} transition-colors`}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
};
