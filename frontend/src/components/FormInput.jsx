import { useState } from "react";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.30)",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    error:      "#ba1a1a",
};
const SANS = "'DM Sans', sans-serif";

export default function FormInput({
                                      label, icon: Icon, type = "text",
                                      placeholder, value, onChange, error, hint, id,
                                  }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const handleFocus = (e) => {
        e.currentTarget.style.borderColor = C.lavender;
        e.currentTarget.style.boxShadow   = `0 0 0 3px rgba(175,154,201,0.18)`;
    };
    const handleBlur = (e) => {
        e.currentTarget.style.borderColor = error ? C.error : C.tanBorder;
        e.currentTarget.style.boxShadow   = "none";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontFamily: SANS }}>
            <label htmlFor={id} style={{
                fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.16em",
                color: C.tan, marginLeft: "2px",
            }}>
                {label}
            </label>

            <div style={{ position: "relative" }}>
                {Icon && (
                    <span style={{
                        position: "absolute", left: "13px",
                        top: "50%", transform: "translateY(-50%)",
                        color: C.tan, display: "flex", alignItems: "center",
                        pointerEvents: "none",
                    }}>
                        <Icon size={16} />
                    </span>
                )}

                <input
                    id={id}
                    type={isPassword && !showPassword ? "password" : isPassword ? "text" : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete={
                        type === "email" ? "email"
                            : type === "password" ? "current-password"
                                : "off"
                    }
                    style={{
                        width: "100%",
                        padding: `11px ${isPassword ? "52px" : "14px"} 11px ${Icon ? "40px" : "14px"}`,
                        background: C.beigeMid,
                        border: `1.5px solid ${error ? C.error : C.tanBorder}`,
                        borderRadius: "12px",
                        fontFamily: SANS,
                        fontSize: "14px",
                        fontWeight: 400,
                        color: C.dark,
                        outline: "none",
                        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                        boxSizing: "border-box",
                    }}
                />

                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        style={{
                            position: "absolute", right: "13px",
                            top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer",
                            fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                            textTransform: "uppercase", letterSpacing: "0.10em",
                            color: C.tan,
                        }}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                )}
            </div>

            {error && (
                <p style={{ fontFamily: SANS, fontSize: "11px", color: C.error, margin: "0 0 0 2px" }}>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p style={{ fontFamily: SANS, fontSize: "11px", color: C.tan, opacity: 0.70, margin: "0 0 0 2px" }}>
                    {hint}
                </p>
            )}
        </div>
    );
}