import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  BotMessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import chatApi from "@/api/chat/chatApi";

const ChatItemCard = ({ item, onSelect }) => {
  if (item.type === "action") {
    return (
      <button
        onClick={() => onSelect(item.command)}
        className="w-full text-left px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-sm flex items-center justify-between group"
      >
        <span>{item.title}</span>
        <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </button>
    );
  }

  if (item.type === "product") {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#111827]/80 p-2.5 hover:border-sky-400 dark:hover:border-sky-500 transition-all shadow-sm group"
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="h-11 w-11 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
            {item.title}
          </p>
          <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400 mt-0.5">
            {item.subtitle}
          </p>
        </div>
      </a>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#111827]/80 px-3.5 py-2 shadow-sm">
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
        {item.title}
      </p>
      {item.subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {item.subtitle}
        </p>
      )}
    </div>
  );
};

const ChatWidget = () => {
  const { t } = useTranslation("translation", { keyPrefix: "component.chat" });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role?.slug === "admin";

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { from: "bot", text: isAdmin ? t("welcome_admin") : t("welcome_user") },
      ]);
    }
  }, [open, isAdmin, t, messages.length]);

  const send = async (textToSend) => {
    const text = typeof textToSend === "string" ? textToSend : input.trim();
    if (!text || loading) return;

    if (typeof textToSend !== "string") {
      setInput("");
    }

    setMessages((m) => [...m, { from: "user", text }]);
    setLoading(true);
    try {
      const res = await chatApi.send(text);
      const replyData = res?.data?.data || res?.data;
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: replyData?.reply || "Không có phản hồi.",
          items: replyData?.items || [],
        },
      ]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: t("error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-[9999] flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 text-white shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-white/30 backdrop-blur-md"
        aria-label="Toggle Assistant"
      >
        {open ? (
          <X
            size={26}
            className="transition-transform group-hover:rotate-90 duration-300"
          />
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Hiệu ứng vòng sáng lan tỏa phía sau (Pulse ring) */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500 to-sky-400 opacity-70 blur-sm animate-pulse"></span>

            {/* Icon trợ lý ảo thay cho icon chat cũ */}
            <BotMessageSquare
              size={28}
              className="relative z-10 transition-transform group-hover:scale-110 duration-300"
            />

            {/* Chấm trạng thái online xanh nhỏ ở góc trên */}
            <span className="absolute top-0 right-0 z-20 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-emerald-400 animate-bounce"></span>
          </div>
        )}
      </button>

      {open && (
        <div className="fixed bottom-28 right-5 z-[9999] flex h-[520px] w-[380px] flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg">
                <BotMessageSquare size={18} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0B0F19] bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                  {t("title")}
                </h3>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Trợ lý ảo 24/7
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
              >
                {m.from === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                    <BotMessageSquare size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "bg-sky-500 text-white rounded-br-sm shadow-sky-500/20"
                      : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-700/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  {m.items?.map((it, j) => (
                    <div
                      key={j}
                      className="mt-2.5 pt-1 border-t border-slate-200/40 dark:border-slate-700/40"
                    >
                      <ChatItemCard item={it} onSelect={(cmd) => send(cmd)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 px-4 py-3 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-sky-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Trợ lý đang nhập...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 focus-within:border-sky-500 transition-colors shadow-sm">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("placeholder")}
                className="flex-1 bg-transparent py-1.5 text-sm outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={() => send()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-md"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
