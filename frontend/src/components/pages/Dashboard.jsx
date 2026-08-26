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
    // This effect starts an async request; state updates happen when it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: 'Total Tasks',
      value: metrics?.total_tasks ?? 0,
      icon: Layers,
      color: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Pending',
      value: metrics?.pending_tasks ?? 0,
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    },
    {
      title: 'In Progress',
      value: metrics?.in_progress_tasks ?? 0,
      icon: RefreshCw,
      color: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20',
    },
    {
      title: 'Completed',
      value: metrics?.completed_tasks ?? 0,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Blocked',
      value: metrics?.blocked_tasks ?? 0,
      icon: PauseCircle,
      color: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
    },
    {
      title: 'Overdue',
      value: metrics?.overdue_tasks ?? 0,
      icon: AlertTriangle,
      color: 'from-red-600/30 to-red-700/10 text-red-400 border-red-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Project Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Live metrics and task status aggregation across the workspace.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 backdrop-blur-sm ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{card.title}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-100">
                    {loading ? '-' : card.value}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};