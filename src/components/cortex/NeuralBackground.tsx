import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateDistance, getConnections } from "@/lib/neural-utils";
export function NeuralBackground() {
  const nodeCount = 30;
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      type: Math.random() > 0.7 ? "violet" : "cyan",
      driftX: (Math.random() - 0.5) * 5,
      driftY: (Math.random() - 0.5) * 5,
    }));
  }, []);
  const connections = useMemo(() => {
    return getConnections(nodes, 18);
  }, [nodes]);
  return (
    <div className="fixed inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 212, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
          </radialGradient>
        </defs>
        {/* Connections Layer */}
        {connections.map(([aIdx, bIdx], idx) => {
          const a = nodes[aIdx];
          const b = nodes[bIdx];
          return (
            <React.Fragment key={`conn-${idx}`}>
              <motion.line
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="url(#synapseGradient)"
                strokeWidth="1"
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Synapse Pulse */}
              <motion.circle
                r="1.5"
                fill="#00d4ff"
                initial={{ offset: 0 }}
                animate={{
                  cx: [`${a.x}%`, `${b.x}%`],
                  cy: [`${a.y}%`, `${b.y}%`],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: "linear",
                }}
              />
            </React.Fragment>
          );
        })}
        {/* Nodes Layer */}
        {nodes.map((node) => (
          <motion.g key={`node-${node.id}`}>
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size * 2}
              fill={node.type === "cyan" ? "rgba(0, 212, 255, 0.1)" : "rgba(139, 92, 246, 0.1)"}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + node.delay,
                repeat: Infinity,
              }}
            />
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              className={node.type === "cyan" ? "text-bio-cyan" : "text-memory-violet"}
              fill="currentColor"
              animate={{
                opacity: [0.4, 1, 0.4],
                x: [0, node.driftX, 0],
                y: [0, node.driftY, 0],
              }}
              transition={{
                duration: 5 + node.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        ))}
      </svg>
      {/* Random Synaptic Firing Overlays */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`firing-${i}`}
            className="absolute h-[1px] w-20 bg-gradient-to-r from-transparent via-bio-cyan to-transparent opacity-0"
            initial={{ left: "-10%", top: `${Math.random() * 100}%`, rotate: Math.random() * 360 }}
            animate={{
              left: ["-10%", "110%"],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 15,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}