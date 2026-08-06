import addressData from "@/assets/data/addressVN_afterUpdate.json";

const normalize = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(thanh pho|tinh|tp\.?\s*)/, "")
    .replace(/\s+/g, " ")
    .trim();

const fuzzy = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(phuong|xa|thi tran|thi xa)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

export function resolveLocation(loc = {}) {
  const findProvince = () => {
    const code = loc.province?.code?.toString().padStart(2, "0");
    if (code) {
      const byCode = addressData.find((p) => p.Code === code);
      if (byCode) return byCode;
    }
    const name =
      typeof loc.province === "string" ? loc.province : loc.province?.name;
    if (name) {
      const key = normalize(name);
      return addressData.find((p) => normalize(p.FullName) === key);
    }
    return null;
  };

  const matchWard = (list) => {
    if (!list?.length) return null;
    const wardName = typeof loc.ward === "string" ? loc.ward : loc.ward?.name;
    const wardCodeRaw = loc.ward?.code?.toString().padStart(5, "0");
    if (wardCodeRaw) {
      const byCode = list.find((w) => w.Code === wardCodeRaw);
      if (byCode) return byCode;
    }
    if (wardName) {
      const key = normalize(wardName);
      const exact = list.find((w) => normalize(w.FullName) === key);
      if (exact) return exact;
      const fkey = fuzzy(wardName);
      if (fkey && fkey.length >= 4) {
        const fpartial = list.find((w) => fuzzy(w.FullName).includes(fkey));
        if (fpartial) return fpartial;
      }
    }
    return null;
  };

  let province = findProvince();
  let ward = province ? matchWard(province.Wards) : null;
  if (!ward && loc.ward) {
    for (const p of addressData) {
      ward = matchWard(p.Wards);
      if (ward) {
        province = p;
        break;
      }
    }
  }

  return {
    provinceCode: province?.Code || "",
    wardCode: ward?.Code || "",
  };
}
