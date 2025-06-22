"use client";
import React, { ReactNode } from "react";
import { useTranslation } from "./LanguageProvider";
import { X } from "lucide-react";

interface PreviewModalProps {
  show: boolean;
  onClose: () => void;
  onDownload: () => void;
  previewUrl: string | null;
}

export default function PreviewModal({
  show,
  onClose,
  onDownload,
  previewUrl,
}: PreviewModalProps) {
  if (!show || !previewUrl) return null;
  const { lang, t } = useTranslation();

  return (
    <div
      className="fixed inset-0  flex items-center justify-center z-50 h-[100dvh]"
      onClick={onClose}
      style={{ background: "#00000078" }}
    >
      <div
        className="bg-slate-900 rounded-lg overflow-hidden w-11/12 max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-500 shrink-0">
          <h2 className="text-lg font-semibold">{t("preview")}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-500 transition-all"
          >
            <X />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="p-4 overflow-y-auto flex-1 scroll-smooth ">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto rounded"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-500 space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-500 rounded hover:bg-slate-600 transition-all font-semibold"
          >
            {t("close")}
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all font-semibold"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
