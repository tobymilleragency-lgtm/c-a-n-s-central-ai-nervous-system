import React from "react";
import { motion } from "framer-motion";
export function NeuralBackground() {
  const nodes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5
  }));
  return (
    <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
      <svg className="w-full h-full">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {/* Connections */}
            {nodes.slice(i + 1, i + 3).map((target, j) => (
              <motion.line
                key={`${i}-${j}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="url(#synapseGradient)"
                strokeWidth="0.5"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: node.delay }}
              />
            ))}
            {/* Nodes */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="currentColor"
              className="text-bio-cyan"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
                filter: ["blur(0px)", "blur(4px)", "blur(0px)"]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: node.delay
              }}
            />
          </React.Fragment>
        ))}
        <defs>
          <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 212, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Moving Synapses */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-bio-cyan rounded-full shadow-[0_0_10px_#00d4ff]"
            initial={{ left: "-10%", top: `${Math.random() * 100}%` }}
            animate={{
              left: "110%",
              top: `${Math.random() * 100}%`,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}