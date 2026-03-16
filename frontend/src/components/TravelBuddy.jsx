import { useState, useCallback } from "react";

// ─── Validation rules (mirror your Spring Boot DTO constraints) ───────────────

const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
const PASSWORD_RULES = [
    { id: "length",    label: "At least 8 characters",          test: v => v.length >= 8 },
    { id: "uppercase", label: "One uppercase letter (A–Z)",      test: v => /[A-Z]/.test(v) },
    { id: "lowercase", label: "One lowercase letter (a–z)",      test: v => /[a-z]/.test(v) },
    { id: "number",    label: "One number (0–9)",                test: v => /[0-9]/.test(v) },
    { id: "special",   label: "One special character (!@#$…)",   test: v => /[^a-zA-Z0-9]/.test(v) },
];

function validateUsername(value) {
    if (!value) return "Username is required.";
    if (value.length < 3) return "Username must be at least 3 characters.";
    if (!USERNAME_REGEX.test(value)) return "Only letters, numbers, dots, hyphens and underscores allowed.";
    return null;
}

function validateEmail(value) {
    if (!value) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
    return null;
}

function validatePassword(value, isSignup) {
    if (!value) return "Password is required.";
    if (isSignup && PASSWORD_RULES.some(r => !r.test(value))) return "Password does not meet all requirements.";
    return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Barcode = () => {
    const bars = [3,1,4,1,5,2,3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,3,2,1,3,4,2,1,3,2,1,4,3,1,2];
    return (
        <div className="flex items-end gap-px mt-4 mb-1" style={{ height: "48px" }}>
            {bars.map((h, i) => (
                <div key={i} className="bg-slate-800" style={{ width: i % 3 === 0 ? "3px" : "2px", height: `${h * 8 + 8}px`, opacity: 0.85 }} />
            ))}
        </div>
    );
};

const InputField = ({ label, type, value, onChange, onBlur, placeholder, error, touched }) => {
    const borderColor = touched && error ? "#e05252" : "#d1dce8";
    return (
        <div className="mb-1">
            <label className="block text-xs font-semibold tracking-widest uppercase mb-1"
                   style={{ color: "#7c8fa6", fontFamily: "'DM Mono', monospace" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="w-full border-b-2 bg-transparent pb-2 pt-1 text-sm outline-none transition-all duration-200"
                style={{ borderColor, color: "#1e2d3d", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem" }}
                onFocus={e => (e.target.style.borderColor = touched && error ? "#e05252" : "#3b7dd8")}
            />
            <div style={{ minHeight: "18px" }}>
                {touched && error && (
                    <p className="text-xs mt-1" style={{ color: "#e05252", fontFamily: "'DM Mono', monospace" }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

/** Live password requirements checklist — only shown on signup while the field has content */
const PasswordChecklist = ({ value, visible }) => {
    if (!visible) return null;
    return (
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: "#f0f6ff", border: "1px solid #d1dce8" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2"
               style={{ color: "#8fa8c4", fontFamily: "'DM Mono', monospace" }}>
                Password requirements
            </p>
            <ul className="space-y-1">
                {PASSWORD_RULES.map(rule => {
                    const ok = rule.test(value);
                    return (
                        <li key={rule.id} className="flex items-center gap-2 text-xs"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: ok ? "#2a7d4f" : "#7c8fa6" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700 }}>{ok ? "✓" : "○"}</span>
                            {rule.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

/** Red banner for errors returned by the Spring Boot backend */
const ServerErrorBanner = ({ errors }) => {
    if (!errors || errors.length === 0) return null;
    return (
        <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: "#fff0f0", border: "1px solid #f5c0c0" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1"
               style={{ color: "#c0392b", fontFamily: "'DM Mono', monospace" }}>
                Boarding Denied
            </p>
            <ul className="space-y-0.5">
                {errors.map((msg, i) => (
                    <li key={i} className="text-xs" style={{ color: "#c0392b", fontFamily: "'DM Sans', sans-serif" }}>
                        {msg}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TravelBuddy() {
    const [mode, setMode]         = useState("login");
    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");

    // Track which fields the user has left so we only show errors after they've been touched
    const [touched, setTouched] = useState({});

    // Errors surfaced by the Spring Boot backend (400 / 401 / 409…)
    const [serverErrors, setServerErrors] = useState([]);

    // Loading state while awaiting the API response
    const [loading, setLoading] = useState(false);

    const isLogin = mode === "login";

    // ── Derived client-side errors ──────────────────────────────────────────────
    const clientErrors = {
        username: !isLogin ? validateUsername(username) : null,
        email:    validateEmail(email),
        password: validatePassword(password, !isLogin),
    };

    const isClientValid = Object.values(clientErrors).every(e => e === null);

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const touch    = field => setTouched(prev => ({ ...prev, [field]: true }));
    const touchAll = ()    => setTouched({ username: true, email: true, password: true });

    const resetForm = () => {
        setUsername(""); setEmail(""); setPassword("");
        setTouched({}); setServerErrors([]);
    };

    const handleToggle = () => {
        setMode(isLogin ? "signup" : "login");
        resetForm();
    };

    // ── Submit handler ───────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        touchAll();
        if (!isClientValid) return;

        setLoading(true);
        setServerErrors([]);

        try {
            // 1. Modificăm URL-urile pentru a bate exact spre Spring Boot-ul tău local
            const baseUrl = "http://localhost:8080";
            const endpoint = isLogin ? `${baseUrl}/auth/login` : `${baseUrl}/auth/signup`;

            const body = isLogin
                ? { email, password }
                : { username, email, password };

            const res = await fetch(endpoint, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });

            if (res.ok) {
                // 2. Extragem JSON-ul (AuthResponseDto)
                const data = await res.json();
                console.log("Success:", data);

                // 3. Salvăm token-ul primit în LocalStorage
                if (data.token) {
                    localStorage.setItem("jwt_token", data.token);
                }

                // 4. Opțional: Afișăm un mesaj și pregătim redirecționarea
                alert(isLogin ? "Autentificare reușită!" : "Cont creat cu succes!");

                // Când vei avea pagina de profil gata, vei decomenta linia de mai jos:
                // window.location.href = "/profile";

                return;
            }

            // ───────────────────────────────────────────────────────────────────────
            // Logica de erori rămâne exact la fel, prinde erorile aruncate de Spring
            // ───────────────────────────────────────────────────────────────────────
            if (res.status === 400) {
                const data = await res.json().catch(() => null);
                if (data?.errors && Array.isArray(data.errors)) {
                    setServerErrors(data.errors.map(e => e.message ?? String(e)));
                } else if (data?.message) {
                    setServerErrors([data.message]);
                } else if (typeof data === "string") {
                    setServerErrors([data]);
                } else {
                    setServerErrors(["Invalid request. Please check your details."]);
                }
            } else if (res.status === 401 || res.status === 403) {
                setServerErrors(["Incorrect email or password."]);
            } else if (res.status === 409) {
                setServerErrors(["An account with this email already exists."]);
            } else {
                setServerErrors(["Something went wrong on our end. Please try again."]);
            }
        } catch {
            setServerErrors(["Unable to reach the server. Check your connection."]);
        } finally {
            setLoading(false);
        }
    }, [isLogin, isClientValid, username, email, password]);

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        body { margin: 0; }

        .topo-bg {
          background-color: #dce8f5;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(120,160,220,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(90,130,200,0.13) 0%, transparent 55%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:none;stroke:%23a8c0dc;stroke-width:0.7;opacity:0.45%7D%3C/style%3E%3C/defs%3E%3Cellipse class='c' cx='200' cy='200' rx='60' ry='30'/%3E%3Cellipse class='c' cx='200' cy='200' rx='90' ry='50'/%3E%3Cellipse class='c' cx='200' cy='200' rx='120' ry='72'/%3E%3Cellipse class='c' cx='200' cy='200' rx='155' ry='97'/%3E%3Cellipse class='c' cx='200' cy='200' rx='190' ry='124'/%3E%3Cellipse class='c' cx='80' cy='80' rx='50' ry='25'/%3E%3Cellipse class='c' cx='80' cy='80' rx='80' ry='45'/%3E%3Cellipse class='c' cx='320' cy='320' rx='55' ry='28'/%3E%3Cellipse class='c' cx='320' cy='320' rx='85' ry='50'/%3E%3Cellipse class='c' cx='340' cy='60' rx='45' ry='22'/%3E%3Cellipse class='c' cx='340' cy='60' rx='75' ry='40'/%3E%3C/svg%3E");
          background-size: auto, auto, 400px 400px;
        }
        .card-shadow {
          box-shadow: 0 8px 24px rgba(30,60,120,0.10), 0 24px 64px rgba(30,60,120,0.12), 0 2px 6px rgba(30,60,120,0.07);
        }
        .btn-primary {
          background: linear-gradient(135deg, #1e4fa8 0%, #3b7dd8 60%, #5a9fe8 100%);
          transition: all 0.22s ease;
          letter-spacing: 0.12em;
        }
        .btn-primary:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(30,80,200,0.30); }
        .btn-primary:not(:disabled):active { transform: translateY(0px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .perf-line { border: none; border-left: 3px dashed #c5d7ea; position: relative; }
        .perf-circle-top, .perf-circle-bottom {
          width: 28px; height: 28px; background: #dce8f5;
          border-radius: 50%; position: absolute; left: 50%; transform: translateX(-50%); z-index: 10;
        }
        .perf-circle-top { top: -14px; }
        .perf-circle-bottom { bottom: -14px; }

        .perf-line-mobile { border: none; border-top: 3px dashed #c5d7ea; position: relative; }
        .perf-circle-left, .perf-circle-right {
          width: 28px; height: 28px; background: #dce8f5;
          border-radius: 50%; position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
        }
        .perf-circle-left { left: -14px; }
        .perf-circle-right { right: -14px; }

        .field-enter { animation: fieldSlide 0.28s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fieldSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .toggle-link { color: #3b7dd8; cursor: pointer; transition: color 0.15s; text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 3px; }
        .toggle-link:hover { color: #1e4fa8; text-decoration-color: #3b7dd8; }

        @media (max-width: 767px) {
          .boarding-card { flex-direction: column !important; }
          .left-panel { border-right: none !important; padding-bottom: 32px !important; border-bottom: none; }
        }
      `}</style>

            <div className="topo-bg min-h-screen flex items-center justify-center px-4 py-12"
                 style={{ fontFamily: "'DM Sans', sans-serif" }}>

                <div className="boarding-card card-shadow bg-white rounded-3xl flex w-full overflow-visible"
                     style={{ maxWidth: "860px", minHeight: "480px", position: "relative" }}>

                    {/* ── LEFT: Brand Panel ── */}
                    <div className="left-panel flex flex-col justify-between px-10 py-10"
                         style={{ flex: "0 0 42%", background: "linear-gradient(160deg, #f0f6ff 0%, #e4eef8 100%)", borderRadius: "1.5rem 0 0 1.5rem", position: "relative", overflow: "visible" }}>
                        <div>
                            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#8fa8c4", fontFamily: "'DM Mono', monospace" }}>Boarding Pass</p>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", fontWeight: 900, color: "#1a2d45", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                                Travel<br />Buddy
                            </h1>
                        </div>
                        <div className="mt-8 space-y-5">
                            <div>
                                <p className="text-xs tracking-widest uppercase" style={{ color: "#8fa8c4", fontFamily: "'DM Mono', monospace" }}>Destination</p>
                                <p className="text-lg font-semibold mt-0.5" style={{ color: "#1a2d45", letterSpacing: "0.02em" }}>Anywhere</p>
                            </div>
                            <div>
                                <p className="text-xs tracking-widest uppercase" style={{ color: "#8fa8c4", fontFamily: "'DM Mono', monospace" }}>Passenger</p>
                                <p className="text-lg font-semibold mt-0.5" style={{ color: "#1a2d45", letterSpacing: "0.02em" }}>You</p>
                            </div>
                        </div>
                        <div className="mt-auto pt-8">
                            <Barcode />
                            <p className="text-xs mt-1" style={{ color: "#aabcce", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em" }}>TB-2025-X00001</p>
                        </div>
                    </div>

                    {/* ── PERFORATED DIVIDER (desktop) ── */}
                    <div className="perf-line hidden md:block"
                         style={{ width: "1px", flexShrink: 0, alignSelf: "stretch", position: "relative" }}>
                        <div className="perf-circle-top" /><div className="perf-circle-bottom" />
                    </div>

                    {/* ── PERFORATED DIVIDER (mobile) ── */}
                    <div className="perf-line-mobile md:hidden"
                         style={{ height: "1px", flexShrink: 0, position: "relative", margin: "0 32px" }}>
                        <div className="perf-circle-left" /><div className="perf-circle-right" />
                    </div>

                    {/* ── RIGHT: Action Panel ── */}
                    <div className="flex flex-col justify-center px-10 py-10"
                         style={{ flex: 1, borderRadius: "0 1.5rem 1.5rem 0" }}>

                        {/* Mode heading */}
                        <div className="mb-5">
                            <p className="text-xs tracking-widest uppercase mb-1"
                               style={{ color: "#8fa8c4", fontFamily: "'DM Mono', monospace" }}>
                                Gate {isLogin ? "01 — Return" : "02 — Departure"}
                            </p>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#1a2d45", letterSpacing: "-0.01em" }}>
                                {isLogin ? "Welcome Back" : "New Journey"}
                            </h2>
                        </div>

                        {/* Server-side error banner */}
                        <ServerErrorBanner errors={serverErrors} />

                        {/* Form fields */}
                        <div>
                            {!isLogin && (
                                <div className="field-enter" key="username-field">
                                    <InputField
                                        label="Username"
                                        type="text"
                                        value={username}
                                        onChange={e => { setUsername(e.target.value); setServerErrors([]); }}
                                        onBlur={() => touch("username")}
                                        placeholder="janedoe"
                                        error={clientErrors.username}
                                        touched={touched.username}
                                    />
                                </div>
                            )}

                            <InputField
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setServerErrors([]); }}
                                onBlur={() => touch("email")}
                                placeholder="jane@example.com"
                                error={clientErrors.email}
                                touched={touched.email}
                            />

                            <InputField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setServerErrors([]); }}
                                onBlur={() => touch("password")}
                                placeholder={isLogin ? "Your password" : "Create a password"}
                                error={clientErrors.password}
                                touched={touched.password}
                            />

                            {/* Live password checklist — signup only, appears as soon as the user starts typing */}
                            <PasswordChecklist value={password} visible={!isLogin && password.length > 0} />
                        </div>

                        {/* Submit button */}
                        <button
                            className="btn-primary w-full mt-2 py-3.5 rounded-xl text-white font-semibold text-sm uppercase"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Please wait…" : isLogin ? "Check-In" : "Book Flight"}
                        </button>

                        {/* Toggle link */}
                        <p className="text-center mt-5 text-sm" style={{ color: "#7c8fa6" }}>
                            {isLogin ? (
                                <>New traveler?{" "}<span className="toggle-link" onClick={handleToggle}>Grab a ticket here.</span></>
                            ) : (
                                <>Already have a ticket?{" "}<span className="toggle-link" onClick={handleToggle}>Check in here.</span></>
                            )}
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}