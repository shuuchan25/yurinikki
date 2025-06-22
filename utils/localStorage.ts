export const LS_LANG = "hc_lang";
export const LS_NICK = "hc_nick";
export const LS_MODAL_SHOWN = "hc_modal_shown"; // Key untuk menyimpan status modal

// Mendapatkan bahasa yang disimpan, default 'en'
export function getLang(): "en" | "jp" {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(LS_LANG) as "en" | "jp") || "en";
}

// Menyimpan pilihan bahasa
export function setLang(lang: "en" | "jp"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_LANG, lang);
}

// Mendapatkan nickname
export function getNick(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_NICK) || "";
}

// Menyimpan nickname
export function setNick(nick: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_NICK, nick);
}

// Mendapatkan daftar checklist untuk kategori tertentu
export function getChecklist(categoryId: number): number[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(`hc_chk_${categoryId}`) || "[]");
}

// Toggle checklist pada localStorage dan kembalikan array terbaru
export function toggleChecklist(categoryId: number, workId: number): number[] {
  if (typeof window === "undefined") return [];
  const key = `hc_chk_${categoryId}`;
  const arr = getChecklist(categoryId);
  const idx = arr.indexOf(workId);
  if (idx === -1) arr.push(workId);
  else arr.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
}

// Mendapatkan status apakah modal sudah pernah ditampilkan
export function getModalShownStatus(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_MODAL_SHOWN) === "true";
}

// Menyimpan status modal sudah ditampilkan
export function setModalShownStatus(status: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_MODAL_SHOWN, status ? "true" : "false");
}
