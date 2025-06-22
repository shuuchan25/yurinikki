// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { IncomingForm, File as FormidableFile } from "formidable";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  await new Promise<void>((resolve) => {
    const form = new IncomingForm();
    form.parse(req, async (err, _fields, files) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return resolve();
      }
      const imageField = files.image as
        | FormidableFile
        | FormidableFile[]
        | undefined;
      if (!imageField) {
        res.status(400).json({ error: "No image uploaded" });
        return resolve();
      }
      const file = Array.isArray(imageField) ? imageField[0] : imageField;

      try {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: "hobby-checklist",
          use_filename: true,
          unique_filename: false,
        });
        res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (uploadError) {
        res.status(500).json({ error: "Upload gagal" });
      }
      resolve();
    });
  });
}
