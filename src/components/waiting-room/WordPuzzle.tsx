import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import confetti from "canvas-confetti";

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
  const [showScore, setShowScore] = useState(false);

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
          setShowScore(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toLowerCase() === word.toLowerCase()) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
      setUserInput("");
    }
  };

  if (showScore) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-primary">Time's Up!</h3>
        <p className="text-neutral-600">Great effort! Ready for another word?</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => {
            setShowScore(false);
            setTimeLeft(timeLimit);
            onSkip();
          }}>
            Next Word
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white/80 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-neutral-500">
          Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
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
        <Button 
          type="button" 
          variant="ghost" 
          className="w-full text-neutral-500 hover:text-neutral-700"
          onClick={onSkip}
        >
          Skip this word
        </Button>
      </form>
    </div>
  );
};