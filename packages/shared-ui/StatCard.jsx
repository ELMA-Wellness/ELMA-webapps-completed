export default function StatCard({ 
  title, 
  value, 
  icon, 
  loading = false,
  className = "" 
}) {
  return (
    <div className={`bg-elma-white rounded-xl2 shadow-soft p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-elma-ink/60 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-elma-ink/10 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-elma-ink">{value}</p>
          )}
        </div>
        {icon && (
          <div className="text-elma-purple text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
