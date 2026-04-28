import { useState } from "react";
import BoardingPassLayout, { Barcode } from "../components/BoardingPassLayout";
import FormInput from "../components/FormInput";
import PasswordRules from "../components/PasswordRules";
import { MailIcon, LockIcon, PersonIcon, ArrowIcon } from "../components/Icons";
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

// ─── Raised button — sand/warm variant for signup ─────────────────────────────
function RaisedButton({ onClick, disabled, loading, children }) {
    const shadow     = `0 5px 0 #8a6e3a, 0 8px 20px rgba(165,147,123,0.28)`;
    const shadowDown = `0 1px 0 #8a6e3a`;
    const down = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = shadowDown; } };
    const up   = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = shadow; } };
    return (
        <button
            onClick={onClick} disabled={disabled}
            onMouseDown={down} onMouseUp={up} onMouseLeave={up}
            style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "999px",
                fontFamily: SANS, fontWeight: 700, fontSize: "13px", letterSpacing: "0.04em",
                background: `linear-gradient(180deg, ${C.sand} 0%, #d4a96a 50%, #c49550 100%)`,
                color: "#3d2800",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: shadow,
                transform: "translateY(0)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "opacity 0.15s ease",
            }}
        >
            {loading ? (
                <>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#3d2800", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    Booking...
                </>
            ) : children}
        </button>
    );
}

// ─── Stub ─────────────────────────────────────────────────────────────────────
function SignupStub() {
    return (
        <>
            <div style={{ width: "100%" }}>
                {/* Ticket icon */}
                <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: C.beigeLight, margin: "0 auto 10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 0 #bfb9b4`,
                    border: `1px solid ${C.tanBorder}`,
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={C.grayWarm}>
                        <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                    </svg>
                </div>
                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 3px" }}>
                    Flight Ref
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "14px", color: C.grayWarm, margin: "0 0 12px", lineHeight: 1.2 }}>
                    TB-NEW
                </p>
                <div style={{ borderBottom: `1px solid ${C.tanBorder}`, paddingBottom: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>From</p>
                            <p style={{ fontFamily: SERIF, fontSize: "14px", color: C.lavender, margin: 0 }}>NEW</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={C.tan} style={{ marginBottom: "3px", opacity: 0.6 }}>
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                        </svg>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>To</p>
                            <p style={{ fontFamily: SERIF, fontSize: "14px", color: C.grayWarm, margin: 0 }}>PRO</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ margin: "auto 0", padding: "12px 0" }}>
                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 3px" }}>
                    Status
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: "0 0 4px", lineHeight: 1 }}>Ready</p>
                <p style={{ fontFamily: SANS, fontSize: "10px", color: C.tan, margin: 0, opacity: 0.70 }}>
                    Your boarding pass awaits
                </p>
            </div>
            <Barcode code="TB-REG-FIRST-FLIGHT" />
        </>
    );
}

// ─── SignupPage ───────────────────────────────────────────────────────────────
export default function SignupPage({ onNavigate }) {
    const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
    const [errors,   setErrors]   = useState({});
    const [apiError, setApiError] = useState("");
    const [loading,  setLoading]  = useState(false);

    const setField = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        setErrors((p) => ({ ...p, [field]: "" }));
        setApiError("");
    };

    const validate = () => {
        const e = {};
        if (!form.email)                             e.email    = "Email is required";
        else if (!validators.email(form.email))      e.email    = "Enter a valid email address";
        if (!form.username)                          e.username = "Username is required";
        else if (!validators.username(form.username)) e.username = "Only letters, numbers, dots, dashes, underscores (3-30 chars)";
        if (!form.password)                          e.password = "Password is required";
        else if (!validators.password.all(form.password)) e.password = "Password doesn't meet all requirements";
        if (!form.confirmPassword)                   e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setApiError("");
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.signup({ email: form.email, username: form.username, password: form.password });
            TokenService.setToken(res.token);
            onNavigate("create-profile");
        } catch (err) {
            setApiError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <BoardingPassLayout
            stub={<SignupStub />}
            footerLinkText="Already have an account?"
            footerLink="Check-In"
            onFooterClick={() => onNavigate("login")}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
                <div>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan }}>
                        Boarding Pass
                    </span>
                    <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem,4vw,2.2rem)", color: C.grayWarm, margin: "4px 0 6px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        New Journey
                    </h1>
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>
                        Complete your passenger profile to get your boarding pass
                    </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>Class</p>
                    <p style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, margin: 0 }}>First Class</p>
                </div>
            </div>

            {/* API error */}
            {apiError && (
                <div style={{ background: C.errorBg, border: `1px solid ${C.error}22`, borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", fontFamily: SANS, fontSize: "13px", color: C.error }}>
                    {apiError}
                </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <FormInput id="signup-email"    label="Contact Email"            icon={MailIcon}   type="email"    placeholder="passenger@skyhigh.com"    value={form.email}           onChange={setField("email")}           error={errors.email} />
                    <FormInput id="signup-username" label="Passenger Name (username)" icon={PersonIcon} type="text"     placeholder="johndoe"                  value={form.username}        onChange={setField("username")}        error={errors.username} hint="Letters, numbers, dots, dashes, underscores" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <div>
                        <FormInput id="signup-password" label="Secure Access Pin" icon={LockIcon} type="password" placeholder="••••••••••••" value={form.password} onChange={setField("password")} error={errors.password} />
                        <PasswordRules password={form.password} />
                    </div>
                    <FormInput id="signup-confirm" label="Confirm Access Pin" icon={LockIcon} type="password" placeholder="••••••••••••" value={form.confirmPassword} onChange={setField("confirmPassword")} error={errors.confirmPassword} />
                </div>

                {/* Bottom bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderTop: `1px solid ${C.tanBorder}`, paddingTop: "16px", marginTop: "4px",
                }}>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {[["Gate", "B24"], ["Seat", "01A"], ["Boarding", "Now"]].map(([lbl, val]) => (
                            <div key={lbl}>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>{lbl}</p>
                                <p style={{ fontFamily: SERIF, fontSize: "18px", color: C.grayWarm, margin: 0, lineHeight: 1 }}>{val}</p>
                            </div>
                        ))}
                    </div>
                    <RaisedButton onClick={handleSubmit} disabled={loading} loading={loading}>
                        {!loading && (
                            <>
                                Book Flight
                                <ArrowIcon size={16} />
                            </>
                        )}
                    </RaisedButton>
                </div>
            </div>
        </BoardingPassLayout>
    );
}