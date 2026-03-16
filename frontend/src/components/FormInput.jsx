import { useState } from "react";

export default function FormInput({
                                      label,
                                      icon: Icon,
                                      type = "text",
                                      placeholder,
                                      value,
                                      onChange,
                                      error,
                                      hint,
                                      id,
                                  }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="space-y-1">
            <label
                htmlFor={id}
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1"
            >
                {label}
            </label>
            <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {Icon && <Icon size={18} />}
        </span>
                <input
                    id={id}
                    type={isPassword && !showPassword ? "password" : isPassword ? "text" : type}
                    className={`
            w-full pl-11 py-3 bg-slate-50 border rounded-xl
            focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            outline-none transition-all text-slate-900
            placeholder:text-slate-400 text-sm
            ${isPassword ? "pr-16" : "pr-4"}
            ${error ? "border-red-400 bg-red-50/40" : "border-slate-200"}
          `}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={
                        type === "email"
                            ? "email"
                            : type === "password"
                                ? "current-password"
                                : "off"
                    }
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] font-bold uppercase tracking-wide"
                        tabIndex={-1}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs ml-1 font-medium">{error}</p>
            )}
            {hint && !error && (
                <p className="text-slate-400 text-[11px] ml-1">{hint}</p>
            )}
        </div>
    );
}