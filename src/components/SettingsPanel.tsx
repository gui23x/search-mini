import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface SettingsPanelProps {
  tc: any;
  activeEngineId: string;
  isMonochromeMode: boolean;
  setIsMonochromeMode: (val: boolean) => void;
  workspaceSearchFallback: boolean;
  setWorkspaceSearchFallback: (val: boolean) => void;
  setShowSettingsPanel: (val: boolean) => void;
}

/**
 * Painel expansível de configurações globais e API keys
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  tc,
  activeEngineId,
  isMonochromeMode,
  setIsMonochromeMode,
  workspaceSearchFallback,
  setWorkspaceSearchFallback,
  setShowSettingsPanel,
}) => {
  return (
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
        className={`rounded-xl p-4 backdrop-blur-md space-y-4 ${tc.settingsPanelBg} ${tc.settingsPanelBorder}`}
      >
        <div className="flex items-center justify-between">
          <label
            className={`text-[10px] font-semibold ${tc.settingsLabelText}`}
          >
            Modo Monocromático
          </label>
          <button
            onClick={() => setIsMonochromeMode(!isMonochromeMode)}
            className={`w-8 h-4 rounded-full transition-colors relative ${isMonochromeMode ? tc.settingsToggleBgOn : tc.settingsToggleBgOff}`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 rounded-full ${tc.settingsToggleCircleBg} transition-all ${isMonochromeMode ? "left-[17px]" : "left-0.5"}`}
            />
          </button>
        </div>

        {activeEngineId === "workspace" && (
          <div
            className={`flex items-center justify-between pt-2 border-t ${tc.settingsDivider}`}
          >
            <label
              className={`text-[10px] font-semibold ${tc.settingsLabelText}`}
            >
              Funcionar como Busca
            </label>
            <button
              onClick={() =>
                setWorkspaceSearchFallback(!workspaceSearchFallback)
              }
              className={`w-8 h-4 rounded-full transition-colors relative ${workspaceSearchFallback ? tc.settingsToggleBgOn : tc.settingsToggleBgOff}`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full ${tc.settingsToggleCircleBg} transition-all ${workspaceSearchFallback ? "left-[17px]" : "left-0.5"}`}
              />
            </button>
          </div>
        )}

        <button
          onClick={() => setShowSettingsPanel(false)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-medium transition-colors ${tc.settingsButtonBg} ${tc.settingsButtonHoverBg}`}
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Fechar configurações
        </button>
      </div>
    </motion.div>
  );
};
