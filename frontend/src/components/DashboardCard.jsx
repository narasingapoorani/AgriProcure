export default function DashboardCard({ label, value, sub, accent = 'field' }) {
  const accentBar = {
    field: 'bg-field-600',
    harvest: 'bg-harvest-500',
    danger: 'bg-danger-600',
    sky: 'bg-sky-info',
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-md border border-husk-200 bg-husk-100 p-5 shadow-sm hover-lift">
      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} />
      <p className="text-sm font-medium text-soil-600/80">{label}</p>
      <p className="mt-2 font-data text-3xl font-bold tracking-tight text-field-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-soil-600/80">{sub}</p>}
    </div>
  );
}
