// // pages/api/works.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth/next";
// import { v2 as cloudinary } from "cloudinary";
// import prisma from "../../lib/prisma";
// import { authOptions } from "./auth/[...nextauth]";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session) return res.status(401).end();

//   // GET works
//   if (req.method === "GET") {
//     const { categoryId } = req.query;
//     const works = await prisma.work.findMany({
//       where: { categoryId: Number(categoryId) },
//       include: { category: true },
//       orderBy: { releaseYear: "desc" },
//     });
//     return res.json(works);
//   }

//   // POST create new work
//   if (req.method === "POST") {
//     const {
//       name,
//       romaji,
//       releaseYear,
//       categoryId,
//       url, // from front‐end
//       public_id, // from front‐end
//     } = req.body;

//     const created = await prisma.work.create({
//       data: {
//         name,
//         romaji,
//         releaseYear: Number(releaseYear),
//         categoryId: Number(categoryId),
//         image: url, // SIMPAN ke kolom `image`
//         imagePublicId: public_id, // SIMPAN ke kolom `imagePublicId?`
//       },
//     });
//     return res.status(201).json(created);
//   }

//   // PUT update
//   if (req.method === "PUT") {
//     const { id, name, romaji, releaseYear, categoryId, url, public_id } =
//       req.body;

//     const old = await prisma.work.findUnique({ where: { id: Number(id) } });
//     if (!old) return res.status(404).end("Not found");

//     // jika ganti gambar, hapus asset lama
//     if (old.imagePublicId && old.imagePublicId !== public_id) {
//       await cloudinary.uploader.destroy(old.imagePublicId);
//     }

//     const updated = await prisma.work.update({
//       where: { id: Number(id) },
//       data: {
//         name,
//         romaji,
//         releaseYear: Number(releaseYear),
//         categoryId: Number(categoryId),
//         image: url,
//         imagePublicId: public_id,
//       },
//     });
//     return res.json(updated);
//   }

//   // DELETE work + Cloudinary asset
//   if (req.method === "DELETE") {
//     const { id } = req.body;
//     const old = await prisma.work.findUnique({ where: { id: Number(id) } });
//     if (old?.imagePublicId) {
//       await cloudinary.uploader.destroy(old.imagePublicId);
//     }
//     await prisma.work.delete({ where: { id: Number(id) } });
//     return res.status(204).end();
//   }

//   res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
//   res.status(405).end();
// }

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../../lib/prisma";
import { authOptions } from "./auth/[...nextauth]";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  // GET works
  // if (req.method === "GET") {
  //   const { categoryId } = req.query;

  //   // Ambil works berdasarkan categoryId dari database
  //   const works = await prisma.work.findMany({
  //     where: { categoryId: Number(categoryId) }, // Filter berdasarkan categoryId
  //     include: { category: true }, // Sertakan relasi category jika perlu
  //     orderBy: { releaseYear: "desc" }, // Urutkan berdasarkan tahun rilis
  //   });

  //   // Jika Anda ingin menambahkan pengecekan untuk imagePublicId dan image
  //   const formattedWorks = works.map((work) => ({
  //     ...work,
  //     imageUrl: work.image, // Gambar bisa diakses dari field 'image'
  //     imagePublicId: work.imagePublicId || undefined, // public_id jika ada, gunakan undefined jika tidak ada
  //   }));

  //   return res.json(formattedWorks); // Kembalikan data dengan URL gambar dan public_id
  // }
  if (req.method === "GET") {
    const { categoryId, page = 1, limit = 10, q = "" } = req.query;
    const pageNum = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (pageNum - 1) * take;

    const keyword = Array.isArray(q) ? q[0] : q || "";

    const where: any = {
      categoryId: Number(categoryId),
    };
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { romaji: { contains: keyword, mode: "insensitive" } },
        { image: { contains: keyword, mode: "insensitive" } },
      ];
    }

    // Total count
    const total = await prisma.work.count({ where });

    // Fetch works
    const works = await prisma.work.findMany({
      where,
      include: { category: true },
      orderBy: { releaseYear: "desc" },
      skip,
      take,
    });

    return res.json({
      works,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
    });
  }

  // POST create new work
  if (req.method === "POST") {
    const {
      name,
      romaji,
      releaseYear,
      categoryId,
      imageUrl, // imageUrl dari frontend
      imageFile, // imageFile jika ada
    } = req.body;

    let image: string = imageUrl; // Jika imageUrl diberikan, gunakan itu
    let imagePublicId: string | undefined = undefined;

    // Jika imageFile di-upload, unggah ke Cloudinary
    if (imageFile) {
      const uploadedImage = await uploadImageToCloudinary(imageFile);
      image = uploadedImage.url; // Set image URL
      imagePublicId = uploadedImage.public_id; // Set public_id untuk gambar yang di-upload
    }

    // Pastikan image sudah ada, jika tidak, kembalikan error
    if (!image) {
      return res.status(400).json({ error: "Image URL or file is required" });
    }

    // Melakukan operasi CREATE (POST)
    const createdWork = await prisma.work.create({
      data: {
        name,
        romaji,
        releaseYear: Number(releaseYear),
        categoryId: Number(categoryId),
        image,
        imagePublicId: imagePublicId, // Menyertakan imagePublicId jika ada
      },
    });

    return res.status(201).json(createdWork);
  }

  // PUT update
  if (req.method === "PUT") {
    const { id, name, romaji, releaseYear, categoryId, imageUrl, imageFile } =
      req.body;

    const oldWork = await prisma.work.findUnique({ where: { id: Number(id) } });
    if (!oldWork) return res.status(404).end("Not found");

    let image: string = imageUrl || oldWork.image; // Jika imageUrl kosong, gunakan yang lama
    let imagePublicId: string | undefined = oldWork.imagePublicId ?? undefined;

    // Jika imageFile baru di-upload, hapus gambar lama dan unggah yang baru
    if (imageFile) {
      // Hapus gambar lama dari Cloudinary
      if (oldWork.imagePublicId) {
        await cloudinary.uploader.destroy(oldWork.imagePublicId);
      }

      const uploadedImage = await uploadImageToCloudinary(imageFile);
      image = uploadedImage.url;
      imagePublicId = uploadedImage.public_id; // Simpan public_id untuk gambar yang baru
    }

    // Melakukan operasi UPDATE (PUT)
    const updatedWork = await prisma.work.update({
      where: { id: Number(id) },
      data: {
        name,
        romaji,
        releaseYear: Number(releaseYear),
        categoryId: Number(categoryId),
        image,
        imagePublicId, // Menyimpan public_id gambar baru (jika ada)
      },
    });
    return res.json(updatedWork);
  }

  // DELETE work
  if (req.method === "DELETE") {
    const { id } = req.body;
    const oldWork = await prisma.work.findUnique({ where: { id: Number(id) } });

    // Jika ada imagePublicId, hapus gambar dari Cloudinary
    if (oldWork?.imagePublicId) {
      await cloudinary.uploader.destroy(oldWork.imagePublicId);
    }

    await prisma.work.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }

  // Jika bukan POST, PUT, DELETE
  res.status(405).end();
}

// Fungsi untuk meng-upload gambar ke Cloudinary
async function uploadImageToCloudinary(imageFile: any) {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/" +
      process.env.CLOUDINARY_CLOUD_NAME +
      "/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
}
