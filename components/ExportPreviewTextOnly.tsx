import React from "react";
import { useTranslation } from "./LanguageProvider";
import Lily from "./Lily";

interface Work {
  id: number;
  name: string;
  romaji: string;
  releaseYear: number;
  image: string;
}

interface Props {
  works: Work[];
  checked: number[];
  lang: string;
  categoryName: string;
  categoryRomaji: string;
  nickname: string;
}

export default function ExportPreviewFlatGridTextOnly({
  works,
  checked,
  lang,
  categoryName,
  categoryRomaji,
  nickname,
}: Props) {
  const { t } = useTranslation();
  const sorted = [...works].sort(
    (a, b) => a.releaseYear - b.releaseYear || a.id - b.id
  );

  const columns = 12; // jumlah kolom per baris
  const totalItems = sorted.length;

  // Bagi dua, bulatkan ke kelipatan columns terdekat
  const approxHalf = totalItems / 2;
  const topItemsCount = Math.min(
    Math.round(approxHalf / columns) * columns,
    totalItems
  );
  const topItems = sorted.slice(0, topItemsCount);
  const bottomItems = sorted.slice(topItemsCount);

  let elements: React.ReactNode[] = [];

  // 1. Grid atas
  elements.push(
    <div
      className="preview__item__wrapper grid grid-cols-12  "
      key="top-items-text"
    >
      {topItems.map((w) => (
        <div
          key={w.id}
          className={`preview__item overflow-hidden
        ${
          checked.includes(w.id)
            ? "border border-[#0f172b] bg-[#00c951]"
            : "border border-[#0f172b] bg-[#ffffff]"
        }`}
          // Tidak perlu style height apapun!
        >
          <p className="w-full text-center break-words whitespace-normal my-auto line-clamp-3">
            {lang === "jp" ? w.name : w.romaji}
          </p>
        </div>
      ))}
    </div>
  );

  // 2. Konten tengah (copy dari template gambar)
  // elements.push(
  //   <div
  //     key="middle-content"
  //     className="middle__content w-full flex justify-center items-center text-center px-8 py-12"
  //     style={{ gridColumn: "span 18" }}
  //   >
  //     <div className="w-full flex flex-col items-center">
  //       <div className="pb-4 mb-8 border-b-4">
  //         <div className="flex justify-center items-center gap-6">
  //           <Lily className="w-18" />
  //           <div>
  //             <h1 className="app__title">
  //               {t("appTitle")}{" "}
  //               <span className="font-bold text-2xl">
  //                 ({lang === "jp" ? categoryName : categoryRomaji})
  //               </span>
  //             </h1>
  //           </div>
  //         </div>
  //         <div className="flex justify-center items-center">
  //           <h1 className="yurinohi">{t("yurinohi")}</h1>
  //           <h2 className="year__span">{lang === "jp" ? "2025年" : "2025"}</h2>
  //         </div>
  //       </div>
  //       <div>
  //         <div className="flex flex-col items-center">
  //           <h1 className="nickname">{nickname}</h1>
  //           <h1 className="sentence">{t("previewSentence")}</h1>
  //           <p className="text-[#ff2056] text-[72px] font-bold">
  //             {lang === "jp"
  //               ? `${checked.length}件 / `
  //               : `${checked.length} / `}
  //             <span className="text-[42px]">
  //               {lang === "jp" ? `全${works.length}件` : works.length}
  //             </span>
  //           </p>
  //         </div>
  //       </div>
  //       <div
  //         key="footer"
  //         className="flex justify-center items-center text-center p-2 mt-12"
  //         style={{ gridColumn: "span 18" }}
  //       >
  //         <div className="footer__info">
  //           <p>百合日記 || yurinikki.vercel.app</p>
  //           {/* <p>制作 || しゅうちゃん</p> */}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // 2. Konten tengah (copy dari template gambar)
  elements.push(
    <div
      key="middle-content"
      className="middle__content w-full flex justify-center items-center text-center px-8 py-12"
      style={{ gridColumn: "span 18" }}
    >
      <div className="w-full flex flex-col items-center">
        <div className="pb-4 mb-8 border-b-4">
          <div className="flex justify-center items-center gap-6">
            <Lily className="w-18" />
            <div>
              <h1 className="app__title">
                {t("appTitle")}{" "}
                <span className="font-bold text-2xl">
                  ({lang === "jp" ? categoryName : categoryRomaji})
                </span>
              </h1>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <h1 className="yurinohi">{t("yurinohi")}</h1>
            <h2 className="year__span">{lang === "jp" ? "2025年" : "2025"}</h2>
          </div>
        </div>
        <div>
          <div className="flex flex-col items-center">
            <h1 className="nickname">{nickname}</h1>
            <h1 className="sentence">{t("previewSentence")}</h1>
            <p className="text-[#ff2056] text-[72px] font-bold">
              {lang === "jp"
                ? `${checked.length}件 / `
                : `${checked.length} / `}
              <span className="text-[42px]">
                {lang === "jp" ? `全${works.length}件` : works.length}
              </span>
            </p>
          </div>
        </div>
        <div
          key="footer"
          className="flex justify-center items-center text-center p-2 mt-12"
          style={{ gridColumn: "span 18" }}
        >
          <div className="footer__info">
            <p>百合日記 || yurinikki.vercel.app</p>
            {/* <p>制作 || しゅうちゃん</p> */}
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Grid bawah
  elements.push(
    <div
      className="preview__item__wrapper grid grid-cols-12 gap-"
      key="bottom-items-text"
    >
      {bottomItems.map((w) => (
        <div
          key={w.id}
          className={`preview__item
          ${
            checked.includes(w.id)
              ? "border border-[#0f172b] bg-[#00c951]"
              : // : "border border-[#0f172b] bg-[#111827]"
                "border border-[#0f172b] bg-[#ffffff]"
          }`}
          // Tidak perlu style height apapun!
        >
          <p className="w-full text-center break-words whitespace-normal my-auto line-clamp-4 leading-tight">
            {lang === "jp" ? w.name : w.romaji}
          </p>
        </div>
      ))}
    </div>
  );

  return <div>{elements}</div>;
}
