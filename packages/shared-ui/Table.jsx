export default function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-elma-ink/5 border-b border-elma-ink/10">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-elma-ink/10">{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return <tr className={`hover:bg-elma-ink/5 ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-sm font-semibold text-elma-ink ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-sm text-elma-ink/80 ${className}`}>
      {children}
    </td>
  );
}
