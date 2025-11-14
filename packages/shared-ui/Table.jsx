// packages/shared-ui/Table.jsx

import React from "react";
import clsx from "clsx";

/** Root table */
export function Table({ className, children }) {
  return (
    <div className={clsx("w-full overflow-x-auto rounded-xl2 border border-gray-200 bg-white shadow-soft", className)}>
      <table className="w-full text-left text-sm text-elma-ink">{children}</table>
    </div>
  );
}

/** Header wrapper (thead) */
export function TableHeader({ className, children }) {
  return <thead className={clsx("bg-elma-white", className)}>{children}</thead>;
}

/** Body wrapper (tbody) */
export function TableBody({ className, children }) {
  return <tbody className={clsx("", className)}>{children}</tbody>;
}

/** Row (tr) */
export function TableRow({ className, children }) {
  return <tr className={clsx("border-b last:border-0 hover:bg-gray-50/60", className)}>{children}</tr>;
}

/** Head cell (th) */
export function TableHead({ className, children, align = "left" }) {
  return (
    <th
      className={clsx(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </th>
  );
}

/** Data cell (td) */
export function TableCell({ className, children, align = "left" }) {
  return (
    <td
      className={clsx(
        "px-4 py-3 text-sm",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
}
