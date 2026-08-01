import { useCallback, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { InputFile } from "@/components/ui/input";
import { AddressSelector } from "@/components/ui/select";
// api
import supplierdApi from "@/api/management/supplierApi";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const CreateSupplierPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "supplier" });
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("supply_chain"), route: "" },
    { title: t("suppliers_title"), route: "/management/suppliers" },
    { title: t("create_breadcrumb"), route: "" },
  ];

  // state form
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // state address
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [detail, setDetail] = useState("");
  const [address, setAddress] = useState("");

  const handleAddressChange = useCallback((addressData) => {
    setProvince(addressData.province);
    setWard(addressData.ward);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullAddress = `${detail}, ${ward}, ${province}`;
    setAddress(fullAddress);

    const fromData = new FormData();

    if (logo instanceof File) {
      fromData.append("logo_url", logo);
    }

    fromData.append("contact_person", contactPerson);
    fromData.append("email", email);
    fromData.append("phone", phone);
    fromData.append("name", name);

    const locationObj = {
      province: province,
      ward: ward,
      detail: detail,
    };
    fromData.append("location_data", JSON.stringify(locationObj));

    try {
      let response = await supplierdApi.create(fromData);

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");

      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
        {t("create_heading")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* PHẦN THÔNG TIN CHI TIẾT & ĐỊA CHỈ (BÊN TRÁI / CHIẾM PHẦN LỚN) */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="green">
              {t("contact_info_title")}
            </TitleManagement>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <FloatingInput
                  id="name"
                  label={t("name_label")}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <FloatingInput
                  id="contact_person"
                  label={t("contact_person_label")}
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div>
                <FloatingInput
                  id="email"
                  label={t("email_label")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <FloatingInput
                  id="phone"
                  label={t("phone_label")}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="emerald">
              {t("address_title")}
            </TitleManagement>

            <div className="mt-3">
              <AddressSelector onAddressChange={handleAddressChange} />
            </div>

            {ward && (
              <div className="mt-4 text-sm text-sky-600 dark:text-[#4facf3] font-medium italic">
                {t("address_label")} {ward}, {province}
              </div>
            )}

            <div className="w-full mt-4">
              <FloatingInput
                id="specific_address"
                label={t("detail_address_label")}
                required
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* PHẦN LOGO & NÚT SUBMIT (BÊN PHẢI) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="cyan">
              {t("logo_title")}
            </TitleManagement>
            <div className="mt-3">
              <InputFile value={logo} onChange={(file) => setLogo(file)} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200 flex justify-end">
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSupplierPage;
