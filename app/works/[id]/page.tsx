// app/works/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import WorksList from "../../../components/WorksList";

type Work = {
  id: number;
  name: string;
  romaji: string;
  releaseYear: number;
  image: string;
};

interface Params {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Params) {
  // 1. Tunggu params sebelum pakai
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  // 2. Fetch kategori & works bersamaan
  const [category, works] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true, romaji: true },
    }),
    prisma.work.findMany({
      where: { categoryId },
      orderBy: { releaseYear: "desc" },
    }) as Promise<Work[]>,
  ]);

  // 3. Jika tidak ada category, lempar 404
  if (!category) {
    notFound();
  }

  // 4. Render WorksList dengan semua props yg dibutuhkan
  return (
    <WorksList
      works={works}
      categoryId={categoryId}
      categoryName={category.name}
      categoryRomaji={category.romaji}
    />
  );
}
