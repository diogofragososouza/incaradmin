import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  colorClass?: string;
}

export default function MetricCard({ title, value, icon, description, colorClass = "from-blue-600/20 to-indigo-600/20 text-blue-400" }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition duration-300">
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${colorClass} opacity-10 blur-xl`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`p-2 rounded-xl bg-slate-800 border border-slate-700`}>
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-mono">{description}</p>
        )}
      </div>
    </div>
  );
}
