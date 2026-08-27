import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  PauseCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getDashboardMetrics } from '../services/api';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: 'Total Tasks',
      value: metrics?.total_tasks ?? 0,
      icon: Layers,
    },
    {
      title: 'Pending',
      value: metrics?.pending_tasks ?? 0,
      icon: Clock,
    },
    {
      title: 'In Progress',
      value: metrics?.in_progress_tasks ?? 0,
      icon: RefreshCw,
    },
    {
      title: 'Completed',
      value: metrics?.completed_tasks ?? 0,
      icon: CheckCircle2,
    },
    {
      title: 'Blocked',
      value: metrics?.blocked_tasks ?? 0,
      icon: PauseCircle,
    },
    {
      title: 'Overdue',
      value: metrics?.overdue_tasks ?? 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8 text-black dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Workspace analytics</p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Project Overview</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-2">Live metrics and task status aggregation across the workspace.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-black dark:text-white text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-black/15 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/20 dark:bg-black dark:shadow-none"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-black dark:bg-white" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">{card.title}</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight">
                    {loading ? '-' : card.value}
                  </p>
                </div>
                <div className="rounded-xl border border-black/15 bg-black/5 p-3 dark:border-white/20 dark:bg-white/10">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 h-px bg-black/10 dark:bg-white/15" />
              <p className="mt-3 text-xs text-black/50 dark:text-white/50">Updated from live workspace data</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};