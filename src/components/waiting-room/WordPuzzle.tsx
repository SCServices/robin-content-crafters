import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WordPuzzleProps {
  word: string;
  onComplete: () => void;
  onSkip: () => void;
  timeLimit: number;
}

export const WordPuzzle = ({ word, onComplete, onSkip, timeLimit }: WordPuzzleProps) => {
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    const scramble = (str: string) => {
      return str
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
    };
    setScrambledWord(scramble(word));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [word, onSkip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toLowerCase() === word.toLowerCase()) {
      onComplete();
    }
  };

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-neutral-500">Time left: {timeLeft}s</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-neutral-600"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-lg font-bold text-primary mb-2">{scrambledWord}</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Unscramble the word..."
        />
        <Button type="submit" variant="outline" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};