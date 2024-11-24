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
  // Original words
  "content", "marketing", "strategy", "business", "success", "digital", "growth", "brand",
  // Additional marketing terms
  "advertising", "analytics", "audience", "automation", "benchmark", "branding", "campaign",
  "conversion", "demographic", "engagement", "funnel", "impression", "influencer", "keyword",
  "lead", "metrics", "optimization", "organic", "outreach", "persona", "positioning",
  "promotion", "retention", "revenue", "roi", "segmentation", "seo", "social",
  "targeting", "traffic", "viral", "visibility", "acquisition", "advocacy", "affiliate",
  "analytics", "attribution", "awareness", "b2b", "b2c", "backlink", "bounce",
  "channel", "click", "competitor", "conversion", "copywriting", "crm", "customer",
  "data", "email", "engagement", "experience", "followers", "hashtag", "inbound",
  "kpi", "landing", "lifecycle", "loyalty", "market", "media", "newsletter",
  "outbound", "ppc", "reach", "referral", "remarketing", "responsive", "sales",
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
            <div className="flex flex-col gap-4">
              <div className="mt-4">
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  While you wait...
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Test your marketing knowledge! Unscramble these marketing terms while your content is being generated. 
                  Each correct answer earns you points. Can you beat the clock?
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-700">Generation Progress</span>
                <span className="text-sm text-primary font-medium">Score: {score}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
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