import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
<footer id="footer" className="w-full bg-[#0F5C4D] text-white px-6 md:px-14 py-6 md:py-8 relative z-[100]">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">

    {/* LEFT */}
    <div className='w-full md:w-1/2 font-["grotesk"]'>
      <h1 className="uppercase text-[7.5vw] md:text-[4.5vw] leading-[0.95] font-semibold">
        Smart NGO
      </h1>
      <h1 className="uppercase text-[7.5vw] md:text-[4.5vw] leading-[0.95] font-semibold">
        Connections
      </h1>

      <p className="mt-6 max-w-sm text-white/70 text-sm leading-relaxed">
        Empowering NGOs, volunteers, and communities through smart,
        transparent digital solutions.
      </p>
    </div>

    {/* RIGHT */}
    <div className="w-full md:w-1/2 grid grid-cols-2 gap-10 text-sm">

      <div>
        <div className="mb-3 font-semibold">Social</div>
        {["Instagram", "LinkedIn", "Twitter", "GitHub"].map((item, i) => (
          <a key={i} href="#" className="block mb-2 text-white/80 hover:text-white">
            {item}
          </a>
        ))}
      </div>

      <div>
        <div className="mb-3 font-semibold">Menu</div>
        {["Home", "Platform", "Volunteers", "NGOs", "Impact", "Contact"].map(
          (item, i) => (
            <a key={i} href="#" className="block mb-2 text-white/80 hover:text-white">
              {item}
            </a>
          )
        )}
      </div>

      <div>
        <div className="mb-3 font-semibold">Location</div>
        <p className="text-white/70">Pune, India</p>
        <p className="text-white/70">Mumbai, India</p>
      </div>

      <div>
        <div className="mb-3 font-semibold">Contact</div>
        <a
          href="mailto:therrors.ngo@gmail.com"
          className="text-white/80 hover:text-white"
        >
           contact@therrorsngo.org
        </a>
        <br />
        <a
          href="mailto:therrors.ngo@gmail.com"
          className="text-white/80 hover:text-white"
        >
+91 98765 43210
        </a>
     
      </div>
    </div>
  </div>

  {/* BOTTOM */}
  <div className="max-w-7xl mx-auto mt-10 pt-4 border-t border-white/20 flex justify-between text-xs text-white/60">
    <span>© 2025 THE_ERRORS</span>
    <span>Hackathon Edition</span>
  </div>
</footer>

  );
}

export default Footer;
