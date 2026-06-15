import { validators, passwordRules } from "../utils/validators";

const C = {
    tan:      "#A5937B",
    lavender: "#AF9AC9",
    dark:     "#3a3737",
};
const SANS = "'DM Sans', sans-serif";

export default function PasswordRules({ password }) {
    if (!password) return null;
    return (
        <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "6px 16px", marginTop: "8px", marginLeft: "2px",
            fontFamily: SANS,
        }}>
            {passwordRules.map((rule) => {
                const pass = validators.password[rule.key](password);
                return (
                    <div key={rule.key} style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        fontSize: "11px",
                        color: pass ? C.lavender : C.tan,
                        opacity: pass ? 1 : 0.55,
                        transition: "all 0.2s ease",
                    }}>
                        <span style={{
                            width: "14px", height: "14px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            background: pass ? C.lavender : "rgba(165,147,123,0.20)",
                            transition: "background 0.2s ease",
                        }}>
                            {pass && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            )}
                        </span>
                        <span style={{ fontWeight: pass ? 600 : 400 }}>{rule.label}</span>
                    </div>
                );
            })}
        </div>
    );
}