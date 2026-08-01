import { Mail } from "lucide-react";
import { LabelInput } from "@/components/ui/input";

const ContactSection = ({ email, onChange }) => (
  <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
      <Mail size={16} />
      Thông tin liên hệ
    </h2>
    <LabelInput
      label="Email"
      type="email"
      value={email}
      onChange={onChange}
      placeholder="Email của bạn"
    />
  </div>
);

export default ContactSection;
