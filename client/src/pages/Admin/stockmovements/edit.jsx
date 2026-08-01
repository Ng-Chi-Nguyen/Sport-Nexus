import { useTranslation } from "react-i18next";

const EditStockPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "stockMovement" });

  return (
    <>
      <div className="">{t("edit_title")}</div>
    </>
  );
};

export default EditStockPage;
