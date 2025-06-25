"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "./LanguageProvider";
import {
  getChecklist,
  toggleChecklist,
  getNick,
  LS_MODAL_SHOWN,
  setModalShownStatus,
} from "../utils/localStorage";
import ExportPreview from "./ExportPreview";
import PreviewModal from "./PreviewModal";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CircleCheckBig,
  X,
  ChevronUp,
  Text,
  Image,
  Info,
} from "lucide-react";
import Lily from "./Lily";
// import { motion, AnimatePresence } from "framer-motion";
import { InView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import InfoModal from "./InfoModal";
import ExportPreviewFlatGrid from "./ExportPreviewFlatGrid";
import ExportPreviewTextOnly from "./ExportPreviewTextOnly";
import { toPng } from "html-to-image";
import { scaleImageDataUrl } from "../utils/scaleImage";
import ExportPreviewPortal from "./ExportPreviewPortal";
import ExportPreviewHtmlModal from "./ExportPreviewHTMLModal";

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

  const previewRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"image" | "title">("image");
  const [infoOpen, setInfoOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const exportPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shown = localStorage.getItem(LS_MODAL_SHOWN);
    if (!shown) {
      setInfoOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    setModalShownStatus(true);
    setInfoOpen(false);
  };

  useEffect(() => {
    // Ini hanya jalan di client/browser
    setNickname(getNick());
  }, []);

  // const generatePreview = async () => {
  //   if (!previewRef.current) return alert("Preview not found");

  //   // Show loading toast
  //   const loadingToast = toast.loading("Generating preview...");

  //   // PASTIKAN font sudah ready
  //   await document.fonts.ready;

  //   // Tambah delay supaya font benar-benar ter-apply (kadang perlu di device lambat)
  //   await new Promise((r) => setTimeout(r, 150));

  //   const el = previewRef.current;

  //   // (Optional) Uji font di elemen preview, pastikan sudah font custom
  //   console.log(window.getComputedStyle(el).fontFamily);

  //   const { default: html2canvas } = await import("html2canvas");
  //   try {
  //     const canvas = await html2canvas(el, {
  //       useCORS: true,
  //       allowTaint: true,
  //       backgroundColor: null,
  //       scale: 1, // ganti ke 1.5 hanya jika memang butuh resolusi ekstra
  //       onclone: (doc) => {
  //         // Salin link atau style font dari head asli ke head clone
  //         const originLinks = document.querySelectorAll(
  //           'link[rel="stylesheet"], style'
  //         );
  //         originLinks.forEach((link) => {
  //           doc.head.appendChild(link.cloneNode(true));
  //         });
  //         // Optional: Set ulang font family langsung ke body clone
  //         doc.body.style.fontFamily = "'Noto Sans JP', 'sans-serif'";
  //       },
  //     });

  //     const url = canvas.toDataURL("image/png");
  //     setPreviewUrl(url);
  //     setShowModal(true);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Gagal membuat preview");
  //   } finally {
  //     toast.dismiss(loadingToast);
  //   }
  // };

  const generatePreview = async () => {
    if (!previewRef.current) return alert("Preview not found");

    const loadingToast = toast.loading(
      `${lang === "jp" ? "画像の作成中…" : "Generating image..."}`
    );

    // TIPS: Pastikan semua font sudah ready!
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 200));

    // Pakai html-to-image
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        // backgroundColor: "#fff", // opsional
        style: {
          fontFamily: "'Noto Sans JP', 'sans-serif'",
        },
      });
      const scaledUrl = await scaleImageDataUrl(dataUrl, 0.5);
      setPreviewUrl(scaledUrl);
      setShowModal(true);
      // } catch (err) {
      //   console.error("Failed to generate image.", err);
      //   toast.error(
      //     `${
      //       lang === "jp" ? "画像作成が完了しました" : "Failed to generate image."
      //     }`
      //   );
      // }
    } catch (err) {
      console.error("Failed to generate image.", err, JSON.stringify(err));
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unknown error");
      }
    } finally {
      toast.dismiss(loadingToast);
      toast.success(
        `${
          lang === "jp"
            ? "画像作成が完了しました。"
            : "Image successfully generated."
        }`
      );
    }
  };

  const handleExportDownload = async () => {
    if (!exportPreviewRef.current) return;
    setDownloading(true);
    const loadingToast = toast.loading(
      `${lang === "jp" ? "画像の作成中…" : "Generating image..."}`
    );
    await document.fonts.ready;
    try {
      // 1. Generate dataUrl dari HTML
      const dataUrl = await toPng(exportPreviewRef.current, {
        cacheBust: true,
        style: { fontFamily: "'Noto Sans JP', 'sans-serif'" },
      });

      // 2. Kecilkan skala hasil PNG
      const scaledUrl = await scaleImageDataUrl(dataUrl, 0.3); // Ganti 0.5 sesuai kebutuhan!

      // 3. Download
      const a = document.createElement("a");
      a.href = scaledUrl;
      // a.href = dataUrl;
      a.download = `yurinikki_${categoryRomaji}.png`;
      a.click();
      toast.success("Image downloaded!");
    } catch (e) {
      toast.error(
        `${
          lang === "jp"
            ? "画像作成が失敗しました。"
            : "Failed to generate image."
        }`
      );
      console.error(e);
    }
    setDownloading(false);
    toast.dismiss();
    toast.success(
      `${
        lang === "jp"
          ? "画像作成が完了しました。"
          : "Image successfully generated."
      }`
    );
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `yurinikki_${categoryRomaji}.png`;
    a.click();
  };

  return (
    <div className="relative px-4 pt-4 pb-12 sm:p-6 scroll-smooth ">
      <InfoModal isVisible={infoOpen} onClose={handleCloseModal} />
      {/* Modal yang akan tampil pertama kali */}
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
        <p className="text-wrap text-center mt-6 text-slate-500">
          {nickname && lang === "jp"
            ? `こんにちは、${nickname}!`
            : `Hello, ${nickname}!`}
        </p>
      </div>
      <div className="sticky top-0 bg-[#0b111d] z-10 p-4 mb-8 border-b-2 border-t-2">
        <div className="flex justify-between items-center w-full ">
          <div className="flex flex-col justify-between h-full gap-6">
            <button
              onClick={() => router.back()}
              className="inline-flex text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <ChevronLeft /> {t("back")}
            </button>
          </div>
          {/* Statistik */}
          <div className="">
            <div className="flex flex-col md:flex-row justify-center md:justify-end items-end md:items-center gap-2">
              <span className="md:pe-2 md:border-e-2 md:border-slate-800">
                {t("total")} : {works.length}
              </span>
              <span className="text-[#00c951] font-semibold">
                {t("checked")} : {checked.length}
              </span>
            </div>
            <div className="mt-4 flex gap-2 justify-end items-center">
              <button
                // onClick={() => {
                //   setPreviewMode("image");
                //   generatePreview();
                // }}

                onClick={() => {
                  setPreviewMode("image");
                  setShowExportModal(true);
                }}
                className="flex items-center justify-center text-sm gap-2 px-2 py-2 md:px-4 md:py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-all"
              >
                <Image />
                <span className="hidden md:block"> {t("preview")}</span>
              </button>
              <button
                // onClick={() => {
                //   setPreviewMode("title");
                //   generatePreview();
                // }}

                onClick={() => {
                  setPreviewMode("title");
                  setShowExportModal(true);
                }}
                className="flex items-center justify-center text-sm gap-2 px-2 py-2 md:px-4 md:py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-all"
              >
                <Text />
                <span className="hidden md:block"> {t("preview")}</span>
              </button>
              <button
                onClick={() => setInfoOpen(true)}
                className="flex items-center justify-center text-sm gap-2 px-2 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
              >
                <Info />
              </button>
            </div>
          </div>
        </div>
      </div>
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
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
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
                      className={`flex flex-col cursor-pointer rounded overflow-hidden border-2 hover:shadow-lg transition ${
                        inView
                          ? "opacity-100 transform translate-y-0"
                          : "opacity-0 transform translate-y-10"
                      }  ${
                        checked.includes(w.id)
                          ? "border-2 border-[#00c951]"
                          : "border"
                      } transition-all duration-700`}
                    >
                      <div className="relative">
                        {/* Gambar */}
                        <div className="aspect-2/3 w-full overflow-hidden">
                          <img
                            src={w.image}
                            alt={lang === "jp" ? w.name : w.romaji}
                            className={`w-full h-full object-cover transition-all ease-in select-none pointer-events-none ${
                              checked.includes(w.id)
                                ? "brightness-100"
                                : "brightness-40"
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
                      <div className="flex  justify-center items-center w-full h-full px-2 py-3 ">
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

      <div className="w-full flex items-center justify-center pt-4 px-2 mt-12 border-t">
        <div className="footer__info text-center">
          <p>
            百合日記 <span className="mx-2">|</span> Yuri Journal{" "}
            <span className="mx-2">|</span> yurinikki.vercel.app
          </p>
          <p>
            制作 <span className="mx-2">|</span>しゅうちゃん{" "}
            <span className="mx-2">||</span> テスター
            <span className="mx-2">|</span> Seno
          </p>
          <p></p>
        </div>
      </div>
      <ExportPreviewHtmlModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownload={handleExportDownload}
        downloading={downloading}
        previewRef={exportPreviewRef}
        width={1920}
        bgColor="#1d293d"
      >
        {/* <div data-export-preview id="preview-layout"> */}
        {previewMode === "image" ? (
          <ExportPreviewFlatGrid
            works={works}
            checked={checked}
            lang={lang}
            categoryName={categoryName}
            categoryRomaji={categoryRomaji}
            nickname={nickname ?? ""}
          />
        ) : (
          <ExportPreviewTextOnly
            works={works}
            checked={checked}
            lang={lang}
            categoryName={categoryName}
            categoryRomaji={categoryRomaji}
            nickname={nickname ?? ""}
          />
        )}
        {/* </div> */}
      </ExportPreviewHtmlModal>

      <PreviewModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onDownload={handleDownload}
        previewUrl={previewUrl}
      />
    </div>
  );
}
