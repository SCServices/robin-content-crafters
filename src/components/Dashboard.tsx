import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ContentStats } from "@/lib/types";
import { BarChart, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface DashboardProps {
  stats: ContentStats;
}

const Dashboard = ({ stats }: DashboardProps) => {
  const progress = (stats.generated / stats.total) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Content Generation Progress</h2>
          <span className="text-neutral-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
            <BarChart className="text-primary" />
            <div>
              <p className="text-sm text-neutral-500">Total</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-success-light rounded-lg">
            <CheckCircle className="text-success" />
            <div>
              <p className="text-sm text-neutral-500">Generated</p>
              <p className="text-xl font-semibold">{stats.generated}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-primary-light rounded-lg">
            <Clock className="text-primary" />
            <div>
              <p className="text-sm text-neutral-500">Pending</p>
              <p className="text-xl font-semibold">{stats.pending}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-secondary-light rounded-lg">
            <AlertCircle className="text-secondary" />
            <div>
              <p className="text-sm text-neutral-500">Failed</p>
              <p className="text-xl font-semibold">{stats.error}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;