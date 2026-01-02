import { useEffect } from "react";

export default function CursorEffect() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ripple = document.getElementById("cursor-ripple");
    if (!cursor || !ripple) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const speed = 0.2; // 👈 lower = smoother

    const move = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

  const animate = () => {
  currentX += (mouseX - currentX) * speed;
  currentY += (mouseY - currentY) * speed;

  const transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

  cursor.style.transform = transform;
  ripple.style.transform = transform;

  requestAnimationFrame(animate);
};

    const click = () => {
      cursor.classList.remove("pop");
      ripple.classList.remove("ripple");

      void cursor.offsetWidth;
      void ripple.offsetWidth;

      cursor.classList.add("pop");
      ripple.classList.add("ripple");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", click);

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", click);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        id="cursor"
        className="fixed top-0 left-0 z-[9999] pointer-events-none
                   -translate-x-1/2 -translate-y-1/2
                   w-3.5 h-3.5 rounded-full bg-orange-500"
      />

      {/* Ripple */}
      <div
        id="cursor-ripple"
        className="fixed top-0 left-0 z-[9998] pointer-events-none
                   -translate-x-1/2 -translate-y-1/2
                   w-10 h-10 rounded-full border border-orange-500/60 opacity-0"
      />
    </>
  );
}
