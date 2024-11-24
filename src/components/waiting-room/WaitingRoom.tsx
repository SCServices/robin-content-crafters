import { useState, useEffect } from "react";
import { WordPuzzle } from "./WordPuzzle";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [score, setScore] = useState(0);
  const [showGame, setShowGame] = useState(true);

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

  if (!isGenerating || progress === 100 || !showGame) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowGame(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-neutral-700">
                While you wait...
              </h3>
              <span className="text-xs text-neutral-500">Score: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <WordPuzzle
            word={currentWord}
            onComplete={handleComplete}
            onSkip={handleSkip}
            timeLimit={180}
          />
        </div>
      </div>
    </div>
  );
};