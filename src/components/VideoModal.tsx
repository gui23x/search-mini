import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoModalProps {
  selectedVideoId: string | null;
  onClose: () => void;
}

export default function VideoModal({
  selectedVideoId,
  onClose,
}: VideoModalProps) {
  return (
    <AnimatePresence>
      {selectedVideoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-8"
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />

          <div className="relative w-[min(92vw,1200px)]">
            <button
              type="button"
              aria-label="Fechar vídeo"
              onClick={onClose}
              className="absolute -top-16 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white/80 shadow-xl transition hover:scale-105 hover:bg-black hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="aspect-video w-full">
                <iframe
                  title="YouTube Video Player"
                  src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&playsinline=1&iv_load_policy=3&fs=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
