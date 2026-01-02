import { motion } from "framer-motion";
import React, { useState } from "react";
import { FaArrowUpLong } from "react-icons/fa6";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  const Button = ({ children, onClick }) => (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative overflow-hidden px-6 py-3 border-[2px] border-zinc-300 rounded-full font-light text-md uppercase cursor-pointer"
      animate={{
        backgroundColor: isHovered ? "#000000" : "#ffffff",
        color: isHovered ? "#ffffff" : "#000000",
      }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-white text-black flex flex-col justify-between relative overflow-hidden">
      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center flex-1 px-10 sm:px-16 md:px-[100px] lg:px-[150px] text-center relative">
        {["We Build", "Smart NGO", "Connections"].map((item, index) => (
          <div key={index} className="overflow-hidden w-full">
            <div className="flex items-center justify-center gap-4 relative z-10">
              {index === 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "8vw" }}
                  transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="hidden md:block w-[8vw] h-[5.5vw] rounded-md bg-[url(/screenshots/Template.png)] bg-cover"
                />
              )}

              {/* Hero Text with rubbery hover + responsive sizing */}
              <motion.h1
                className="uppercase leading-[0.85] font-semibold font-['grotesk'] cursor-pointer"
                style={{
                  fontSize: "clamp(4rem, 11vw, 9rem)", // Responsive resizing
                }}
                whileHover={{
                  scaleY: [1, 1.1, 0.95, 1],
                  scaleX: [1, 0.95, 1.05, 1],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {item}
              </motion.h1>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER STRIP */}
      <div className="border-t border-zinc-300 px-10 sm:px-16 md:px-[100px] lg:px-[150px] py-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row gap-4 text-sm text-zinc-600">
          <p>For NGOs, volunteers, and communities</p>
          <p>From onboarding to real-world impact</p>
        </div>

        <div className="flex items-center gap-5">
          <Button
            onClick={() => {
              const scroller = typeof window !== "undefined" && window.__locoScroll;
              if (scroller) {
                scroller.scrollTo("#featured");
              } else {
                const el = document.getElementById("featured");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            Login now
          </Button>

          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-11 h-11 flex justify-center items-center rounded-full border-[2px] border-zinc-300 cursor-pointer overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
            <FaArrowUpLong
              className={`relative z-10 rotate-45 transition-colors ${
                isHovered ? "text-white" : "text-black"
              }`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
