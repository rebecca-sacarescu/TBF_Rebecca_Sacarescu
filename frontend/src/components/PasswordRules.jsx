import { validators, passwordRules } from "../utils/validators";

export default function PasswordRules({ password }) {
    if (!password) return null;

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 ml-1">
            {passwordRules.map((rule) => {
                const pass = validators.password[rule.key](password);
                return (
                    <div
                        key={rule.key}
                        className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                            pass ? "text-emerald-500" : "text-slate-400"
                        }`}
                    >
            <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white ${
                    pass ? "bg-emerald-500" : "bg-slate-200"
                }`}
            >
              {pass && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                  </svg>
              )}
            </span>
                        <span className={pass ? "font-medium" : ""}>{rule.label}</span>
                    </div>
                );
            })}
        </div>
    );
}