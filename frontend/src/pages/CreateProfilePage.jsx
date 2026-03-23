import { useState } from "react";
import profileApi, { parseApiError } from "../services/profileApi";
import ChipSelector from "../components/ChipSelector";

/* ══════════════════════════════════════════════════════════
   STEP CONFIGURATION
   ══════════════════════════════════════════════════════════ */

const STEPS = [
    { key: "identity", label: "Passenger Identity", number: 1, icon: "🛂" },
    { key: "dna", label: "Travel DNA", number: 2, icon: "🧬" },
    { key: "interests", label: "Interests & Preferences", number: 3, icon: "✈️" },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const SOCIAL_BATTERY = [
    { value: "INTROVERT", label: "Introvert", desc: "Quiet retreats and solo explorations.", icon: "🧘" },
    { value: "AMBIVERT", label: "Ambivert", desc: "Balanced mix of social and private time.", icon: "🤝" },
    { value: "EXTROVERT", label: "Extrovert", desc: "Group activities and vibrant nightlife.", icon: "🎉" },
];

const PLANNING_STYLE = [
    { value: "SPONTANEOUS", label: "Spontaneous", desc: "Go with the flow, no fixed plans.", icon: "⚡" },
    { value: "FLEXIBLE", label: "Flexible", desc: "A few anchors with room for whim.", icon: "🗺️" },
    { value: "STRICT_ITINERARY", label: "Strict Itinerary", desc: "Maximized efficiency, every hour set.", icon: "📋" },
];

const BUDGET = [
    { value: "BUDGET_FRIENDLY", label: "Budget-friendly", icon: "🪙" },
    { value: "MODERATE", label: "Moderate", icon: "💳" },
    { value: "LUXURY", label: "Luxury", icon: "💎" },
];

/* Predefined options for chip selectors */
const ACTIVITY_OPTIONS = [
    "Hiking", "Scuba Diving", "Wine Tasting", "Museums", "Photography",
    "Skiing", "Surfing", "Cycling", "Yoga", "Cooking Classes",
];
const DESTINATION_OPTIONS = [
    "Tropical Islands", "European Capitals", "Mountain Retreats",
    "Desert Oasis", "Coastal Towns", "Ancient Ruins", "Countryside",
];
const EXPERIENCE_OPTIONS = [
    "Ultra-Luxury", "Authentic", "Adventurous", "Cultural",
    "Wellness", "Nightlife", "Festivals", "Volunteer",
];
const LANGUAGE_OPTIONS = [
    "English", "French", "Spanish", "German", "Italian",
    "Portuguese", "Japanese", "Mandarin", "Arabic", "Korean",
];
const LOOKING_WHO_OPTIONS = [
    "Solo Travelers", "Couples", "Families", "Small Groups", "Digital Nomads",
];
const LOOKING_WHAT_OPTIONS = [
    "Relaxation", "Hidden Gems", "Nightlife", "City Exploration",
    "Local Dinners", "Adventure", "Cultural Exchange",
];

/* ══════════════════════════════════════════════════════════
   EMPTY FORM
   ══════════════════════════════════════════════════════════ */

const emptyForm = () => ({
    fullName: "",
    birthDate: "",
    gender: "",
    originCountry: "",
    originCity: "",
    currentLocation: "",
    profilePictureUrl: "",
    bio: "",
    socialBattery: "",
    planningStyle: "",
    budget: "",
    activities: [],
    destinationTypes: [],
    experienceTypes: [],
    languages: [],
    lookingForWho: [],
    lookingForWhat: [],
});

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */

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
        if (form.profilePictureUrl && !/^https?:\/\/.+/.test(form.profilePictureUrl)) {
            e.profilePictureUrl = "Must be a valid URL starting with http(s)://";
        }
        if (form.bio.length > 1000) e.bio = "Max 1000 characters";
    }

    if (step === 1) {
        if (!form.socialBattery) e.socialBattery = "Please select your social battery";
        if (!form.planningStyle) e.planningStyle = "Please select your planning style";
        if (!form.budget) e.budget = "Please select your budget";
    }

    // Step 2 (interests) — no hard requirements, all optional lists

    return e;
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function CreateProfilePage({ onNavigate }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const setField = (field, value) => {
        setForm((p) => ({ ...p, [field]: value }));
        setErrors((p) => ({ ...p, [field]: "" }));
        setApiError("");
    };

    /* ── Navigation ── */
    const handleNext = () => {
        const errs = validateStep(step, form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setStep((s) => Math.max(s - 1, 0));
    };

    /* ── Submit ── */
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
            if (err?.status === 401 || err?.status === 403) {
                onNavigate("force-login");
                return;
            }
            setApiError(parseApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const isLastStep = step === STEPS.length - 1;
    const currentStep = STEPS[step];

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col">
            {/* ══ TOP BAR ══ */}
            <header className="bg-primary px-6 md:px-12 py-4 flex items-center justify-between">
                <div className="text-xl font-bold text-white tracking-widest uppercase font-headline">
                    Travel Buddy
                </div>
                <div className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim">
                    Profile Setup
                </div>
            </header>

            {/* ══ PROGRESS BAR ══ */}
            <div className="bg-surface-container-low px-6 md:px-12 py-3">
                <div className="max-w-3xl mx-auto">
                    {/* Step indicators */}
                    <div className="flex items-center justify-between mb-2">
                        {STEPS.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                        i < step
                                            ? "bg-secondary text-on-secondary"
                                            : i === step
                                                ? "bg-primary text-on-primary"
                                                : "bg-surface-container-high text-outline"
                                    }`}
                                >
                                    {i < step ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                                    ) : (
                                        s.number
                                    )}
                                </div>
                                <span className={`hidden md:inline font-label text-xs uppercase tracking-wider ${
                                    i === step ? "text-primary font-bold" : "text-outline"
                                }`}>
                  {s.label}
                </span>
                                {i < STEPS.length - 1 && (
                                    <div className={`hidden md:block w-12 lg:w-20 h-px mx-2 ${
                                        i < step ? "bg-secondary" : "bg-outline-variant"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-secondary to-primary-container rounded-full transition-all duration-500"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ══ MAIN CONTENT ══ */}
            <main className="flex-grow flex items-start justify-center px-4 md:px-6 py-8 md:py-12">
                <div className="w-full max-w-3xl">
                    {/* Step header */}
                    <div className="mb-8">
                        <p className="font-label text-xs uppercase tracking-widest text-secondary mb-1">
                            {currentStep.icon} Step {currentStep.number}: Tailoring your journey
                        </p>
                        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                            {currentStep.label}
                        </h1>
                        <p className="text-on-surface-variant mt-1.5 text-sm">
                            {step === 0 && "Enter your passenger details to begin your journey."}
                            {step === 1 && "Define your exploration style to curate your perfect itinerary."}
                            {step === 2 && "Select the elements that define your ideal escape."}
                        </p>
                    </div>

                    {/* API error */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-error-container border border-error/20 rounded-xl text-on-error-container text-sm font-medium">
                            {apiError}
                        </div>
                    )}

                    {/* Step content card */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] p-6 md:p-8 mb-8">

                        {/* ── STEP 1: Passenger Identity ── */}
                        {step === 0 && (
                            <div className="space-y-6">
                                <SectionTitle>Passenger Identity</SectionTitle>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FieldBlock label="Full Name" error={errors.fullName}>
                                        <input
                                            type="text"
                                            value={form.fullName}
                                            onChange={(e) => setField("fullName", e.target.value)}
                                            placeholder="e.g. Elena Rodriguez"
                                            className={inputClass(errors.fullName)}
                                        />
                                    </FieldBlock>
                                    <FieldBlock label="Date of Birth" error={errors.birthDate}>
                                        <input
                                            type="date"
                                            value={form.birthDate}
                                            onChange={(e) => setField("birthDate", e.target.value)}
                                            className={inputClass(errors.birthDate)}
                                        />
                                    </FieldBlock>
                                </div>

                                <FieldBlock label="Gender Biometrics" error={errors.gender}>
                                    <div className="flex flex-wrap gap-3">
                                        {GENDER_OPTIONS.map((g) => (
                                            <label
                                                key={g}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                                                    form.gender === g
                                                        ? "border-secondary bg-secondary-fixed text-primary"
                                                        : "border-outline-variant text-on-surface-variant hover:border-secondary"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={g}
                                                    checked={form.gender === g}
                                                    onChange={() => setField("gender", g)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    form.gender === g ? "border-secondary" : "border-outline-variant"
                                                }`}>
                                                    {form.gender === g && <div className="w-2 h-2 rounded-full bg-secondary" />}
                                                </div>
                                                {g}
                                            </label>
                                        ))}
                                    </div>
                                </FieldBlock>

                                <SectionTitle>Origin & Domicile</SectionTitle>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FieldBlock label="Country of Origin" error={errors.originCountry}>
                                        <input
                                            type="text"
                                            value={form.originCountry}
                                            onChange={(e) => setField("originCountry", e.target.value)}
                                            placeholder="Select Country"
                                            className={inputClass(errors.originCountry)}
                                        />
                                    </FieldBlock>
                                    <FieldBlock label="City" error={errors.originCity}>
                                        <input
                                            type="text"
                                            value={form.originCity}
                                            onChange={(e) => setField("originCity", e.target.value)}
                                            placeholder="Select City"
                                            className={inputClass(errors.originCity)}
                                        />
                                    </FieldBlock>
                                </div>

                                <FieldBlock label="Current Location" icon="📍">
                                    <input
                                        type="text"
                                        value={form.currentLocation}
                                        onChange={(e) => setField("currentLocation", e.target.value)}
                                        placeholder="Where are you right now?"
                                        className={inputClass()}
                                    />
                                </FieldBlock>

                                <SectionTitle>Traveler Persona</SectionTitle>

                                <FieldBlock label="Profile Picture URL" error={errors.profilePictureUrl}>
                                    <input
                                        type="url"
                                        value={form.profilePictureUrl}
                                        onChange={(e) => setField("profilePictureUrl", e.target.value)}
                                        placeholder="https://your-image-url.com/photo.jpg"
                                        className={inputClass(errors.profilePictureUrl)}
                                    />
                                </FieldBlock>

                                <FieldBlock label="Traveler Bio" error={errors.bio}>
                  <textarea
                      value={form.bio}
                      onChange={(e) => setField("bio", e.target.value)}
                      placeholder="Tell us about your travel style, favorite destinations, and what you look for in a buddy..."
                      rows={4}
                      className={`${inputClass(errors.bio)} resize-none`}
                  />
                                    <div className="flex justify-end mt-1">
                    <span className={`text-[11px] font-label ${form.bio.length > 900 ? "text-error" : "text-outline"}`}>
                      {form.bio.length}/1000
                    </span>
                                    </div>
                                </FieldBlock>
                            </div>
                        )}

                        {/* ── STEP 2: Travel DNA ── */}
                        {step === 1 && (
                            <div className="space-y-10">
                                {/* Social Battery */}
                                <DnaSection
                                    label="Social Battery"
                                    icon="🔋"
                                    options={SOCIAL_BATTERY}
                                    selected={form.socialBattery}
                                    onChange={(v) => setField("socialBattery", v)}
                                    error={errors.socialBattery}
                                />

                                {/* Planning Style */}
                                <DnaSection
                                    label="Planning Style"
                                    icon="🗓️"
                                    options={PLANNING_STYLE}
                                    selected={form.planningStyle}
                                    onChange={(v) => setField("planningStyle", v)}
                                    error={errors.planningStyle}
                                />

                                {/* Budget */}
                                <DnaSection
                                    label="Budget"
                                    icon="💰"
                                    options={BUDGET}
                                    selected={form.budget}
                                    onChange={(v) => setField("budget", v)}
                                    error={errors.budget}
                                />
                            </div>
                        )}

                        {/* ── STEP 3: Interests & Preferences ── */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <ChipSelector
                                    label="Activities"
                                    icon="🎿"
                                    options={ACTIVITY_OPTIONS}
                                    selected={form.activities}
                                    onChange={(v) => setField("activities", v)}
                                />
                                <ChipSelector
                                    label="Destination Types"
                                    icon="📍"
                                    options={DESTINATION_OPTIONS}
                                    selected={form.destinationTypes}
                                    onChange={(v) => setField("destinationTypes", v)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ChipSelector
                                        label="Experience Types"
                                        icon="⭐"
                                        options={EXPERIENCE_OPTIONS}
                                        selected={form.experienceTypes}
                                        onChange={(v) => setField("experienceTypes", v)}
                                    />
                                    <ChipSelector
                                        label="Languages"
                                        icon="🗣️"
                                        options={LANGUAGE_OPTIONS}
                                        selected={form.languages}
                                        onChange={(v) => setField("languages", v)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ChipSelector
                                        label="Looking for who"
                                        icon="👥"
                                        options={LOOKING_WHO_OPTIONS}
                                        selected={form.lookingForWho}
                                        onChange={(v) => setField("lookingForWho", v)}
                                    />
                                    <ChipSelector
                                        label="Looking for what"
                                        icon="🔎"
                                        options={LOOKING_WHAT_OPTIONS}
                                        selected={form.lookingForWhat}
                                        onChange={(v) => setField("lookingForWhat", v)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ BOTTOM NAV BAR ══ */}
                    <div className="flex items-center justify-between">
                        {/* Left: decorative boarding info */}
                        <div className="flex gap-4">
                            <div>
                                <p className="font-label text-[9px] uppercase tracking-widest text-outline">
                                    Passenger/Gate
                                </p>
                                <p className="font-headline font-bold text-primary">
                                    A-{24 + step}
                                </p>
                            </div>
                            <div>
                                <p className="font-label text-[9px] uppercase tracking-widest text-outline">
                                    Status
                                </p>
                                <p className="font-headline font-bold text-primary uppercase text-sm">
                                    {step === 0 ? "Boarding" : step === 1 ? "In Transit" : "Customizing"}
                                </p>
                            </div>
                        </div>

                        {/* Right: navigation buttons */}
                        <div className="flex items-center gap-3">
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-5 py-3 rounded-xl font-headline font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                                    </svg>
                                    Back
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={isLastStep ? handleSubmit : handleNext}
                                disabled={submitting}
                                className="bg-gradient-to-r from-secondary to-primary-container text-white px-8 py-3 rounded-xl font-headline font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Creating...
                                    </>
                                ) : isLastStep ? (
                                    <>
                                        Complete Profile
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                                    </>
                                ) : (
                                    <>
                                        Next Destination
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer className="bg-surface border-t border-surface-container px-6 md:px-12 py-6">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <p className="font-label text-xs uppercase tracking-widest text-outline mb-2 md:mb-0">
                        © 2025 Travel Buddy. Your Global Concierge.
                    </p>
                    <div className="flex space-x-6">
                        {["Privacy Policy", "Terms of Service", "Travel Insurance"].map((t) => (
                            <span key={t} className="font-label text-xs uppercase tracking-widest text-outline opacity-70">
                {t}
              </span>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ══════════════════════════════════════════════════════════ */

function SectionTitle({ children }) {
    return (
        <h2 className="font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-secondary pt-2">
            {children}
        </h2>
    );
}

function FieldBlock({ label, error, icon, children }) {
    return (
        <div>
            <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">
                {icon && <span className="mr-1">{icon}</span>}
                {label}
            </label>
            {children}
            {error && (
                <p className="text-error text-xs font-medium mt-1">{error}</p>
            )}
        </div>
    );
}

function DnaSection({ label, icon, options, selected, onChange, error }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                    {label}
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.map((opt) => {
                    const isActive = selected === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`p-4 rounded-xl text-left transition-all ${
                                isActive
                                    ? "bg-primary text-on-primary shadow-lg ring-4 ring-primary/10"
                                    : "bg-surface-container-low border border-outline-variant/40 text-on-surface hover:border-secondary hover:shadow-sm"
                            }`}
                        >
                            <div className="text-lg mb-1">{opt.icon}</div>
                            <p className={`font-headline font-bold text-sm ${isActive ? "text-on-primary" : "text-primary"}`}>
                                {opt.label}
                            </p>
                            {opt.desc && (
                                <p className={`text-xs mt-0.5 leading-snug ${isActive ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                                    {opt.desc}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-error text-xs font-medium">{error}</p>}
        </div>
    );
}

/** Consistent input class */
function inputClass(error) {
    return `w-full px-4 py-3 bg-transparent border rounded-xl font-body text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/20 focus:border-secondary placeholder:text-outline/60 ${
        error ? "border-error" : "border-outline-variant"
    }`;
}