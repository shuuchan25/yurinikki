import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "No imageUrl provided" });

  try {
    // Fetch image as buffer
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(imageRes.data, "binary");

    // Upload to Cloudinary
    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "anilist" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    res.status(200).json({
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image", details: error });
  }
}
