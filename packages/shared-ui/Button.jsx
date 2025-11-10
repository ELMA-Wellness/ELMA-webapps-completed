export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-elma-purple text-elma-white hover:opacity-90 focus:ring-elma-purple",
    secondary: "bg-elma-pink text-elma-ink hover:opacity-90 focus:ring-elma-pink",
    outline: "border-2 border-elma-purple text-elma-purple hover:bg-elma-purple hover:text-elma-white focus:ring-elma-purple",
    ghost: "text-elma-ink hover:bg-elma-white/50",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
