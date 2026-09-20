import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 p-3 rounded-xl bg-[#C9A646] hover:bg-[#ca933c] text-slate-950 shadow-2xl transition-all duration-300 z-50 cursor-pointer ${
        visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-90 pointer-events-none"
      }`}
      title="Scroll to Top"
    >
      <ArrowUp className="w-4 h-4 font-black" />
    </button>
  );
}
