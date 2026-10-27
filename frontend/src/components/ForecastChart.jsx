import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-husk-200 bg-husk-100/90 backdrop-blur-md p-3 shadow-lg text-sm text-soil-800">
        <p className="font-bold text-field-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-data font-semibold">
            {entry.name}: <span className="text-field-700">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ForecastAreaChart({ data, dataKey = 'farmers', xKey = 'hour' }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-field-600)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-field-600)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-husk-200)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--color-soil-600)' }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--color-soil-600)', fontFamily: 'var(--font-data)' }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-field-200)', strokeWidth: 2, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey={dataKey} name="Expected Farmers" stroke="var(--color-field-600)" strokeWidth={3} fill="url(#fillForecast)" activeDot={{ r: 6, fill: 'var(--color-field-800)', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function UtilizationBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-husk-200)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-soil-600)' }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--color-soil-600)', fontFamily: 'var(--font-data)' }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-husk-200)', opacity: 0.4 }} />
        <Bar dataKey="utilization" name="Capacity Used (%)" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.utilization > 100 ? 'var(--color-danger-600)' : entry.utilization > 90 ? 'var(--color-harvest-500)' : 'var(--color-field-600)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
