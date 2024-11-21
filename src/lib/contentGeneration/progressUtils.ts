import { toast } from "sonner";

export const calculateTotalItems = (servicesCount: number, locationsCount: number) => {
  // For each service: 1 service page + (1 location page + 5 blog posts) per location
  return servicesCount * (1 + locationsCount * 6);
};

export const updateProgress = (
  completedItems: number,
  totalItems: number,
  setProgress: (progress: number) => void,
  toastId: string
) => {
  const progress = Math.round((completedItems / totalItems) * 100);
  setProgress(80 + (completedItems / totalItems) * 20);
  toast.loading(`Generating content: ${progress}% complete...`, { id: toastId });
};