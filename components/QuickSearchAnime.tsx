import React, { useState, useRef } from "react";
import axios from "axios";

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

interface QuickSearchAnimeProps {
  onSelect: (anime: JikanAnime) => void;
}

const QuickSearchAnime: React.FC<QuickSearchAnimeProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim().length >= 3) {
      setLoading(true);
      debounceTimer.current = setTimeout(() => {
        axios
          .get("https://api.jikan.moe/v4/anime", {
            params: { q: val, limit: 7, sfw: true },
          })
          .then((res) => {
            setResults(res.data.data || []);
          })
          .finally(() => setLoading(false));
      }, 400);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Cari anime (MAL)"
        value={query}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full"
      />
      {loading && <div>Loading...</div>}
      {!!results.length && (
        <ul className="bg-slate-900 shadow rounded mt-1 max-h-56 overflow-y-auto z-30 absolute w-full">
          {results.map((anime) => (
            <li
              key={anime.mal_id}
              className="flex items-center px-2 py-1 hover:bg-slate-700 cursor-pointer"
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(anime);
              }}
            >
              <img
                src={
                  anime.images?.jpg?.small_image_url ||
                  anime.images?.webp?.image_url ||
                  ""
                }
                alt={anime.title}
                className="w-10 h-14 object-cover rounded mr-2"
              />
              <span>{anime.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuickSearchAnime;
