import { useState } from "react";
import profileApi, { parseApiError } from "../services/profileApi";
import ChipSelector from "../components/ChipSelector";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanLight:   "rgba(165,147,123,0.22)",
    tanBorder:  "rgba(165,147,123,0.30)",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    lavLight:   "rgba(175,154,201,0.22)",
    white:      "#ffffff",
    error:      "#ba1a1a",
    errorBg:    "#ffdad6",
};

const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

const STEPS = [
    { key: "identity",  label: "Passenger Identity",      number: 1 },
    { key: "dna",       label: "Travel DNA",               number: 2 },
    { key: "interests", label: "Interests & Preferences",  number: 3 },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const SOCIAL_BATTERY = [
    { value: "INTROVERT",  label: "Introvert",  desc: "Quiet retreats and solo explorations." },
    { value: "AMBIVERT",   label: "Ambivert",   desc: "Balanced mix of social and private time." },
    { value: "EXTROVERT",  label: "Extrovert",  desc: "Group activities and vibrant social scenes." },
];

const PLANNING_STYLE = [
    { value: "SPONTANEOUS",       label: "Spontaneous",      desc: "Go with the flow, no fixed plans." },
    { value: "FLEXIBLE",          label: "Flexible",         desc: "A few anchors with room for whim." },
    { value: "STRICT_ITINERARY",  label: "Strict Itinerary", desc: "Maximized efficiency, every hour set." },
];

const BUDGET = [
    { value: "BUDGET_FRIENDLY", label: "Budget-friendly", desc: "Smart spending, local experiences." },
    { value: "MODERATE",        label: "Moderate",        desc: "Comfort without excess." },
    { value: "LUXURY",          label: "Luxury",          desc: "Exceptional service, no compromises." },
];

const ACTIVITY_OPTIONS    = ["Hiking","Scuba Diving","Wine Tasting","Museums","Photography","Skiing","Surfing","Cycling","Yoga","Cooking Classes"];
const DESTINATION_OPTIONS = ["Tropical Islands","European Capitals","Mountain Retreats","Desert Oasis","Coastal Towns","Ancient Ruins","Countryside"];
const EXPERIENCE_OPTIONS  = ["Ultra-Luxury","Authentic","Adventurous","Cultural","Wellness","Nightlife","Festivals","Volunteer"];
const LANGUAGE_OPTIONS    = ["English","French","Spanish","German","Italian","Portuguese","Japanese","Mandarin","Arabic","Korean"];
const LOOKING_WHO_OPTIONS = ["Solo Travelers","Couples","Families","Small Groups","Digital Nomads"];
const LOOKING_WHAT_OPTIONS= ["Relaxation","Hidden Gems","Nightlife","City Exploration","Local Dinners","Adventure","Cultural Exchange"];

const emptyForm = () => ({
    fullName: "", birthDate: "", gender: "", originCountry: "", originCity: "",
    currentLocation: "", profilePictureUrl: "", bio: "",
    socialBattery: "", planningStyle: "", budget: "",
    activities: [], destinationTypes: [], experienceTypes: [],
    languages: [], lookingForWho: [], lookingForWhat: [],
});

function validateStep(step, form) {
    const e = {};
    if (step === 0) {
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        else if (form.fullName.trim().length < 2) e.fullName = "At least 2 characters";
        if (!form.birthDate) e.birthDate = "Date of birth is required";
        else {
            const age = Math.floor((Date.now() - new Date(form.birthDate).getTime()) / 31557600000);
            if (age < 16) e.birthDate = "You must be at least 16 years old";
            if (age > 120) e.birthDate = "Please enter a valid date";
        }
        if (!form.gender) e.gender = "Please select a gender";
        if (!form.originCountry.trim()) e.originCountry = "Country is required";
        if (!form.originCity.trim()) e.originCity = "City is required";
        if (form.profilePictureUrl && !/^https?:\/\/.+/.test(form.profilePictureUrl))
            e.profilePictureUrl = "Must be a valid URL starting with http(s)://";
        if (form.bio.length > 1000) e.bio = "Max 1000 characters";
    }
    if (step === 1) {
        if (!form.socialBattery) e.socialBattery = "Please select your social battery";
        if (!form.planningStyle) e.planningStyle = "Please select your planning style";
        if (!form.budget)        e.budget        = "Please select your budget";
    }
    return e;
}

function inputStyle(hasError = false) {
    return {
        width: "100%",
        padding: "11px 14px",
        background: C.beigeMid,
        border: `1.5px solid ${hasError ? C.error : C.tanBorder}`,
        borderRadius: "12px",
        fontFamily: SANS,
        fontSize: "14px",
        fontWeight: 400,
        color: C.dark,
        outline: "none",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        boxSizing: "border-box",
    };
}

function FieldBlock({ label, error, children, optional = false }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{
                fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                textTransform: "uppercase", letterSpacing: "0.16em",
                color: C.tan,
                display: "flex", alignItems: "center", gap: "6px",
            }}>
                {label}
                {optional && (
                    <span style={{ fontWeight: 400, fontSize: "9px", color: C.tan, opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>
                        optional
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p style={{ fontFamily: SANS, fontSize: "11px", color: C.error, margin: 0 }}>{error}</p>
            )}
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <p style={{
            fontFamily: SERIF,
            fontSize: "17px",
            color: C.grayWarm,
            margin: "8px 0 0",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            borderBottom: `1px solid ${C.tanBorder}`,
            paddingBottom: "8px",
        }}>
            {children}
        </p>
    );
}

function RaisedButton({ onClick, disabled, loading, children, variant = "primary", type = "button" }) {
    const schemes = {
        primary: {
            bg:         `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`,
            shadow:     `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.22)`,
            shadowDown: `0 1px 0 ${C.dark}, 0 2px 6px rgba(58,55,55,0.14)`,
            color:      C.beigeLight,
            border:     "1px solid rgba(255,255,255,0.10)",
        },
        ghost: {
            bg:         `linear-gradient(180deg, #EAE4DF 0%, ${C.beigeLight} 50%, #d8d2cd 100%)`,
            shadow:     `0 4px 0 #bfb9b4, 0 6px 14px rgba(165,147,123,0.16)`,
            shadowDown: `0 1px 0 #bfb9b4, 0 2px 4px rgba(165,147,123,0.10)`,
            color:      C.grayWarm,
            border:     `1px solid ${C.tanBorder}`,
        },
    };
    const s = schemes[variant];

    const down = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = s.shadowDown; } };
    const up   = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = s.shadow; } };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            onMouseDown={down} onMouseUp={up} onMouseLeave={up}
            style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "999px",
                fontFamily: SANS, fontWeight: 700, fontSize: "13px",
                letterSpacing: "0.04em",
                background: s.bg, color: s.color, border: s.border,
                boxShadow: s.shadow, transform: "translateY(0)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "opacity 0.15s ease",
                whiteSpace: "nowrap",
            }}
        >
            {loading ? (
                <>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.beigeLight, animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Processing...
                </>
            ) : children}
        </button>
    );
}

function DnaCard({ option, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "16px 18px",
                borderRadius: "16px",
                textAlign: "left",
                cursor: "pointer",
                border: isActive ? "none" : `1.5px solid ${C.tanBorder}`,
                background: isActive
                    ? `linear-gradient(160deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`
                    : C.beigeMid,
                boxShadow: isActive
                    ? `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.20)`
                    : `0 2px 0 #d4cec9, 0 3px 8px rgba(165,147,123,0.10)`,
                transform: isActive ? "translateY(-1px)" : "translateY(0)",
                transition: "all 0.18s ease",
                outline: "none",
                width: "100%",
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = C.tan; e.currentTarget.style.boxShadow = `0 3px 0 #bfb9b4, 0 5px 12px rgba(165,147,123,0.16)`; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = C.tanBorder; e.currentTarget.style.boxShadow = `0 2px 0 #d4cec9, 0 3px 8px rgba(165,147,123,0.10)`; } }}
        >
            <p style={{
                fontFamily: SERIF, fontSize: "16px", lineHeight: 1.2, margin: "0 0 4px",
                color: isActive ? C.beigeLight : C.grayWarm,
                letterSpacing: "-0.01em",
            }}>
                {option.label}
            </p>
            {option.desc && (
                <p style={{
                    fontFamily: SANS, fontSize: "12px", fontWeight: 400, margin: 0,
                    color: isActive ? "rgba(233,227,222,0.65)" : C.tan,
                    lineHeight: 1.5,
                }}>
                    {option.desc}
                </p>
            )}
            {isActive && (
                <div style={{ marginTop: "10px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            )}
        </button>
    );
}

function DnaSection({ label, options, selected, onChange, error }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: 0 }}>
                {label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                {options.map((opt) => (
                    <DnaCard
                        key={opt.value}
                        option={opt}
                        isActive={selected === opt.value}
                        onClick={() => onChange(opt.value)}
                    />
                ))}
            </div>
            {error && <p style={{ fontFamily: SANS, fontSize: "11px", color: C.error, margin: 0 }}>{error}</p>}
        </div>
    );
}

function GenderPill({ label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "9px 16px", borderRadius: "999px",
                fontFamily: SANS, fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all 0.18s ease",
                border: selected ? "none" : `1.5px solid ${C.tanBorder}`,
                background: selected
                    ? `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`
                    : C.beigeMid,
                color: selected ? C.beigeLight : C.grayWarm,
                boxShadow: selected
                    ? `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.18)`
                    : `0 2px 0 #d4cec9`,
                outline: "none",
            }}
            onMouseDown={(e) => { if (selected) { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; } }}
            onMouseUp={(e)   => { if (selected) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.18)`; } }}
        >
            {selected && (
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )}
            {label}
        </button>
    );
}

function ProgressStrip({ step, total }) {
    return (
        <div style={{
            background: `linear-gradient(180deg, #575353 0%, ${C.grayWarm} 100%)`,
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            boxShadow: `0 3px 0 ${C.dark}, 0 5px 16px rgba(58,55,55,0.18)`,
            padding: "14px 24px",
        }}>
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                {/* Step labels */}
                <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "10px" }}>
                    {STEPS.map((s, i) => (
                        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                <div style={{
                                    width: "20px", height: "20px", borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                    background: i < step
                                        ? C.tan
                                        : i === step
                                            ? C.sand
                                            : "rgba(233,227,222,0.18)",
                                    border: i === step ? `2px solid ${C.sand}` : "none",
                                    transition: "all 0.25s ease",
                                }}>
                                    {i < step ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.beigeLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", color: i === step ? C.dark : "rgba(233,227,222,0.40)" }}>
                                            {s.number}
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    fontFamily: SANS, fontWeight: i === step ? 600 : 400,
                                    fontSize: "10px", letterSpacing: "0.10em",
                                    textTransform: "uppercase",
                                    color: i === step ? C.sand : i < step ? C.tan : "rgba(233,227,222,0.35)",
                                    display: "block",
                                    transition: "color 0.25s ease",
                                }}>
                                    {s.label}
                                </span>
                            </div>
                            {i < total - 1 && (
                                <div style={{
                                    flex: 1, height: "1px", margin: "0 10px",
                                    background: i < step
                                        ? C.tan
                                        : "rgba(233,227,222,0.18)",
                                    transition: "background 0.3s ease",
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ height: "3px", background: "rgba(233,227,222,0.15)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                        height: "100%", borderRadius: "999px",
                        background: `linear-gradient(to right, ${C.tan}, ${C.sand})`,
                        width: `${((step + 1) / total) * 100}%`,
                        transition: "width 0.4s ease",
                    }} />
                </div>
            </div>
        </div>
    );
}

function StyledInput({ type = "text", value, onChange, placeholder, hasError, rows }) {
    const base = inputStyle(hasError);
    const handleFocus = (e) => {
        e.currentTarget.style.borderColor = C.lavender;
        e.currentTarget.style.boxShadow   = `0 0 0 3px rgba(175,154,201,0.18)`;
    };
    const handleBlur = (e) => {
        e.currentTarget.style.borderColor = hasError ? C.error : C.tanBorder;
        e.currentTarget.style.boxShadow   = "none";
    };

    if (rows) {
        return (
            <textarea
                value={value} onChange={onChange} placeholder={placeholder} rows={rows}
                style={{ ...base, resize: "none", lineHeight: 1.6 }}
                onFocus={handleFocus} onBlur={handleBlur}
            />
        );
    }
    return (
        <input
            type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={base}
            onFocus={handleFocus} onBlur={handleBlur}
        />
    );
}

export default function CreateProfilePage({ onNavigate }) {
    const [step, setStep]         = useState(0);
    const [form, setForm]         = useState(emptyForm());
    const [errors, setErrors]     = useState({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const setField = (field, value) => {
        setForm((p) => ({ ...p, [field]: value }));
        setErrors((p) => ({ ...p, [field]: "" }));
        setApiError("");
    };

    const handleNext = () => {
        const errs = validateStep(step, form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        const errs = validateStep(step, form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setSubmitting(true);
        setApiError("");
        try {
            await profileApi.createProfile(form);
            onNavigate("profile");
        } catch (err) {
            if (err?.status === 401 || err?.status === 403) { onNavigate("force-login"); return; }
            setApiError(parseApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const isLastStep   = step === STEPS.length - 1;

    const stepSubtitles = [
        "Enter your details to begin your journey.",
        "Define your exploration style to find the right companions.",
        "Select what makes your ideal travel experience.",
    ];

    return (
        <div style={{ minHeight: "100vh", background: C.beigeLight, display: "flex", flexDirection: "column", fontFamily: SANS }}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{
                background: `linear-gradient(180deg, #575353 0%, ${C.grayWarm} 100%)`,
                boxShadow: `0 4px 0 ${C.dark}, 0 6px 24px rgba(58,55,55,0.22)`,
                padding: "0 24px",
                height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <span style={{ fontFamily: SERIF, fontSize: "20px", color: C.beigeLight, letterSpacing: "0.02em" }}>
                    Travel Buddy
                </span>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "10px", color: C.sand, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    Profile Setup
                </span>
            </header>

            <ProgressStrip step={step} total={STEPS.length} />

            <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px", alignItems: "flex-start" }}>
                <div style={{ width: "100%", maxWidth: "720px" }}>

                    <div style={{ marginBottom: "28px" }}>
                        <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 6px" }}>
                            Step {step + 1} of {STEPS.length}
                        </p>
                        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.7rem,4vw,2.2rem)", color: C.grayWarm, letterSpacing: "-0.02em", margin: "0 0 6px", lineHeight: 1.1 }}>
                            {STEPS[step].label}
                        </h1>
                        <p style={{ fontFamily: SANS, fontSize: "14px", color: C.tan, margin: 0, fontWeight: 400 }}>
                            {stepSubtitles[step]}
                        </p>
                    </div>

                    {apiError && (
                        <div style={{
                            background: C.errorBg, border: `1px solid ${C.error}22`,
                            borderRadius: "14px", padding: "14px 18px",
                            marginBottom: "20px",
                            fontFamily: SANS, fontSize: "13px", color: C.error,
                        }}>
                            {apiError}
                        </div>
                    )}

                    <div style={{
                        background: C.white, borderRadius: "20px",
                        border: `1px solid ${C.tanBorder}`,
                        boxShadow: `0 4px 0 #bfb9b4, 0 8px 32px rgba(165,147,123,0.12)`,
                        padding: "28px 28px 32px",
                        marginBottom: "24px",
                    }}>

                        {step === 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                                <SectionTitle>Personal Details</SectionTitle>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                                    <FieldBlock label="Full Name" error={errors.fullName}>
                                        <StyledInput
                                            value={form.fullName}
                                            onChange={(e) => setField("fullName", e.target.value)}
                                            placeholder="e.g. Elena Rodriguez"
                                            hasError={!!errors.fullName}
                                        />
                                    </FieldBlock>
                                    <FieldBlock label="Date of Birth" error={errors.birthDate}>
                                        <StyledInput
                                            type="date"
                                            value={form.birthDate}
                                            onChange={(e) => setField("birthDate", e.target.value)}
                                            hasError={!!errors.birthDate}
                                        />
                                    </FieldBlock>
                                </div>

                                <FieldBlock label="Gender" error={errors.gender}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {GENDER_OPTIONS.map((g) => (
                                            <GenderPill
                                                key={g}
                                                label={g}
                                                selected={form.gender === g}
                                                onClick={() => setField("gender", g)}
                                            />
                                        ))}
                                    </div>
                                </FieldBlock>

                                <SectionTitle>Origin & Location</SectionTitle>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                                    <FieldBlock label="Country of Origin" error={errors.originCountry}>
                                        <StyledInput
                                            value={form.originCountry}
                                            onChange={(e) => setField("originCountry", e.target.value)}
                                            placeholder="e.g. Romania"
                                            hasError={!!errors.originCountry}
                                        />
                                    </FieldBlock>
                                    <FieldBlock label="City of Origin" error={errors.originCity}>
                                        <StyledInput
                                            value={form.originCity}
                                            onChange={(e) => setField("originCity", e.target.value)}
                                            placeholder="e.g. Cluj-Napoca"
                                            hasError={!!errors.originCity}
                                        />
                                    </FieldBlock>
                                </div>

                                <FieldBlock label="Current Location" optional>
                                    <StyledInput
                                        value={form.currentLocation}
                                        onChange={(e) => setField("currentLocation", e.target.value)}
                                        placeholder="Where are you based right now?"
                                    />
                                </FieldBlock>

                                <SectionTitle>Traveler Persona</SectionTitle>

                                <FieldBlock label="Profile Picture URL" error={errors.profilePictureUrl} optional>
                                    <StyledInput
                                        type="url"
                                        value={form.profilePictureUrl}
                                        onChange={(e) => setField("profilePictureUrl", e.target.value)}
                                        placeholder="https://your-image-url.com/photo.jpg"
                                        hasError={!!errors.profilePictureUrl}
                                    />
                                </FieldBlock>

                                <FieldBlock label="Traveler Bio" error={errors.bio} optional>
                                    <StyledInput
                                        value={form.bio}
                                        onChange={(e) => setField("bio", e.target.value)}
                                        placeholder="Tell us about your travel style, favorite destinations, and what you look for in a travel companion..."
                                        hasError={!!errors.bio}
                                        rows={4}
                                    />
                                    <div style={{ textAlign: "right", marginTop: "4px" }}>
                                        <span style={{ fontFamily: SANS, fontSize: "10px", color: form.bio.length > 900 ? C.error : C.tan }}>
                                            {form.bio.length} / 1000
                                        </span>
                                    </div>
                                </FieldBlock>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                                <DnaSection label="Social Battery"  options={SOCIAL_BATTERY} selected={form.socialBattery} onChange={(v) => setField("socialBattery", v)} error={errors.socialBattery} />
                                <div style={{ height: "1px", background: C.tanBorder }} />
                                <DnaSection label="Planning Style"  options={PLANNING_STYLE}  selected={form.planningStyle}  onChange={(v) => setField("planningStyle",  v)} error={errors.planningStyle}  />
                                <div style={{ height: "1px", background: C.tanBorder }} />
                                <DnaSection label="Budget"          options={BUDGET}           selected={form.budget}          onChange={(v) => setField("budget",          v)} error={errors.budget}          />
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <ChipSelector label="Activities"       options={ACTIVITY_OPTIONS}    selected={form.activities}       onChange={(v) => setField("activities",       v)} />
                                <div style={{ height: "1px", background: C.tanBorder }} />
                                <ChipSelector label="Destination Types" options={DESTINATION_OPTIONS} selected={form.destinationTypes} onChange={(v) => setField("destinationTypes", v)} />
                                <div style={{ height: "1px", background: C.tanBorder }} />
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
                                    <ChipSelector label="Experience Types" options={EXPERIENCE_OPTIONS}  selected={form.experienceTypes}  onChange={(v) => setField("experienceTypes",  v)} />
                                    <ChipSelector label="Languages"        options={LANGUAGE_OPTIONS}    selected={form.languages}        onChange={(v) => setField("languages",        v)} />
                                </div>
                                <div style={{ height: "1px", background: C.tanBorder }} />
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
                                    <ChipSelector label="Looking for who"  options={LOOKING_WHO_OPTIONS}  selected={form.lookingForWho}   onChange={(v) => setField("lookingForWho",   v)} />
                                    <ChipSelector label="Looking for what" options={LOOKING_WHAT_OPTIONS} selected={form.lookingForWhat}  onChange={(v) => setField("lookingForWhat",  v)} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 18px",
                        borderRadius: "999px",
                        background: `linear-gradient(180deg, #EAE4DF 0%, ${C.beigeLight} 40%, #d8d2cd 100%)`,
                        boxShadow: `0 5px 0 #bfb9b4, 0 8px 24px rgba(165,147,123,0.18), inset 0 1px 0 rgba(255,255,255,0.65)`,
                        border: `1px solid ${C.tanBorder}`,
                    }}>

                        <div style={{ display: "flex", gap: "20px", paddingLeft: "6px" }}>
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: "0 0 2px" }}>
                                    Gate
                                </p>
                                <p style={{ fontFamily: SERIF, fontSize: "17px", color: C.grayWarm, margin: 0, lineHeight: 1 }}>
                                    A-{24 + step}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: "0 0 2px" }}>
                                    Status
                                </p>
                                <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: "11px", color: C.grayWarm, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                    {step === 0 ? "Boarding" : step === 1 ? "In Transit" : "Final Check"}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {step > 0 && (
                                <RaisedButton onClick={handleBack} variant="ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                                    </svg>
                                    Back
                                </RaisedButton>
                            )}
                            <RaisedButton
                                onClick={isLastStep ? handleSubmit : handleNext}
                                disabled={submitting}
                                loading={submitting}
                                variant="primary"
                            >
                                {!submitting && (
                                    <>
                                        {isLastStep ? "Complete Profile" : "Next"}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            {isLastStep
                                                ? <polyline points="20 6 9 17 4 12" />
                                                : <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>
                                            }
                                        </svg>
                                    </>
                                )}
                            </RaisedButton>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{
                background: C.beigeLight,
                borderTop: `1px solid ${C.tanBorder}`,
                padding: "20px 24px",
            }}>
                <div style={{
                    maxWidth: "720px", margin: "0 auto",
                    display: "flex", flexWrap: "wrap",
                    justifyContent: "space-between", alignItems: "center",
                    gap: "8px",
                }}>
                    <p style={{ fontFamily: SANS, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: 0 }}>
                        Travel Buddy — Your global concierge
                    </p>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {["Privacy", "Terms", "Travel Insurance"].map((t) => (
                            <span key={t} style={{ fontFamily: SANS, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.tan, opacity: 0.55 }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}