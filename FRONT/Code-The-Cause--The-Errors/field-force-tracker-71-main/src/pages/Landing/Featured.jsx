import React from "react";
import { motion } from "framer-motion";

function Featured() {
  const roles = [
    {
      title: "Volunteer",
      description: "Access tasks and contribute",
      path: "/login?role=WORKER",
    },
    {
      title: "Supervisor",
      description: "Manage volunteers and tasks",
      path: "/login?role=MANAGER",
    },
    {
      title: "Administrator",
      description: "Full system access",
      path: "/login?role=ADMIN",
    },
  ];

  return (
    <section id="featured" className="w-full bg-zinc-800 py-20 rounded-tr-3xl rounded-tl-3xl relative z-10 -mt-10 md:-mt-20">

      {/* Heading */}
      <div className="border-b border-zinc-700 pb-14 px-6 md:px-[50px]">
        <h1 className='text-4xl md:text-7xl font-["nmontreal"]'>
          What Is Your Role ?
        </h1>
      </div>

      {/* Role Cards */}
      <div className="grid gap-8 md:grid-cols-3 px-6 md:px-[50px] py-16">
        {roles.map((role) => (
          <motion.div
            key={role.title}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (window.location.href = role.path)}
            className="cursor-pointer bg-zinc-900 border border-zinc-700 rounded-2xl p-10 hover:border-lime-400 transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold mb-3">
              {role.title}
            </h2>

            <p className="text-zinc-400 mb-6">
              {role.description}
            </p>

            <span className="text-lime-400 text-sm font-medium">
              Click The Box
            </span>
          </motion.div>
        ))}
      </div>
<div className="text-zinc-800 uppercase py-2"></div>
            <div className="text-zinc-800 uppercase py-2"></div>
            <div className="text-zinc-800 uppercase py-2"></div>
    </section>
  );
}

export default Featured;
