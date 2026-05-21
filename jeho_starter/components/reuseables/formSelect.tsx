import { cn } from "@/lib/utils";


interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: readonly { id: string; label: string; value: string }[]
  error?: string
  placeholder?: string
  registration: { [key: string]: unknown }
}

export function FormSelect({ label, options, error, registration, className, placeholder, ...props }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative group">
        <select
          {...registration}
          {...props}
          className={cn(
            "w-full p-4 pr-10 border-2 rounded-xl appearance-none bg-white cursor-pointer outline-none transition-all duration-200",
            error 
              ? "border-red-300 focus:border-red-500 bg-red-50/10" 
              : "border-gray-200 hover:border-gray-400 focus:border-[#2d7a7a]",
            "text-gray-900 placeholder:text-gray-400",
            className
          )}
          defaultValue=""
        >
          <option value="" disabled className="text-gray-400">
            {placeholder || "Select an option"}
          </option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 animate-in slide-in-from-top-1 font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  )
}
