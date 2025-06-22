"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "./LanguageProvider";
import { getChecklist, toggleChecklist } from "../utils/localStorage";
import { useRouter } from "next/navigation";

interface Work {
  id: number;
  name: string;
  romaji: string;
  releaseYear: number;
  image: string;
}
interface Props {
  works: Work[];
  categoryId: number;
}

export default function WorksList({ works, categoryId }: Props) {
  const { lang, t } = useTranslation();
  const router = useRouter();

  // Group by year
  const grouped = works.reduce<Record<number, Work[]>>((acc, w) => {
    (acc[w.releaseYear] ||= []).push(w);
    return acc;
  }, {});

  // Checklist state
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    setChecked(getChecklist(categoryId));
  }, [categoryId]);
  const onToggle = (id: number) => {
    setChecked(toggleChecklist(categoryId, id));
  };

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview
  const generatePreview = async () => {
    // dynamic-import supaya hanya di browser
    const html2canvas = (await import("html2canvas")).default;
    const previewDiv = document.getElementById("preview-layout");
    if (!previewDiv) {
      alert("Preview element not found");
      return;
    }

    // tampilkan dan set ukuran
    previewDiv.style.display = "block";
    previewDiv.style.width = "800px";
    previewDiv.style.padding = "20px";
    previewDiv.style.background = "#fff";

    // tunggu rendering gambar dan style
    await new Promise((r) => setTimeout(r, 100));

    // tunggu setiap img selesai load
    const imgs = Array.from(previewDiv.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if ((img as HTMLImageElement).complete) return resolve();
            img.addEventListener("load", () => resolve());
            img.addEventListener("error", () => resolve());
          })
      )
    );

    try {
      const canvas = await html2canvas(previewDiv, {
        backgroundColor: "#fff",
        useCORS: true,
        allowTaint: false,
      });
      setPreviewUrl(canvas.toDataURL("image/png"));
      setShowPreview(true);
    } catch (err) {
      console.error("Preview error:", err);
      alert("Gagal membuat preview. Cek console.");
    } finally {
      previewDiv.style.display = "none";
    }
  };

  // Download preview
  const handleSave = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `hobby-checklist-${categoryId}.png`;
    a.click();
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← {t("back")}
      </button>

      {/* Statistik */}
      <div className="mb-4 flex justify-between">
        <span>
          {t("total")}: {works.length}
        </span>
        <span>
          {t("checked")}: {checked.length}
        </span>
      </div>

      {/* Live listing */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([year, items]) => (
          <div key={year}>
            <h2 className="text-xl font-semibold mb-2">{year}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {items.map((w) => (
                <div key={w.id} className="relative">
                  <img
                    src={w.image}
                    alt={lang === "jp" ? w.name : w.romaji}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => onToggle(w.id)}
                    className={`absolute top-2 right-2 p-1 bg-white rounded-full transition ${
                      checked.includes(w.id)
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  >
                    ✓
                  </button>
                  <p className="mt-1 text-center text-sm">
                    {lang === "jp" ? w.name : w.romaji}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden preview layout */}
      <div id="preview-layout" className="hidden">
        <h1 className="text-2xl font-bold text-center mb-4">{t("appTitle")}</h1>
        <p className="text-center mb-2">
          {t("category")}: {categoryId}
        </p>
        <p className="text-center mb-6">
          {t("total")}: {works.length} • {t("checked")}: {checked.length}
        </p>
        <div className="space-y-6">
          {Object.entries(grouped).map(([year, items]) => (
            <div key={year}>
              <h3 className="text-lg font-semibold">{year}</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {items.map((w) => (
                  <div
                    key={w.id}
                    className="w-1/4 flex flex-col items-center text-center"
                  >
                    <img
                      src={w.image}
                      className="w-full h-20 object-cover rounded"
                      alt=""
                    />
                    {checked.includes(w.id) && (
                      <span className="text-green-600 mt-1">✔</span>
                    )}
                    <span className="text-xs mt-1">
                      {lang === "jp" ? w.name : w.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview button */}
      <button
        onClick={generatePreview}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {t("preview")}
      </button>

      {/* Modal overlay */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden w-11/12 max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded"
              />
            </div>
            <div className="flex justify-end p-4 border-t space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("save")}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
