import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Payouts", path: "/payouts", icon: "💰" },
  { name: "Revenue", path: "/revenue", icon: "📈" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-elma-ink text-elma-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-elma-purple to-elma-pink bg-clip-text text-transparent">
          ELMA Admin
        </h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl2 transition-all ${
                isActive
                  ? "bg-elma-purple text-elma-white"
                  : "text-elma-white/70 hover:bg-elma-white/10"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
