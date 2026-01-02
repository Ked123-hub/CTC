import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const heading = "THE_ERROR";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50 && !menuOpen) {
        setShow(false);
      } else {
        setShow(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, menuOpen]);

  const links = [ "Login", "Contact Us"];

  return (
    <div
      className={`fixed z-[999] w-full px-6 md:px-[50px] py-[15px] flex justify-between items-center transition-all duration-500 backdrop-blur-lg bg-white/20 border-b border-white/30 ${
        show ? "top-0" : "-top-24"
      }`}
      style={{
        background: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
      }}
    >
      {/* Logo + Heading */}
      <div className="flex items-center gap-4 text-black">
        <svg width="50" height="22" viewBox="0 0 72 30" fill="none">
          <path d="M9.8393 10.2032..." fill="currentColor" />
        </svg>

        <h1 className="text-xl md:text-2xl font-bold flex gap-[2px] cursor-pointer">
          {heading.split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6 items-center text-black">
        {links.map((item, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden h-[24px] ${
              index === 4 ? "ml-80" : ""
            }`}
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const scroller = typeof window !== "undefined" && window.__locoScroll;
                if (item === "Login") {
                  if (scroller) {
                    scroller.scrollTo("#featured");
                  } else {
                    const el = document.getElementById("featured");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                } else if (item === "Contact Us") {
                  if (scroller) {
                    scroller.scrollTo("#footer");
                  } else {
                    const el = document.getElementById("footer");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }
              }}
            >
              <div className="flex flex-col">
                <span className="text-md font-light transition-transform duration-300 group-hover:-translate-y-full">
                  {item}
                </span>
                <span className="text-md font-light translate-y-full transition-transform duration-300 group-hover:-translate-y-full">
                  {item}
                </span>
              </div>
              <span className="absolute left-0 bottom-1 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-black z-[1000]"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white/70 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-black text-xl transition-transform duration-500 md:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {links.map((item, index) => (
          <a
            key={index}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              const scroller = typeof window !== "undefined" && window.__locoScroll;
              if (item === "Login") {
                if (scroller) {
                  scroller.scrollTo("#featured");
                } else {
                  const el = document.getElementById("featured");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              } else if (item === "Contact Us") {
                if (scroller) {
                  scroller.scrollTo("#footer");
                } else {
                  const el = document.getElementById("footer");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }}
            className="hover:opacity-70 transition"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
