import { useAnimation } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowUpLong } from "react-icons/fa6";

function ReadyEyes() {
  const [rotateLeft, setRotateLeft] = useState(0);
  const [rotateRight, setRotateRight] = useState(0);

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  const controls = useAnimation();

  const handleHoverStart = () => controls.start("hover");
  const handleHoverEnd = () => controls.start("rest");

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const getAngle = (eyeRef) => {
        const rect = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;

        return (Math.atan2(dy, dx) * (180 / Math.PI) - 180);
      };

      if (leftEyeRef.current && rightEyeRef.current) {
        setRotateLeft(getAngle(leftEyeRef));
        setRotateRight(getAngle(rightEyeRef));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      data-scroll
      data-scroll-section
      data-scroll-speed="-.35"
      className="relative z-20 w-full bg-[#CDEA68] h-auto min-h-screen py-20 rounded-2xl overflow-hidden mt-3 md:mt-6"
    >
      <div
        id="ready-wrapper"
        className="relative pt-10 md:pt-[2vw] px-6 md:px-[8vw] z-20"
      >
        <div
          data-scroll
          data-scroll-sticky
          data-scroll-target="#ready-wrapper"
          data-scroll-call="progress"
          data-scroll-repeat
          className="heading flex flex-col items-center"
        >
          <h1 className='uppercase text-[20vw] md:text-[15vw] leading-[0.8] text-zinc-800 font-["grotesk"] font-bold text-center'>ready</h1>
          <h1 className='uppercase text-[20vw] md:text-[15vw] leading-[0.8] text-zinc-800 font-["grotesk"] font-bold text-center'>to start</h1>
          <h1 className='uppercase text-[20vw] md:text-[15vw] leading-[0.8] text-zinc-800 font-["grotesk"] font-bold text-center'>the</h1>
          <h1 className='uppercase text-[20vw] md:text-[15vw] leading-[0.8] text-zinc-800 font-["grotesk"] font-bold text-center'>management?</h1>

          <div className="flex flex-col buttons mt-10 md:mt-[8vw] items-center gap-5">
            <button
              onMouseEnter={handleHoverStart}
              onMouseLeave={handleHoverEnd}
              onClick={() => {
                const el = document.getElementById("featured");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="relative w-fit h-14 md:h-16 bg-zinc-800 rounded-full flex gap-2 items-center justify-between pl-6 pr-2 group overflow-hidden"
            >
              <span className="z-10 text-white tracking-wide font-medium uppercase text-sm md:text-base">login now</span>
              <div className="w-12 h-12 md:w-14 md:h-14 z-10 flex items-center justify-center">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transform scale-100 group-hover:scale-150 transition-transform duration-300 ease-in-out flex items-center justify-center">
                  <FaArrowUpLong className="text-black text-[7px] md:text-[9px] opacity-0 rotate-45 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>
              <span className="absolute left-0 bottom-0 w-full h-0 bg-black rounded-full group-hover:h-full transition-all duration-300 ease-in-out z-0" />
            </button>
          </div>
        </div>

        {/* Eyes */}
        <div
          data-scroll
          data-scroll-section
          data-scroll-speed="-.2"
          className="eyes z-10 hidden md:flex gap-6 md:gap-10 absolute top-[35%] md:top-[25%] left-1/2 md:left-[37%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          {/* Left Eye */}
          <div className="flex items-center justify-center w-[38vw] h-[38vw] sm:w-[30vw] sm:h-[30vw] md:w-[12vw] md:h-[12vw] rounded-full bg-white">
            <div
              ref={leftEyeRef}
              className="relative w-2/3 h-2/3 bg-zinc-800 rounded-full"
            >
              <div
                className="line absolute top-1/2 left-1/2 w-full h-4 md:h-8"
                style={{
                  transform: `translate(-50%, -50%) rotate(${rotateLeft}deg)`,
                }}
              >
                <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Right Eye */}
          <div className="flex items-center justify-center w-[38vw] h-[38vw] sm:w-[30vw] sm:h-[30vw] md:w-[12vw] md:h-[12vw] rounded-full bg-white">
            <div
              ref={rightEyeRef}
              className="relative flex items-center justify-center w-2/3 h-2/3 bg-zinc-800 rounded-full"
            >
              <div
                className="line absolute top-1/2 left-1/2 w-full h-8"
                style={{
                  transform: `translate(-50%, -50%) rotate(${rotateRight}deg)`,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadyEyes;
