"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNick, setNick } from "../utils/localStorage";
import { useTranslation } from "./LanguageProvider";
import Lily from "./Lily";
import toast from "react-hot-toast";

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

  // const handleStart = () => {
  //   // Save nickname and proceed
  //   setNick(nick);
  //   router.push(`/works/${cat}`);
  // };

  const handleStart = async () => {
    const loadingToast = toast.loading(
      `${lang === "jp" ? "読み込み中…" : "Loading..."}`
    );
    setNick(nick);

    // Get IP dan region (pakai layanan publik)
    let ip = "-";
    let region = "-";
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      ip = data.ip;
      region = [data.country_name, data.region, data.city]
        .filter(Boolean)
        .join(" / ");
    } catch (e) {
      // Optional: Handle error ambil IP/region
    }

    // Timestamp ISO
    // const timestamp = new Date().toISOString();
    // Buat timestamp UTC+08:00 (Makassar/WITA)
    const date = new Date();
    // Offset ke UTC+08
    const offsetInMs = 8 * 60 * 60 * 1000;
    const makassarTime = new Date(date.getTime() + offsetInMs);

    // Format: YYYY-MM-DD HH:mm:ss (UTC+08)
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp =
      makassarTime.getFullYear() +
      "-" +
      pad(makassarTime.getMonth() + 1) +
      "-" +
      pad(makassarTime.getDate()) +
      " " +
      pad(makassarTime.getHours()) +
      ":" +
      pad(makassarTime.getMinutes()) +
      ":" +
      pad(makassarTime.getSeconds()) +
      " (UTC+08)";

    // Kirim ke webhook Make.com
    try {
      await fetch(
        "https://hook.eu2.make.com/v50tj1ewmlq152yyoqhfylbojpdke6sl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: nick,
            ip,
            region,
            timestamp,
          }),
        }
      );
    } catch (e) {
      // Optional: Handle error kirim ke webhook
      console.warn("Webhook send failed", e);
    }

    // Lanjut ke halaman berikutnya
    toast.dismiss(loadingToast);
    router.push(`/works/${cat}`);
    toast.success(`${lang === "jp" ? "読み込み完了" : "Loaded successfully."}`);
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-2">
      <div className="flex flex-col items-center justify-center gap-2">
        <Lily className="w-20" />
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
      <div className="footer__info text-center mt-5">
        <p>百合日記 || yurinikki.vercel.app</p>
        <p>制作 || しゅうちゃん</p>
      </div>
    </div>
  );
}
