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

export default function ExportPreviewFlatGridFilled({
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

  const columns = 14; // jumlah kolom per baris
  const totalItems = sorted.length;

  // Bagi dua, lalu bulatkan ke kelipatan columns terdekat, tapi tidak lebih dari totalItems
  const approxHalf = totalItems / 2;
  const topItemsCount = Math.min(
    Math.round(approxHalf / columns) * columns,
    totalItems
  );
  const bottomItemsCount = totalItems - topItemsCount;

  // Bagi item sesuai hasil pembulatan
  const topItems = sorted.slice(0, topItemsCount); // Atas
  const bottomItems = sorted.slice(topItemsCount); // Bawah

  let elements: React.ReactNode[] = [];

  // 1. Grid atas
  elements.push(
    <div className="grid grid-cols-14 gap-1" key="top-items">
      {topItems.map((w) => (
        <div
          key={w.id}
          className={`flex flex-col items-center relative rounded overflow-hidden hover:shadow-lg transition select-none ${
            checked.includes(w.id)
              ? "border-2 border-[#00c951]"
              : "border border-[#0f172b]"
          }`}
        >
          <div className="relative aspect-2/3 w-full h-full overflow-hidden">
            <img
              src={w.image}
              alt={lang === "jp" ? w.name : w.romaji}
              className="preview__cover select-none pointer-events-none"
              draggable="false"
              loading="lazy"
            />
            {!checked.includes(w.id) && (
              <div className="absolute inset-0 bg-black opacity-70 pointer-events-none"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // 2. Konten tengah
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
            {/* <h1 className="nickname">{nickname}</h1> */}
            <h1 className="sentence">
              {" "}
              {lang === "jp"
                ? `これまでに${nickname}が観てきた百合アニメ`
                : `Yuri Anime ${nickname} has watched`}
            </h1>
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
    <div className="grid grid-cols-14 gap-1" key="bottom-items">
      {bottomItems.map((w) => (
        <div
          key={w.id}
          className={`flex flex-col items-center relative rounded overflow-hidden hover:shadow-lg transition select-none ${
            checked.includes(w.id)
              ? "border-2 border-[#00c951]"
              : "border border-[#0f172b]"
          }`}
        >
          <div className="relative aspect-2/3 w-full h-full overflow-hidden">
            <img
              src={w.image}
              alt={lang === "jp" ? w.name : w.romaji}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable="false"
              loading="lazy"
            />
            {!checked.includes(w.id) && (
              <div className="absolute inset-0 bg-black opacity-70 pointer-events-none"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // 4. Footer info
  elements.push();

  return <div>{elements}</div>;
}
