import { auth } from "shared-core/firebase";

export default function Topbar({ title }) {
  return (
    <header className="bg-elma-white border-b border-elma-ink/10 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-elma-ink">{title}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-elma-ink/60">
            {auth.currentUser?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
