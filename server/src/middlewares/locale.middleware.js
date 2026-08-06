const SUPPORTED = { vi: true, en: true };

export const localeMiddleware = (req, res, next) => {
  const raw = req.headers["accept-language"] || req.headers["accept_language"] || "vi";
  const lang = String(raw).slice(0, 2).toLowerCase();
  req.lang = SUPPORTED[lang] ? lang : "vi";
  next();
};
