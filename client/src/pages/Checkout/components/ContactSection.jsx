import { Mail } from "lucide-react";
import { LabelInput } from "@/components/ui/input";

const ContactSection = ({ email, onChange }) => (
  <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
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
