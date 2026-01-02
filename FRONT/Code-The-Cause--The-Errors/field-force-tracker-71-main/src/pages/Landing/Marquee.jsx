import { motion } from 'framer-motion'
import React from 'react'

function Marquee() {
    return (
        <div data-scroll data-scroll-section data-scroll-speed=".1" className='bg-[#004D43] w-full py-10 md:py-20 rounded-tl-3xl rounded-tr-3xl overflow-hidden'>
            <div className='flex whitespace-nowrap text border-t-2 border-b-2 border-zinc-300 overflow-hidden pr-20'>
                <motion.h1 initial={{x: "0"}} animate={{x: "-100%"}} transition={{ease: "linear" , duration: 5 , repeat: Infinity}} className='text-[24vw] leading-none font-["grotesk"] uppercase -mb-[2vw] pt-2 md:pt-10 font-semibold pr-20'> THE_ERRORS</motion.h1>
                <motion.h1 initial={{x: "0"}} animate={{x: "-100%"}} transition={{ease: "linear" , duration: 5 , repeat: Infinity}} className='text-[24vw] leading-none font-["grotesk"] uppercase -mb-[2vw] pt-2 md:pt-10 font-semibold pr-20'> THE_ERRORS</motion.h1>
            </div>
        </div>
    )
}

export default Marquee