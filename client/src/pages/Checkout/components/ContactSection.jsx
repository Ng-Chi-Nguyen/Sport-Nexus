import { Mail } from "lucide-react";
import { LabelInput } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const ContactSection = ({ email, name, phone, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        <Mail size={16} />
        {t("contact_info")}
      </h2>
      <LabelInput
        label={t("email_label")}
        type="email"
        value={email}
        onChange={(e) => onChange("email", e.target.value)}
        placeholder={t("email_placeholder")}
        square
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <LabelInput
            label={t("receiver_name_label")}
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder={t("receiver_name_placeholder")}
            square
          />
        </div>
        <div>
          <LabelInput
            label={t("phone_number_label")}
            type="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t("phone_number_placeholder")}
            square
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
