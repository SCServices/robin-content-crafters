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
      <Card className="p-8 bg-white/50 backdrop-blur-sm border border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Content Generation Progress
            </h2>
            <p className="text-neutral-600">Track your content creation journey</p>
          </div>
          <span className="text-2xl font-bold text-primary">
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group p-6 bg-white rounded-xl border border-neutral-100 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg group-hover:bg-primary-light transition-colors">
                <BarChart className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="group p-6 bg-white rounded-xl border border-neutral-100 transition-all duration-200 hover:border-success/20 hover:shadow-lg hover:shadow-success/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg group-hover:bg-success-light transition-colors">
                <CheckCircle className="text-success w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Generated</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.generated}</p>
              </div>
            </div>
          </div>
          
          <div className="group p-6 bg-white rounded-xl border border-neutral-100 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg group-hover:bg-primary-light transition-colors">
                <Clock className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="group p-6 bg-white rounded-xl border border-neutral-100 transition-all duration-200 hover:border-secondary/20 hover:shadow-lg hover:shadow-secondary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg group-hover:bg-secondary-light transition-colors">
                <AlertCircle className="text-secondary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Failed</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.error}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;