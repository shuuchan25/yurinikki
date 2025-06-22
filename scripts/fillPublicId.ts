// scripts/fillPublicId.ts
// import prisma from "../lib/prisma";

// async function main() {
//   const works = await prisma.work.findMany();
//   for (const w of works) {
//     // contoh: derive public_id dari URL, atau set placeholder
//     await prisma.work.update({
//       where: { id: w.id },
//       data: { imagePublicId: "" },
//     });
//   }
// }
// main()
//   .catch(console.error)
//   .finally(() => process.exit());
