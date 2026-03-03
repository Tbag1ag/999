
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const lineData = [
  { name: '2024', revenue: 1.4, occupancy: 85, vacancy: 25, effectiveRent: 1.42 },
  { name: 'Feb', revenue: 1.45, occupancy: 86, vacancy: 22, effectiveRent: 1.43 },
  { name: 'Mar', revenue: 1.42, occupancy: 84, vacancy: 28, effectiveRent: 1.41 },
  { name: 'Apr', revenue: 1.48, occupancy: 87, vacancy: 20, effectiveRent: 1.45 },
  { name: 'May', revenue: 1.52, occupancy: 88, vacancy: 18, effectiveRent: 1.48 },
  { name: 'Jun', revenue: 1.50, occupancy: 87, vacancy: 21, effectiveRent: 1.47 },
  { name: 'Jul', revenue: 1.55, occupancy: 89, vacancy: 15, effectiveRent: 1.50 },
  { name: 'Aug', revenue: 1.60, occupancy: 90, vacancy: 12, effectiveRent: 1.52 },
  { name: 'Sep', revenue: 1.58, occupancy: 89, vacancy: 14, effectiveRent: 1.51 },
  { name: 'Oct', revenue: 1.62, occupancy: 91, vacancy: 10, effectiveRent: 1.54 },
  { name: 'Nov', revenue: 1.65, occupancy: 92, vacancy: 8, effectiveRent: 1.56 },
  { name: 'Dec', revenue: 1.70, occupancy: 93, vacancy: 7, effectiveRent: 1.58 },
  { name: '2025', revenue: 1.75, occupancy: 94, vacancy: 6, effectiveRent: 1.60 },
  { name: 'Feb', revenue: 1.78, occupancy: 95, vacancy: 5, effectiveRent: 1.62 },
];

const scatterData = Array.from({ length: 100 }, () => ({
  x: Math.random() * 10,
  y: Math.random() * 10,
  z: Math.random() * 100
}));

const barData = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 200 },
  { name: 'D', value: 500 },
  { name: 'E', value: 100 },
  { name: 'F', value: 250 },
  { name: 'G', value: 150 },
];

const areaData = [
  { name: '2024', value: 10 },
  { name: '2025', value: 80 },
];

const MetricCard = ({ title, value, change, suffix = "" }: { title: string, value: string, change: string, suffix?: string }) => {
  const isPositive = change.startsWith('+') || !change.startsWith('-');
  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}<span className="text-lg ml-1 font-medium text-slate-400">{suffix}</span></h3>
        <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {change}
        </span>
      </div>
    </div>
  );
};

const MarketDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Vacant" value="20,000" suffix="ft²" change="8%" />
        <MetricCard title="Vacancy loss" value="$15,800" suffix="/mo" change="-12%" />
        <MetricCard title="Leases due in 6 mo" value="6" suffix="leases" change="12%" />
        <MetricCard title="Avg. lease term remaining" value="3.4" suffix="years" change="+0.2" />
        <MetricCard title="Tenant stability" value="84" suffix="%" change="+5%" />
        <MetricCard title="NOI margin" value="68" suffix="%" change="+2%" />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Behavior</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revenue, $</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Occupancy</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Vacancy</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400" /> Effective Rent</div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {['Year', '2 years', '5 years'].map(t => (
                <button key={t} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${t === '2 years' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vacancy" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="effectiveRent" stroke="#94a3b8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Smaller Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio Trendline */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Portfolio Trendline</h4>
            <select className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-md px-2 py-1 outline-none"><option>2 years</option></select>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis type="number" dataKey="x" hide />
                <YAxis type="number" dataKey="y" hide />
                <ZAxis type="number" dataKey="z" range={[10, 40]} />
                <Scatter data={scatterData} fill="#3b82f6" opacity={0.4} />
                <Line type="monotone" data={lineData} dataKey="revenue" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenant Concentration */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tenant Concentration</h4>
            <select className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-md px-2 py-1 outline-none"><option>2 years</option></select>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market vs Actual */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Market vs Actual</h4>
            <select className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-md px-2 py-1 outline-none"><option>2 years</option></select>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Expense Breakdown (OpEx)</h4>
          <div className="space-y-4">
            {[
              { label: 'Property Taxes', value: 31, color: 'bg-slate-400' },
              { label: 'Insurance', value: 20, color: 'bg-blue-500' },
              { label: 'Utilities', value: 18, color: 'bg-emerald-500' },
              { label: 'Repairs & Maintenance', value: 14, color: 'bg-rose-500' },
              { label: 'Security', value: 11, color: 'bg-purple-500' },
              { label: 'Other', value: 6, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900 dark:text-white">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
