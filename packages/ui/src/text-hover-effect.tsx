"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration = 0.5,
}: {
  text: string;
  duration?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x && cursor.y) {
      const rect = svgRef.current.getBoundingClientRect();
      const cx = ((cursor.x - rect.left) / rect.width) * 100;
      const cy = ((cursor.y - rect.top) / rect.height) * 100;
      setMaskPosition({ cx: `${cx}%`, cy: `${cy}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="260"
      height="55"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none cursor-pointer"
    >
      <defs>
        {/* Premium blue gradient */}
        <linearGradient id="textGradient" x1="0" y1="0" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
          <stop offset="50%" stopColor="#2563eb" /> {/* blue-600 */}
          <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
        </linearGradient>

        {/* Moving mask for hover light effect */}
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="30%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{
            duration,
            ease: "easeOut",
          }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="textMask">
          <rect width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {/* Soft visible text when NOT hovered */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-400 font-sans text-6xl font-bold tracking-wide"
        animate={{
          fillOpacity: hovered ? 0.2 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {text}
      </motion.text>

      {/* Strong gradient text when hovered */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="1"
        mask="url(#textMask)"
        className="fill-transparent font-sans text-6xl font-extrabold tracking-wide"
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1.05 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
    </svg>
  );
};
