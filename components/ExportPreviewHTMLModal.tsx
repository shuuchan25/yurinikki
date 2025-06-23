"use client";
import React, { ReactNode, RefObject, useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "./LanguageProvider";

interface ExportPreviewHtmlModalProps {
  show: boolean;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
  previewRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  width?: number;
  bgColor?: string;
}

export default function ExportPreviewHtmlModal({
  show,
  onClose,
  onDownload,
  downloading,
  previewRef,
  children,
  width = 1920,
  bgColor = "#1d293d",
}: ExportPreviewHtmlModalProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);

  // Reset zoom setiap modal dibuka
  useEffect(() => {
    if (show) setZoom(1);
  }, [show]);

  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 h-[100dvh]"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-lg overflow-hidden w-[96vw] max-w-[1500px] max-h-[84vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-500">
          <h2 className="text-lg font-semibold">{t("preview")}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-100 transition-all"
          >
            <X />
          </button>
        </div>

        {/* Body: X/Y Scrollable, Zoom */}
        <div
          className="relative p-4 flex-1 bg-[#1d293d] overflow-auto"
          style={{
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <div
            className=""
            style={{
              display: "block",
              transform: `scale(${zoom})`,
              //   transform: `scale(0.3)`,
              transformOrigin: "top center",
              transition: "transform 0.15s cubic-bezier(.4,2,.7,1)",
            }}
          >
            <div
              ref={previewRef}
              style={{
                width: `${width}px`,
                background: bgColor,
                fontFamily: "'Noto Sans JP', 'sans-serif'",
                // JANGAN SET HEIGHT! Biar auto sesuai konten
              }}
              className="text-[#f9fafb] p-8"
            >
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-slate-500 space-x-2">
          {/* Zoom Controls */}
          <div className="flex gap-2 z-10">
            <button
              onClick={() =>
                setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))
              }
              className="px-2 rounded bg-slate-800 hover:bg-slate-700 text-white border"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => setZoom((z) => (z === 0.2 ? 1 : 0.2))}
              className="px-2 rounded bg-slate-800 hover:bg-slate-700 text-white border"
              title={zoom === 0.2 ? "Reset zoom" : "Minimize"} // Ubah juga judul (title) tooltipnya
            >
              {zoom === 0.2 ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() =>
                setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))))
              }
              className="px-2 rounded bg-slate-800 hover:bg-slate-700 text-white border"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            {/* <button
              onClick={() => setZoom(1)}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white border"
              title="Reset zoom"
            >
              <Maximize2 size={18} />
            </button> */}
          </div>
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-500 rounded hover:bg-slate-600 transition-all font-semibold"
            >
              {t("close")}
            </button>
            <button
              onClick={onDownload}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all font-semibold ${
                downloading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={downloading}
            >
              {downloading ? t("generating") : t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
