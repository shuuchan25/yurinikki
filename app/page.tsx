import prisma from "../lib/prisma";
import ClientHome from "../components/ClientHome";

// ISR: re-fetch data setiap 10 detik di server
export const revalidate = 10;

export default async function HomePage() {
  const categories = await prisma.category.findMany();
  return <ClientHome categories={categories} />;
}
