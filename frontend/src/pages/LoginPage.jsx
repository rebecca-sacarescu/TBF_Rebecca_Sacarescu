import { useState } from "react";
import BoardingPassLayout, { Barcode } from "../components/BoardingPassLayout";
import FormInput from "../components/FormInput";
import { MailIcon, LockIcon, ArrowIcon, SpinnerIcon } from "../components/Icons";
import { validators } from "../utils/validators";
import authApi, { parseBackendError } from "../services/authApi";
import TokenService from "../services/tokenService";

const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    error:      "#ba1a1a",
    errorBg:    "#ffdad6",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

function RaisedButton({ onClick, disabled, loading, children }) {
    const down = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; } };
    const up   = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.22)`; } };
    return (
        <button
            onClick={onClick} disabled={disabled}
            onMouseDown={down} onMouseUp={up} onMouseLeave={up}
            style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "999px",
                fontFamily: SANS, fontWeight: 700, fontSize: "13px", letterSpacing: "0.04em",
                background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`,
                color: C.beigeLight,
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.22)`,
                transform: "translateY(0)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "opacity 0.15s ease",
            }}
        >
            {loading ? (
                <>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.beigeLight, animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    Checking in...
                </>
            ) : children}
        </button>
    );
}

function LoginStub() {
    return (
        <>
            <Barcode code="TB-992-LOGIN" />
            <div style={{ margin: "auto 0", padding: "16px 0" }}>
                <div style={{ marginBottom: "12px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={C.tan}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.27 15.58l-1.54-3.77-3.77-1.54 8.69-3.38-3.38 8.69z" />
                    </svg>
                </div>
                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: "0 0 4px" }}>
                    Destination
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "22px", color: C.grayWarm, margin: "0 0 2px", lineHeight: 1.1 }}>
                    Adventure
                </p>
            </div>
            <div style={{ width: "100%", borderTop: `1px solid ${C.tanBorder}`, paddingTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                        <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>Boarding</p>
                        <p style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, margin: 0 }}>Now</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>Zone</p>
                        <p style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, margin: 0 }}>Priority</p>
                    </div>
                </div>
                <p style={{ fontFamily: SANS, fontStyle: "italic", fontSize: "10px", color: C.tan, lineHeight: 1.5, margin: 0, opacity: 0.75 }}>
                    "The journey of a thousand miles begins with a single click."
                </p>
            </div>
        </>
    );
}

export default function LoginPage({ onNavigate }) {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [errors,   setErrors]   = useState({});
    const [apiError, setApiError] = useState("");
    const [loading,  setLoading]  = useState(false);

    const validate = () => {
        const e = {};
        if (!email)                         e.email    = "Email is required";
        else if (!validators.email(email))  e.email    = "Enter a valid email address";
        if (!password)                      e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setApiError("");
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            TokenService.setToken(res.token);
            onNavigate("check-profile");
        } catch (err) {
            setApiError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <BoardingPassLayout
            stub={<LoginStub />}
            footerLinkText="Don't have an account?"
            footerLink="Sign Up"
            onFooterClick={() => onNavigate("signup")}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan }}>
                        Boarding Pass
                    </span>
                    <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem,4vw,2.2rem)", color: C.grayWarm, margin: "4px 0 6px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>
                        Check-in to your account to continue your journey
                    </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>Class</p>
                    <p style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, margin: 0 }}>Economy</p>
                </div>
            </div>

            {apiError && (
                <div style={{ background: C.errorBg, border: `1px solid ${C.error}22`, borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontFamily: SANS, fontSize: "13px", color: C.error }}>
                    {apiError}
                </div>
            )}

            <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
                {[["Gate", "01"], ["Seat", "1A"], ["Boarding", "Now"]].map(([lbl, val]) => (
                    <div key={lbl}>
                        <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>{lbl}</p>
                        <p style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: 0, lineHeight: 1 }}>{val}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                    <FormInput
                        id="login-email" label="Email Address" icon={MailIcon}
                        type="email" placeholder="passenger@travelbuddy.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                        error={errors.email}
                    />
                    <FormInput
                        id="login-password" label="Password" icon={LockIcon}
                        type="password" placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                        error={errors.password}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                    <RaisedButton onClick={handleSubmit} disabled={loading} loading={loading}>
                        {!loading && (
                            <>
                                Check-In
                                <ArrowIcon size={16} />
                            </>
                        )}
                    </RaisedButton>
                </div>
            </div>
        </BoardingPassLayout>
    );
}