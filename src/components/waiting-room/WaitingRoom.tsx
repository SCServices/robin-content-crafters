import { useState, useEffect } from "react";
import { WordPuzzle } from "./WordPuzzle";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface WaitingRoomProps {
  isGenerating: boolean;
  progress: number;
  onComplete: () => void;
}

const words = [
  "content",
  "marketing",
  "strategy",
  "business",
  "success",
  "digital",
  "growth",
  "brand",
];

export const WaitingRoom = ({ isGenerating, progress, onComplete }: WaitingRoomProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (progress === 100) {
      onComplete();
    }
  }, [progress, onComplete]);

  const handleComplete = () => {
    setScore((prev) => prev + 1);
    toast.success("Correct! Here's another one.");
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
  };

  const handleSkip = () => {
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
  };

  if (!isGenerating || progress === 100) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 transition-all duration-300 ${
        isMinimized ? "w-12 h-12" : "w-80"
      }`}
      onMouseEnter={() => setIsMinimized(false)}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-neutral-700">
              While you wait...
            </h3>
            <span className="text-xs text-neutral-500">Score: {score}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {!isMinimized && (
          <WordPuzzle
            word={currentWord}
            onComplete={handleComplete}
            onSkip={handleSkip}
            timeLimit={30}
          />
        )}
      </div>
    </div>
  );
};