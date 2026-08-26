 

const statusStyles = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Progress': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const priorityStyles = {
  Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  High: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Urgent: 'bg-rose-600/20 text-rose-400 border-rose-600/40 font-semibold',
};

export const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const style = priorityStyles[priority] || 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {priority}
    </span>
  );
};