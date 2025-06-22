"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "./LanguageProvider";
import { LS_MODAL_SHOWN, setModalShownStatus } from "../utils/localStorage"; // Import fungsi baru

const modalVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
};

export default function InfoModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { lang, t } = useTranslation();

  // Cek jika modal sudah pernah ditampilkan
  useEffect(() => {
    const modalShown = localStorage.getItem(LS_MODAL_SHOWN);
    if (!modalShown) {
      setIsModalVisible(true);
    }
  }, []);

  // Menyimpan status modal sudah ditampilkan di localStorage
  const handleClose = () => {
    setModalShownStatus(true); // Menyimpan status modal sudah ditampilkan
    setIsModalVisible(false);
  };

  return (
    isModalVisible && (
      <motion.div
        className="fixed inset-0 bg-[#00000095]  flex justify-center items-center z-50"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.3 }}
      >
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]">
          <h2 className="text-xl font-bold mb-4"> {t("modalHeader")}</h2>
          <p className="mb-4">{t("modalContent")}</p>
          <p className="mb-4">{t("modalWarn")}</p>
          <button
            onClick={handleClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
          >
            {t("modalButton")}
          </button>
        </div>
      </motion.div>
    )
  );
}
