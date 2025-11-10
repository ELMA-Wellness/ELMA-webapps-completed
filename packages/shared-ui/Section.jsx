export default function Section({ title, children, className = "" }) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-elma-ink mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}
