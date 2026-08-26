const variants = {
  primary: 'bg-black hover:bg-white hover:text-black text-white border border-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white',
  secondary: 'bg-white hover:bg-black hover:text-white text-black border border-black dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black',
  danger: 'bg-black hover:bg-white hover:text-black text-white border border-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white',
  outline: 'bg-transparent hover:bg-black hover:text-white text-black border border-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black',
  ghost: 'bg-transparent hover:bg-black hover:text-white text-black dark:text-white dark:hover:bg-white dark:hover:text-black',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      )}
      {children}
    </button>
  );
};