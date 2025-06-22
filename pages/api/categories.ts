import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import prisma from "../../lib/prisma";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  if (req.method === "GET") {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  }
  if (req.method === "POST") {
    const { name, romaji } = req.body;
    const cat = await prisma.category.create({ data: { name, romaji } });
    return res.json(cat);
  }
  if (req.method === "PUT") {
    const { id, name, romaji } = req.body;
    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { name, romaji },
    });
    return res.json(updated);
  }
  if (req.method === "DELETE") {
    const { id } = req.body;
    await prisma.category.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }
  return res.status(405).end();
}
