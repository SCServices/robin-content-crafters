import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tool, HardHat } from "lucide-react";

interface BuildingProgressProps {
  progress: number;
  className?: string;
}

const BuildingProgress = ({ progress, className }: BuildingProgressProps) => {
  // Calculate which parts should be visible based on progress
  const showFoundation = progress >= 0;
  const showWalls = progress >= 10;
  const showWindows = progress >= 40;
  const showRoof = progress >= 70;

  return (
    <div className={cn("relative w-full h-48", className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-end">
        {/* Construction Worker - Top */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ 
            x: showRoof ? 0 : -100,
            opacity: showRoof ? 1 : 0
          }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 right-[15%] transform -translate-y-full"
        >
          <HardHat className="w-6 h-6 text-primary-dark" />
        </motion.div>

        {/* Roof */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: showRoof ? 1 : 0,
            y: showRoof ? 0 : -20
          }}
          className="w-[80%] h-12 bg-primary/80 rounded-t-3xl"
        />
        
        {/* Windows Level */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ 
            opacity: showWindows ? 1 : 0,
            scaleX: showWindows ? 1 : 0.8
          }}
          className="w-[70%] h-16 bg-primary-light flex items-center justify-around px-4 relative"
        >
          {/* Tool Animation */}
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ 
              rotate: showWindows ? 0 : -45,
              opacity: showWindows ? 1 : 0
            }}
            transition={{ 
              duration: 0.5,
              repeat: showWindows ? Infinity : 0,
              repeatType: "reverse",
              repeatDelay: 1
            }}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2"
          >
            <Tool className="w-5 h-5 text-primary-dark" />
          </motion.div>

          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: showWindows ? 1 : 0 }}
              transition={{ delay: i * 0.2 }}
              className="w-8 h-8 bg-white rounded-sm"
            />
          ))}
        </motion.div>
        
        {/* Walls */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ 
            opacity: showWalls ? 1 : 0,
            scaleY: showWalls ? 1 : 0
          }}
          className="w-[70%] h-24 bg-primary flex items-center justify-center relative"
        >
          {/* Construction Worker - Side */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ 
              x: showWalls ? 0 : 100,
              opacity: showWalls ? 1 : 0
            }}
            transition={{ duration: 0.5 }}
            className="absolute -left-8 bottom-0"
          >
            <HardHat className="w-6 h-6 text-primary-dark" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showWalls ? 1 : 0 }}
            className="w-12 h-16 bg-primary-light rounded-t-lg"
          />
        </motion.div>
        
        {/* Foundation */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ 
            opacity: showFoundation ? 1 : 0,
            scaleX: showFoundation ? 1 : 0.5
          }}
          className="w-[80%] h-8 bg-primary-dark rounded-sm"
        />
      </div>
      
      {/* Progress Text */}
      <div className="absolute top-0 right-0 text-sm font-medium text-neutral-600">
        {Math.round(progress)}% Complete
      </div>
    </div>
  );
};

export default BuildingProgress;