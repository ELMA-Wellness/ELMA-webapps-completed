export default function Card({ children, className = "", ...props }) {
  return (
    <div 
      className={`bg-elma-white rounded-xl2 shadow-soft p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
