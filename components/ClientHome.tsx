"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNick, setNick } from "../utils/localStorage";
import { useTranslation } from "./LanguageProvider";
import Lily from "./Lily";

type Category = { id: number; name: string; romaji: string };

export default function ClientHome({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { t, lang, switchLang } = useTranslation();
  const [nick, setNickState] = useState("");
  const [cat, setCat] = useState<number>(categories[0]?.id || 0);

  useEffect(() => {
    // Load saved nickname
    const saved = getNick();
    setNickState(saved);
  }, []);

  const handleStart = () => {
    // Save nickname and proceed
    setNick(nick);
    router.push(`/works/${cat}`);
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-2">
      <div className="flex flex-col items-center justify-center gap-2">
        <Lily className="w-28" />
        <h1 className="text-3xl font-extrabold text-center mb-6">
          {t("appTitle")}
        </h1>
      </div>
      <div className="p-8 rounded-3xl shadow-xl w-full max-w-lg bg-slate-800 border-t-4 border-rose-600">
        {/* Language Switch Buttons */}
        <div className="flex justify-center mb-4 space-x-2">
          <button
            onClick={() => switchLang("en")}
            className={`px-4 py-2 rounded ${
              lang === "en" ? "bg-indigo-600 text-white" : "bg-slate-700"
            }`}
          >
            English
          </button>
          <button
            onClick={() => switchLang("jp")}
            className={`px-4 py-2 rounded ${
              lang === "jp" ? "bg-indigo-600 text-white" : "bg-slate-700"
            }`}
          >
            日本語
          </button>
        </div>

        <div className="space-y-4">
          {/* Nickname Field */}
          <div className="text-center">
            <label className="block text-sm font-medium mb-1">
              {t("nickname")}
            </label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNickState(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder={t("nickname")}
            />
          </div>

          {/* Category Dropdown */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">
              {t("category")}
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === "jp" ? c.name : c.romaji}
                </option>
              ))}
            </select>
          </div> */}

          {/* Category Switch Buttons */}
          <div>
            <label className="block text-sm text-center font-medium mb-1">
              {t("category")}
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  // Kondisi untuk menonaktifkan tombol
                  disabled={c.name !== "アニメ" && c.romaji !== "Anime"}
                  className={`
          px-4 py-2 rounded-lg text-sm font-medium
          ${
            cat === c.id
              ? "bg-indigo-600 text-white shadow-md" // Gaya untuk tombol aktif
              : "bg-gray-200 text-gray-800 hover:bg-gray-300" // Gaya untuk tombol tidak aktif
          }
          ${
            // Gaya untuk tombol yang dinonaktifkan
            c.name !== "アニメ" && c.romaji !== "Anime"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
        `}
                >
                  {lang === "jp" ? c.name : c.romaji}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {t("start")}
          </button>
        </div>
      </div>
    </div>
  );
}
