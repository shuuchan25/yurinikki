"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import QuickSearchAnime from "./QuickSearchAnime";
import AnilistQuickSearch from "./AnilistQuickSearch";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });

type JikanAnime = {
  mal_id: number;
  title: string;
  title_japanese?: string;
  year?: number;
  images: {
    jpg?: {
      image_url?: string;
      small_image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      small_image_url?: string;
      large_image_url?: string;
    };
  };
};

type AniListAnime = {
  id: number;
  title: {
    romaji: string;
    native: string;
  };
  year: number;
  images: {
    medium: string;
  };
};

type Category = { id: number; name: string; romaji: string };
type Work = {
  id: number;
  name: string;
  romaji: string;
  releaseYear: number;
  categoryId: number;
  image: string;
  imagePublicId: string;
};

export default function AdminDashboard() {
  // --- STATE UTAMA ---
  const [tab, setTab] = useState<"categories" | "works">("categories");
  const { data: categories, mutate: mutateCategories } = useSWR<Category[]>(
    "/api/categories",
    fetcher
  );
  const [selectedCat, setSelectedCat] = useState<number>(0);
  // const { data: works, mutate: mutateWorks } = useSWR<Work[]>(
  //   `/api/works?categoryId=${selectedCat}`,
  //   fetcher
  // );
  // const { data: worksData, mutate: mutateWorks } = useSWR(
  //   `/api/works?categoryId=${selectedCat}&page=${page}&limit=${limit}&q=${encodeURIComponent(
  //     search
  //   )}`,
  //   fetcher
  // );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: worksData, mutate: mutateWorks } = useSWR(
    `/api/works?categoryId=${selectedCat}&page=${page}&q=${encodeURIComponent(
      search
    )}`,
    fetcher
  );
  const works = worksData?.works || [];
  const totalPages = worksData?.totalPages || 1;

  // Inisialisasi kategori default saat data categories tiba
  useEffect(() => {
    if (categories && categories.length > 0 && selectedCat === 0) {
      setSelectedCat(categories[0].id);
    }
  }, [categories]);

  // Refresh works saat berpindah tab atau ganti kategori
  useEffect(() => {
    if (tab === "works") {
      mutateWorks();
    }
  }, [tab, selectedCat]);

  // --- STATE FORM CATEGORY ---
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState<{
    id?: number;
    name: string;
    romaji: string;
  }>({
    name: "",
    romaji: "",
  });

  // --- STATE FORM WORKS ---
  const [showWorkForm, setShowWorkForm] = useState(true);
  const [workForm, setWorkForm] = useState<{
    id?: number;
    name: string;
    romaji: string;
    releaseYear: number;
    categoryId: number;
    image: string;
    imagePublicId?: string;
  }>({
    name: "",
    romaji: "",
    releaseYear: new Date().getFullYear(),
    categoryId: 0,
    image: "",
    imagePublicId: undefined,
  });
  const [workFile, setWorkFile] = useState<File | null>(null);
  type UploadResult = { url: string; public_id: string };

  // --- HELPERS ---
  // Upload file ke API `/api/upload`
  const uploadFile = async (file: File): Promise<UploadResult> => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const json = (await res.json()) as UploadResult;
    return json;
  };

  // --- HANDLER CATEGORY ---
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = catForm.id ? "PUT" : "POST";
    await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(catForm),
    });
    setShowCatForm(false);
    setCatForm({ name: "", romaji: "" });
    mutateCategories();
  };

  // --- HANDLER WORKS ---
  // const handleWorkSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   let imageUrl = workForm.image;
  //   if (workFile) {
  //     imageUrl = await uploadFile(workFile);
  //   }
  //   const payload = {
  //     ...workForm,
  //     categoryId: selectedCat,
  //     image: imageUrl,
  //   };
  //   const method = workForm.id ? "PUT" : "POST";
  //   await fetch("/api/works", {
  //     method,
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //     body: JSON.stringify(payload),
  //   });
  //   setShowWorkForm(false);
  //   setWorkFile(null);
  //   setWorkForm({
  //     id: undefined,
  //     name: "",
  //     romaji: "",
  //     releaseYear: new Date().getFullYear(),
  //     categoryId: selectedCat,
  //     image: "",
  //   });
  //   mutateWorks();
  // };

  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = workForm.image;
    let public_id = workForm.imagePublicId;

    if (workFile) {
      const up = await uploadFile(workFile);
      url = up.url;
      public_id = up.public_id;
    }

    const payload = {
      id: workForm.id,
      name: workForm.name,
      romaji: workForm.romaji,
      releaseYear: workForm.releaseYear,
      categoryId: selectedCat,
      imageUrl: url, // ← sesuai backend
      imageFile: undefined, // ← biarkan kosong kecuali ingin handle upload via base64/file (untuk sekarang skip saja)
      imagePublicId: public_id, // ← optional, jika backend mau
    };

    const method = workForm.id ? "PUT" : "POST";
    await fetch("/api/works", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // reset form…
    // setShowWorkForm(false);
    setWorkFile(null);
    setWorkForm({
      id: undefined,
      name: "",
      romaji: "",
      releaseYear: new Date().getFullYear(),
      categoryId: selectedCat,
      image: "",
      imagePublicId: undefined,
    });
    mutateWorks();
  };

  // const handleAnimeSelect = (anime: JikanAnime) => {
  //   setWorkForm((prev) => ({
  //     ...prev,
  //     name: anime.title_japanese || anime.title,
  //     romaji: anime.title,
  //     releaseYear: anime.year ? anime.year : new Date().getFullYear(),
  //     image: anime.images?.webp?.large_image_url || "",
  //   }));
  // };

  // const handleAnimeSelect = (anime: AniListAnime) => {
  //   setWorkForm({
  //     ...workForm,
  //     name: anime.title.native || anime.title.romaji,
  //     romaji: anime.title.romaji,
  //     releaseYear: anime.year,
  //     image: anime.images.medium,
  //   });
  // };
  const handleAnimeSelect = (anime: AniListAnime) => {
    setWorkForm({
      id: workForm.id, // Retain the id if editing
      name: anime.title.native || anime.title.romaji,
      romaji: anime.title.romaji,
      releaseYear: anime.seasonYear,
      image: anime.coverImage.medium,
      imagePublicId: workForm.imagePublicId, // Retain the imagePublicId if editing
    });
  };

  // const handleWorkSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   let imageUrl = workForm.image;

  //   if (workFile) {
  //     // Upload image to Cloudinary if file is selected
  //     imageUrl = await uploadFile(workFile);
  //   }

  //   const payload = {
  //     ...workForm,
  //     categoryId: selectedCat,
  //     image: imageUrl, // Save the image URL (either from the file or directly provided)
  //   };

  //   const method = workForm.id ? "PUT" : "POST";

  //   // Submit to API
  //   await fetch("/api/works", {
  //     method,
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //     body: JSON.stringify(payload),
  //   });

  //   // Reset form after submission
  //   setShowWorkForm(false);
  //   setWorkFile(null);
  //   setWorkForm({
  //     id: undefined,
  //     name: "",
  //     romaji: "",
  //     releaseYear: new Date().getFullYear(),
  //     categoryId: selectedCat,
  //     image: "", // Reset image URL
  //   });
  //   mutateWorks();
  // };

  // --- RENDER ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() =>
            signOut({ redirect: true, callbackUrl: "/auth/signin" })
          }
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setTab("categories")}
          className={`px-4 py-2 rounded transition-all ease ${
            tab === "categories" ? "bg-indigo-600 text-white" : "bg-slate-500"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setTab("works")}
          className={`px-4 py-2 rounded transition-all ease ${
            tab === "works" ? "bg-indigo-600 text-white" : "bg-slate-500"
          }`}
        >
          Works
        </button>
      </div>

      {tab === "categories" ? (
        // --- CATEGORY MANAGEMENT ---
        <div>
          <button
            onClick={() => {
              setShowCatForm(true);
              setCatForm({ name: "", romaji: "" });
            }}
            className="mb-4 bg-green-500 text-white px-3 py-1 rounded"
          >
            Add Category
          </button>

          {showCatForm && (
            <form
              onSubmit={handleCatSubmit}
              className="mb-4 p-4 border rounded space-y-2"
            >
              <input
                type="text"
                placeholder="Nama (Japanese)"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
              <input
                type="text"
                placeholder="Romaji"
                value={catForm.romaji}
                onChange={(e) =>
                  setCatForm((prev) => ({ ...prev, romaji: e.target.value }))
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
              <div className="flex space-x-2 w-full justify-end items-center">
                <button
                  type="button"
                  onClick={() => setShowCatForm(false)}
                  className="bg-slate-500 px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <ul className="space-y-2">
            {categories?.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  {c.name} / {c.romaji}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setShowCatForm(true);
                      setCatForm({ id: c.id, name: c.name, romaji: c.romaji });
                    }}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      await fetch("/api/categories", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ id: c.id }),
                      });
                      mutateCategories();
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // --- WORKS MANAGEMENT ---
        <div>
          <div className="mb-4 flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="border px-3 py-2 rounded"
            />
            <div className="flex flex-col">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(Number(e.target.value))}
                className="border px-3 py-2 rounded"
              >
                {categories?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-500">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setShowWorkForm(true);
                setWorkForm({
                  id: undefined,
                  name: "",
                  romaji: "",
                  releaseYear: new Date().getFullYear(),
                  categoryId: selectedCat,
                  image: "",
                });
              }}
              className="ml-auto bg-green-500 text-white px-3 py-1 rounded"
            >
              Add Work
            </button>
          </div>

          {/* Pagination */}
          <div className="flex items-center w-full justify-end space-x-4 my-2">
            <span>
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="text-indigo-400"
            >
              Prev
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="text-indigo-400"
            >
              Next
            </button>
          </div>

          {showWorkForm && (
            <form
              onSubmit={handleWorkSubmit}
              className="mb-4 p-4 border rounded space-y-2"
            >
              {/* <QuickSearchAnime onSelect={handleAnimeSelect} /> */}
              {/* <AnilistQuickSearch
                onSelect={(anime) => {
                  setWorkForm({
                    name: anime.title.native,
                    romaji: anime.title.romaji,
                    releaseYear: anime.seasonYear,
                    image: anime.coverImage.large,
                    categoryId: selectedCat,
                  });
                }}
              /> */}
              <AnilistQuickSearch onSelect={handleAnimeSelect} />
              <input
                type="text"
                placeholder="Nama (Japanese)"
                value={workForm.name}
                onChange={(e) =>
                  setWorkForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
              <input
                type="text"
                placeholder="Romaji"
                value={workForm.romaji}
                onChange={(e) =>
                  setWorkForm((prev) => ({ ...prev, romaji: e.target.value }))
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
              <input
                type="number"
                placeholder="Release Year"
                value={workForm.releaseYear}
                onChange={(e) =>
                  setWorkForm((prev) => ({
                    ...prev,
                    releaseYear: Number(e.target.value),
                  }))
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
              {/* <div>
                <label className="block text-sm font-medium mb-1">Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setWorkFile(e.currentTarget.files?.[0] ?? null)
                  }
                  className="w-full"
                />
              </div> */}
              <input
                type="text"
                placeholder="Atau masukkan URL gambar"
                value={workForm.image}
                onChange={(e) =>
                  setWorkForm({ ...workForm, image: e.target.value })
                }
                className="w-full mt-2 p-2 border rounded"
              />
              <div>
                {workForm.image && (
                  <img
                    src={workForm.image}
                    alt="Current"
                    className="w-24 h-24 object-cover rounded mb-2"
                  />
                )}
                <label>Ganti Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWorkFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkForm(false)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <ul className="space-y-2">
            {works?.map((w: Work) => (
              <li
                key={w.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  {w.name} ({w.releaseYear})
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setShowWorkForm(true);
                      setWorkForm({
                        id: w.id,
                        name: w.name,
                        romaji: w.romaji,
                        releaseYear: w.releaseYear,
                        categoryId: w.categoryId,
                        image: w.image,
                      });
                    }}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      await fetch("/api/works", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ id: w.id }),
                      });
                      mutateWorks();
                    }}
                    className="text-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
