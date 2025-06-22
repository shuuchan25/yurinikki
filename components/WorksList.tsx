"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "./LanguageProvider";
import ExportPreview from "./ExportPreview";
import PreviewModal from "./PreviewModal";
import { getChecklist, toggleChecklist, getNick } from "../utils/localStorage";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleCheckBig, X, ChevronUp } from "lucide-react";
import Lily from "./Lily";
import { motion, AnimatePresence } from "framer-motion";
import { InView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import InfoModal from "./InfoModal";
import ExportPreviewFlatGrid from "./ExportPreviewFlatGrid";

import { fontWeight } from "html2canvas/dist/types/css/property-descriptors/font-weight";

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
  categoryName: string; // Nama Japanese
  categoryRomaji: string; // Nama Romaji
}

export default function WorksList({
  works,
  categoryId,
  categoryName,
  categoryRomaji,
}: Props) {
  const { lang, t } = useTranslation();
  const router = useRouter();

  // Group works by release year
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
  // const [showPreview, setShowPreview] = useState(false);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const nickname = getNick();

  // Generate preview (inline styles to avoid unsupported CSS funcs)
  // const generatePreview = async () => {
  //   // dynamic import
  //   const html2canvas = (await import("html2canvas")).default;
  //   const previewDiv = document.getElementById("preview-layout");
  //   if (!previewDiv) {
  //     alert("Preview element not found");
  //     return;
  //   }

  //   // tampilkan container (awalnya hidden via Tailwind)
  //   previewDiv.style.display = "block";

  //   // tunggu CSS (Tailwind) apply & gambar load
  //   await new Promise((r) => setTimeout(r, 200));
  //   const imgs = Array.from(previewDiv.querySelectorAll("img"));
  //   await Promise.all(
  //     imgs.map(
  //       (img) =>
  //         new Promise<void>((res) => {
  //           if ((img as HTMLImageElement).complete) return res();
  //           img.addEventListener("load", () => res());
  //           img.addEventListener("error", () => res());
  //         })
  //     )
  //   );

  //   try {
  //     const canvas = await html2canvas(previewDiv, {
  //       backgroundColor: null, // gunakan CSS background yang ada
  //       useCORS: true,
  //       allowTaint: false,
  //       windowWidth: previewDiv.scrollWidth,
  //       windowHeight: previewDiv.scrollHeight,
  //       scrollX: -window.scrollX,
  //       scrollY: -window.scrollY,
  //       onclone: (clonedDoc) => {
  //         // pastikan clone juga terlihat
  //         const cloned = clonedDoc.getElementById("preview-layout");
  //         if (cloned) cloned.style.display = "block";
  //       },
  //     });

  //     const url = canvas.toDataURL("image/png");
  //     setPreviewUrl(url);
  //     setShowPreview(true);
  //   } catch (err) {
  //     console.error("Preview error:", err);
  //     alert("Gagal membuat preview. Cek console.");
  //   } finally {
  //     // sembunyikan lagi
  //     previewDiv.style.display = "none";
  //   }
  // };
  // const generatePreview = async () => {
  //   if (!previewRef.current) return alert("Preview not found");

  //   // pastikan fonts dan images ready
  //   await document.fonts.ready;
  //   const el = previewRef.current;

  //   // tampilkan (override display:none)
  //   el.style.display = "block";

  //   // tunggu sejenak agar CSS eksternal ter-apply
  //   await new Promise((r) => setTimeout(r, 50));

  //   const { default: html2canvas } = await import("html2canvas");
  //   try {
  //     const canvas = await html2canvas(el, {
  //       useCORS: true,
  //       allowTaint: true, // <— ini
  //       backgroundColor: null, // pakai CSS background
  //       scale: 2, // <— optional untuk resolusi lebih tinggi
  //       onclone: (doc) => {
  //         // pastikan clone container juga tampil
  //         const clone = doc.querySelector("[data-export-preview]");
  //         if (clone) {
  //           (clone as HTMLElement).style.display = "block";
  //         }
  //       },
  //     });

  //     const url = canvas.toDataURL("image/png");
  //     setPreviewUrl(url);
  //     setShowModal(true);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Gagal membuat preview");
  //   } finally {
  //     // sembunyikan lagi
  //     el.style.display = "none";
  //   }
  // };
  const generatePreview = async () => {
    if (!previewRef.current) return alert("Preview not found");

    // Show loading toast
    const loadingToast = toast.loading("Generating preview...");
    console.log("Toast loading displayed");

    await document.fonts.ready;

    // Tidak perlu display = block/none lagi!
    const el = previewRef.current;

    // Tunggu sebentar jika perlu
    await new Promise((r) => setTimeout(r, 50));

    const { default: html2canvas } = await import("html2canvas");
    try {
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1.5,
        onclone: (doc) => {
          // optional: tidak perlu set display block
        },
      });

      const url = canvas.toDataURL("image/png");
      setPreviewUrl(url);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat preview");
    } finally {
      // Dismiss the loading toast after processing is complete
      toast.dismiss(loadingToast); // Dismissing the loading toast
    }
    // Tidak perlu display: none
  };

  // Download preview image
  const handleSave = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `preview_${categoryRomaji}.png`;
    a.click();
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `preview_${categoryRomaji}.png`;
    a.click();
  };

  return (
    <div className="relative p-4 sm:p-6 scroll-smooth ">
      <InfoModal /> {/* Modal yang akan tampil pertama kali */}
      <div className="fixed bottom-4 right-4 p-2 rounded-full bg-slate-200 text-slate-950 z-10">
        <a href="#top" className="">
          <ChevronUp />
        </a>
      </div>
      <div
        id="top"
        className="flex flex-col items-center justify-center w-full mb-6 gap-1"
      >
        <Lily className="w-[64px]" />
        <h1 className="text-xl font-bold text-center pb-2 border-b-2 mb-1 px-4">
          {t("appTitle")}
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          {lang === "jp" ? categoryName : categoryRomaji}
        </p>
        {/* Tampilkan nickname */}
        <p className="text-center text-sm text-slate-500">
          {nickname ? `Hello, ${nickname}!` : "Hello, Guest!"}
        </p>
      </div>
      {/* <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <Lily className="w-[64px]" />
          <div className="">
            <h1
              // className="app__title"
              className="text-xl font-bold  pb-2 border-b-2 border-slate-800 mb-2"
              style={{}}
            >
              {t("appTitle")}
            </h1>
            <p className="font-bold text-xl">
              {lang === "jp" ? categoryName : categoryRomaji}
            </p>
          </div>
        </div>
      </div> */}
      <div className="sticky top-0 bg-[#0b111d] z-10 p-4 mb-8 border-b-2 border-t-2">
        <div className="flex justify-between items-center w-full ">
          <button
            onClick={() => router.back()}
            className="inline-flex text-slate-400 hover:text-slate-200 transition-all"
          >
            <ChevronLeft /> {t("back")}
          </button>
          {/* Statistik */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end items-end md:items-center gap-2">
            <span className="md:pe-2 md:border-e-2 md:border-slate-800">
              {t("total")} : {works.length}
            </span>
            <span className="text-[#00c951] font-semibold">
              {t("checked")} : {checked.length}
            </span>
          </div>
          {/* Tombol Preview */}
          <div className="mt-6">
            <button
              onClick={generatePreview}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t("preview")}
            </button>
          </div>
        </div>
      </div>
      {/* Live listing */}
      {/* Live listing with scroll animation */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([year, items]) => (
          <div key={year}>
            <div className="w-full flex items-center gap-2 sm:gap-4">
              <h2 className="text-xl font-semibold mb-2">
                {lang === "jp" ? `${year}年` : year}
              </h2>
              <span className="flex-1 border border-slate-200 rounded-full"></span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
              {items.map((w) => (
                <InView
                  key={w.id}
                  triggerOnce={true} // Trigger animation once when entering the viewport
                  threshold={0.5} // Trigger when 50% of the item is in view
                >
                  {({ inView, ref }) => (
                    <div
                      ref={ref}
                      onClick={() => onToggle(w.id)}
                      className={`relative cursor-pointer rounded overflow-hidden border hover:shadow-lg transition ${
                        inView
                          ? "opacity-100 transform translate-y-0"
                          : "opacity-0 transform translate-y-10"
                      } transition-all duration-700`}
                    >
                      <div className="relative">
                        {/* Gambar */}
                        <div className="aspect-4/5 w-full overflow-hidden">
                          <img
                            src={w.image}
                            alt={lang === "jp" ? w.name : w.romaji}
                            className={`w-full h-full object-cover transition-all ease-in select-none pointer-events-none ${
                              checked.includes(w.id)
                                ? "brightness-100"
                                : "brightness-50"
                            }`}
                            draggable="false"
                          />
                        </div>

                        {/* Ikon checklist */}
                        <div
                          className={`absolute bottom-2 right-2 p-1 bg-slate-50 rounded-full transition ${
                            checked.includes(w.id)
                              ? "text-green-500"
                              : "text-slate-300"
                          }`}
                        >
                          <CircleCheckBig strokeWidth={3} size={20} />
                        </div>
                      </div>

                      {/* Nama */}
                      <div className="flex justify-center items-center w-full p-2 mt-1 ">
                        <p className="text-center text-xs sm:text-sm">
                          {lang === "jp" ? w.name : w.romaji}
                        </p>
                      </div>
                    </div>
                  )}
                </InView>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ExportPreview ref={previewRef}>
        {/* Hidden preview layout */}
        <div
          data-export-preview
          id="preview-layout"
          // className=" bg-[#1d293d] w-[1440px] h-[2048px] text-[#f9fafb] p-8"
        >
          <ExportPreviewFlatGrid
            works={works}
            checked={checked}
            lang={lang}
            categoryName={categoryName}
            categoryRomaji={categoryRomaji}
          />
        </div>
      </ExportPreview>
      {/* Modal Overlay */}
      {/* {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg overflow-hidden w-11/12 max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{t("preview")}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-600 hover:text-slate-400 transition-all"
              >
                <X />
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
      )} */}
      {/* Modal untuk preview + download */}
      <PreviewModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onDownload={handleDownload}
        previewUrl={previewUrl}
      />
    </div>
  );
}
