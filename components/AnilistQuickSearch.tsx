"use client";
import React, { useState, useRef } from "react";
import axios from "axios";

// Define the Type for the Anime data from AniList API
type AnilistAnime = {
  id: number;
  title: {
    romaji: string;
    native: string;
  };
  seasonYear: number;
  coverImage: {
    large: string; // This is the medium-sized cover image URL
  };
};

interface QuickSearchAnimeProps {
  onSelect: (anime: AnilistAnime) => void;
}

const AnilistQuickSearch: React.FC<QuickSearchAnimeProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnilistAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim().length >= 3) {
      setLoading(true);
      debounceTimer.current = setTimeout(() => {
        // Perform the fetch request to AniList API
        axios
          .post("https://graphql.anilist.co", {
            query: `
              query ($query: String) {
                Page(page: 1, perPage: 7) {
                  media(search: $query, type: ANIME) {
                    id
                    title {
                      romaji
                      native
                    }
                    seasonYear
                    coverImage {
                      large
                    }
                  }
                }
              }
            `,
            variables: { query: val },
          })
          .then((res) => {
            const animeList = res.data.data.Page.media || [];
            setResults(animeList);
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
        placeholder="Search for Anime (AniList)"
        value={query}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full"
      />
      {loading && <div>Loading...</div>}
      {!!results.length && (
        <ul className="bg-slate-900 shadow rounded mt-1 max-h-56 overflow-y-auto z-30 absolute w-full">
          {results.map((anime) => (
            <li
              key={anime.id}
              className="flex items-center px-2 py-1 hover:bg-slate-700 cursor-pointer"
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(anime);
              }}
            >
              <img
                src={anime.coverImage?.large || ""}
                alt={anime.title.romaji}
                className="w-10 h-14 object-cover rounded mr-2"
              />
              <span>{anime.title.romaji}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnilistQuickSearch;
