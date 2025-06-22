import { motion } from "framer-motion";
import { useTranslation } from "./LanguageProvider";

const modalVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
};

export default function InfoModal({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const { lang, t } = useTranslation();

  const modalContent =
    lang === "jp" ? (
      <>
        しゅうちゃんがお届けする、 <br />
        2025年<b>「百合の日」特別企画！</b>
        <br />
        <br />
        このサイトでは、これまでに観た百合アニメにチェックを入れて、結果をダウンロードしSNSに投稿できます！
        <br />
      </>
    ) : (
      <>
        Presented by Shuuchan:
        <br /> <b>A 2025 Yuri Day Special Project!</b>
        <br />
        <br />
        On this site, you can check off the Yuri anime you've watched, download
        your results, and share them on social media!
        <br />
      </>
    );

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-[#00000095] flex justify-center items-center z-50"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3 }}
    >
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]">
        <h2 className="text-xl font-bold mb-4">{t("modalHeader")}</h2>
        <p className="mb-4 text-justify">{modalContent}</p>
        <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-4 rounded-md relative mb-8">
          {lang === "jp" ? (
            <>
              <p className="font-bold mb-2">※ ご注意ください！</p>
              <p className="text-sm text-justify">
                このリストには公式な百合・GLアニメだけでなく、開発者の「百合メガネ」を通して選ばれた、日常系アニメや百合要素の強い作品、女の子同士の強いカップリングが見られるアニメも含まれています。
                もしリストにない百合アニメがあれば、ぜひ教えていただけると嬉しいです。
                <br />
                <br />
                ご意見やご報告がありましたら、X (旧Twitter)
                アカウント「@yuridaisuki25」までDM (ダイレクトメッセージ)
                をお送りください！
              </p>
            </>
          ) : (
            <>
              <p className="font-bold mb-2">※ Please Note!</p>
              <p className="text-sm text-justify">
                This list includes not only officially recognized Yuri/GL anime,
                but also series that fit the developer's "Yuri Goggle", such as
                slice-of-life anime with strong Yuri elements or prominent
                girl-on-girl pairings. If you know of any Yuri anime not yet on
                the list, we'd be very happy if you could let us know!
                <br />
                <br /> If you have any feedback or reports, please send a DM
                (Direct Message) to our X (formerly Twitter) account:
                "@yuridaisuki25"!
              </p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
        >
          {t("modalButton")}
        </button>
      </div>
    </motion.div>
  );
}
