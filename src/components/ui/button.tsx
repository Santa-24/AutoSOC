import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-mono tracking-wider",
    md: "px-4 py-2.5 text-xs font-mono tracking-wider",
    lg: "px-6 py-3.5 text-sm font-mono tracking-widest uppercase",
  };

  const variantClasses = {
    primary:
      "bg-lime-500 text-charcoal-950 font-bold hover:bg-lime-400 active:bg-lime-600 border border-lime-500 hover:shadow-[0_0_15px_rgba(199,243,107,0.3)]",
    secondary:
      "bg-charcoal-800 text-ivory-100 font-medium hover:bg-charcoal-750 active:bg-charcoal-850 border border-charcoal-700 hover:border-charcoal-600",
    danger:
      "bg-[#3D1414] text-[#FF8585] font-semibold hover:bg-[#521A1A] active:bg-[#2E1111] border border-[#6E2222] hover:shadow-[0_0_15px_rgba(255,71,71,0.25)]",
    ghost:
      "bg-transparent text-ivory-300 hover:text-ivory-100 hover:bg-charcoal-850 border border-transparent hover:border-charcoal-700",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>PROCESSING...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
