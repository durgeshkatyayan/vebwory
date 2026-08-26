export function StatusBadge({ status }) {
  const colors = {
    "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
    "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Blocked": "bg-rose-100 text-rose-800 border-rose-200"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const colors = {
    "Low": "bg-slate-100 text-slate-700",
    "Medium": "bg-amber-100 text-amber-700",
    "High": "bg-orange-100 text-orange-700",
    "Urgent": "bg-red-100 text-red-700 font-bold animate-pulse"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${colors[priority] || "bg-gray-100"}`}>
      {priority}
    </span>
  );
}