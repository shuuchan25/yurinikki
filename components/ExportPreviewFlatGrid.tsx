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

interface Category {
  name: string;
  romaji: string;
}

interface Props {
  works: Work[];
  checked: number[];
  lang: string;
  categoryName: string; // Menambahkan categoryName
  categoryRomaji: string; // Menambahkan categoryRomaji
}

export default function ExportPreviewFlatGridFilled({
  works,
  checked,
  lang,
  categoryName, // Mendapatkan categoryName dari props
  categoryRomaji, // Mendapatkan categoryRomaji dari props
}: Props) {
  const { t } = useTranslation();
  const sorted = [...works].sort(
    (a, b) => a.releaseYear - b.releaseYear || a.id - b.id
  );

  const columns = 18; // 12 grid per baris
  const totalItems = sorted.length;

  // Menentukan jumlah item untuk topItems dan bottomItems secara dinamis
  const topItemsCount = Math.floor(totalItems / 2); // topItems 60 item
  const bottomItemsCount = totalItems - topItemsCount; // bottomItems 64 item

  // Bagikan item berdasarkan jumlah yang dihitung
  let topItems = sorted.slice(0, topItemsCount); // 60 item pertama
  let bottomItems = sorted.slice(topItemsCount); // Sisa item ke bottomItems

  let elements: React.ReactNode[] = [];

  // 1. Grid atas: 60 item (grid-cols-12, 5 baris penuh, sisa 2 item)
  elements.push(
    <div className="grid grid-cols-18 gap-1" key="top-items">
      {topItems.map((w, index) => (
        <div
          key={w.id}
          className={`flex flex-col items-center relative rounded overflow-hidden hover:shadow-lg transition select-none ${
            checked.includes(w.id)
              ? "border-2 border-[#00c951]"
              : "border border-[#0f172b]"
          }`}
        >
          <div className="relative aspect-2/3 w-full overflow-hidden">
            <img
              src={w.image}
              alt={lang === "jp" ? w.name : w.romaji}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable="false"
            />
            {!checked.includes(w.id) && (
              <div className="absolute inset-0 bg-black opacity-70 pointer-events-none"></div>
            )}
          </div>
          {/* <div className="flex justify-center items-center w-full px-2 py-1 mt-1 bg-[#1d293d]">
            <p className="text-center text-xs">
              {lang === "jp" ? w.name : w.romaji}
            </p>
          </div> */}
        </div>
      ))}
    </div>
  );

  // 2. Konten di tengah (antara bagian atas dan bawah)
  elements.push(
    <div
      key="middle-content"
      className="middle__content w-full flex justify-center items-center text-center p-8"
      style={{ gridColumn: "span 12" }} // Memastikan konten ini memenuhi satu baris penuh
    >
      {/* Judul & kategori */}
      <div className="w-full flex flex-col items-center  ">
        <div className="pb-8 mb-8 border-b-4">
          <div className="flex justify-center items-center gap-6">
            <Lily className="w-18" />
            <div>
              <h1 className="app__title">
                {t("appTitle")}{" "}
                <span className="font-bold text-xl">
                  {lang === "jp" ? categoryName : categoryRomaji}
                </span>
              </h1>
            </div>
          </div>
          <h1 className="yurinohi ">
            百合の日<span className="year__span">2025年</span>
          </h1>
        </div>
        <div className="">
          <div className="flex flex-col items-center">
            <h1 className="text-[22px] font-bold mb-4">
              今まで見た百合のあるアニメ
            </h1>

            <p className="text-[#00c951] text-[52px] font-bold">
              {checked.length}件 /
              <span className="text-[24px]">全{works.length}件</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Grid bawah: 64 item (item sisa)
  elements.push(
    <div className="grid grid-cols-18 gap-2" key="bottom-items">
      {bottomItems.map((w) => (
        <div
          key={w.id}
          className={`flex flex-col items-center relative rounded overflow-hidden hover:shadow-lg transition select-none ${
            checked.includes(w.id)
              ? "border-2 border-[#00c951]"
              : "border border-[#cad5e2]"
          }`}
        >
          <div className="relative aspect-2/3 w-full overflow-hidden">
            <img
              src={w.image}
              alt={lang === "jp" ? w.name : w.romaji}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable="false"
            />
            {!checked.includes(w.id) && (
              <div className="absolute inset-0 bg-black opacity-70 pointer-events-none"></div>
            )}
          </div>
          {/* <div className="flex justify-center items-center w-full px-2 py-1 mt-1 bg-[#1d293d]">
            <p className="text-center text-xs">
              {lang === "jp" ? w.name : w.romaji}
            </p>
          </div> */}
        </div>
      ))}
    </div>
  );

  elements.push(
    <div
      key=""
      className="flex justify-center items-center text-center p-2 mt-4"
      style={{ gridColumn: "span 12" }} // Memastikan konten ini memenuhi satu baris penuh
    >
      <div className="footer__info">
        <p className="">
          百合日記
          <span className="yurinikki__url">yurinikki.vercel.app</span>
        </p>
        <p className="">
          制作
          <span className="yurinikki__creator">しゅうちゃん</span>
        </p>
      </div>
      <div></div>
    </div>
  );

  return <div>{elements}</div>;
}
