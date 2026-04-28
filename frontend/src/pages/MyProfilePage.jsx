import { useState, useEffect } from "react";
import profileApi, { parseApiError } from "../services/profileApi";
import DnaSelector from "../components/DnaSelector";
import TagList from "../components/TagList";

/* ── DNA option configs ── */
const SOCIAL_BATTERY_OPTIONS = [
    { value: "INTROVERT", label: "Introvert" },
    { value: "AMBIVERT", label: "Ambivert" },
    { value: "EXTROVERT", label: "Extrovert" },
];
const PLANNING_STYLE_OPTIONS = [
    { value: "SPONTANEOUS", label: "Spontaneous" },
    { value: "FLEXIBLE", label: "Flexible" },
    { value: "STRICT_ITINERARY", label: "Strict" },
];
const BUDGET_OPTIONS = [
    { value: "BUDGET_FRIENDLY", label: "Budget" },
    { value: "MODERATE", label: "Moderate" },
    { value: "LUXURY", label: "Luxury" },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

/** Format LocalDate for display: "12 May 1992" */
function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return dateStr;
    }
}

export default function MyProfilePage({ onAuthError }) {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    /* ── Load profile ── */
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await profileApi.getMyProfile();
            setProfile(data);
            setForm(buildForm(data));
        } catch (err) {
            if (err?.status === 401 || err?.status === 403) {
                // Token expired or invalid — force back to login
                onAuthError?.();
                return;
            }
            if (err?.status === 404 || err?.status === 400) {
                // Profile doesn't exist yet — show empty edit mode
                setProfile(null);
                setForm(emptyForm());
                setEditing(true);
            } else {
                setError(parseApiError(err));
            }
        } finally {
            setLoading(false);
        }
    };

    const buildForm = (data) => ({
        fullName: data.fullName || "",
        birthDate: data.birthDate || "",
        gender: data.gender || "",
        originCountry: data.originCountry || "",
        originCity: data.originCity || "",
        currentLocation: data.currentLocation || "",
        bio: data.bio || "",
        profilePictureUrl: data.profilePictureUrl || "",
        socialBattery: data.socialBattery || "",
        planningStyle: data.planningStyle || "",
        budget: data.budget || "",
        activities: data.activities || [],
        destinationTypes: data.destinationTypes || [],
        experienceTypes: data.experienceTypes || [],
        languages: data.languages || [],
        lookingForWho: data.lookingForWho || [],
        lookingForWhat: data.lookingForWhat || [],
    });

    const emptyForm = () => ({
        fullName: "", birthDate: "", gender: "", originCountry: "", originCity: "",
        currentLocation: "", bio: "", profilePictureUrl: "",
        socialBattery: "AMBIVERT", planningStyle: "FLEXIBLE", budget: "MODERATE",
        activities: [], destinationTypes: [], experienceTypes: [],
        languages: [], lookingForWho: [], lookingForWhat: [],
    });

    const setField = (field, value) => {
        setForm((p) => ({ ...p, [field]: value }));
    };

    /* ── Save ── */
    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSaveSuccess(false);
        try {
            const payload = { ...form };
            let data;
            if (!profile) {
                // First time — POST
                data = await profileApi.createProfile(payload);
            } else {
                // Update — PUT
                data = await profileApi.updateProfile(payload);
            }
            setProfile(data);
            setForm(buildForm(data));
            setEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            if (err?.status === 401 || err?.status === 403) {
                onAuthError?.();
                return;
            }
            setError(parseApiError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setForm(buildForm(profile));
            setEditing(false);
            setError("");
        }
    };

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#666161", borderRightColor: "#AF9AC9", animation: "spin 0.9s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p className="font-label text-sm uppercase tracking-widest" style={{ color: "#A5937B" }}>Loading profile...</p>
                </div>
            </div>
        );
    }

    const displayData = editing ? form : (profile || form);

    return (
        <div className="space-y-8">
            {/* ═══ HERO SECTION ═══ */}
            <section className="relative rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                {/* Cover */}
                <div className="h-40 md:h-48 w-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #666161 0%, #575353 40%, #4d4949 100%)" }}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(58,55,55,0.55) 100%)" }} />
                    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
                        <div style={{ position: "absolute", right: "48px", top: "50%", transform: "translateY(-50%)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 24 24" fill="#E9E3DE">
                                <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                            </svg>
                        </div>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #666161, #A5937B, #AF9AC9)" }} />
                </div>

                {/* Profile info bar */}
                <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col md:flex-row items-start md:items-end -mt-16 relative z-10 gap-4 md:gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden" style={{ border: "4px solid #E9E3DE", boxShadow: "0 4px 0 #bfb9b4, 0 6px 16px rgba(58,55,55,0.18)", background: "linear-gradient(135deg, #666161 0%, #4d4949 100%)" }}>
                            {displayData.profilePictureUrl ? (
                                <img
                                    src={displayData.profilePictureUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ color: "#A5937B" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35 }}>
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Verification badge */}
                        {profile?.verificationStatus && (
                            <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full" style={{ border: "4px solid #E9E3DE", background: profile.verificationStatus === "VERIFIED_USER" ? "#AF9AC9" : "#A5937B" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Name & location */}
                    <div className="flex-grow">
                        <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                            {editing ? "Edit Profile" : (displayData.fullName || "Your Profile")}
                        </h1>
                        <div className="flex items-center mt-1 font-label text-sm uppercase tracking-wider" style={{ color: "#A5937B" }}>
                            {editing ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                    Personalize your journey
                                </>
                            ) : (
                                displayData.currentLocation && (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                        {displayData.currentLocation}
                                    </>
                                )
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-2 md:mt-0 md:mb-1">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving || !profile}
                                    className="px-5 py-2.5 rounded-xl font-headline font-bold transition-all disabled:opacity-50"
                                    style={{ background: "#faf8f6", border: "1px solid rgba(165,147,123,0.25)", color: "#666161", boxShadow: "0 2px 0 #d4cec9" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 transition-all disabled:opacity-70"
                                    style={{ background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)", color: "#E9E3DE", border: "none", boxShadow: "0 4px 0 #3a3737, 0 6px 14px rgba(58,55,55,0.20)" }}
                                >
                                    {saving ? (
                                        <>
                                            <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#E9E3DE", animation: "spin 0.8s linear infinite" }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-6 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 transition-all active:scale-95"
                                style={{ background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)", color: "#E9E3DE", border: "none", boxShadow: "0 4px 0 #3a3737, 0 6px 14px rgba(58,55,55,0.20)" }}
                            >
                                Edit Profile
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Error / Success banners */}
            {error && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.25)", color: "#ba1a1a" }}>
                    {error}
                </div>
            )}
            {saveSuccess && (
                <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "rgba(175,154,201,0.14)", border: "1px solid rgba(175,154,201,0.35)", color: "#3a2d4a" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF9AC9" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    Profile saved successfully!
                </div>
            )}

            {/* ═══ BENTO GRID ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── LEFT: Personal Info ── */}
                <aside className="lg:col-span-4">
                    <div className="rounded-xl p-6 md:p-8 relative overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                        {/* Decorative barcode */}
                        <div className="absolute top-8 right-8 flex gap-0.5 opacity-20">
                            {[0.5, 1, 0.5, 2, 0.5, 1.5].map((w, i) => (
                                <div key={i} style={{ background: "#666161", height: "32px", width: `${w * 4}px` }} />
                            ))}
                        </div>

                        <h2 className="font-headline text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#A5937B" }}>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/>
                            </svg>
                            Personal Info
                        </h2>

                        <div className="space-y-5">
                            {/* Full Name */}
                            <FieldBlock label="Full Name" editing={editing}>
                                {editing ? (
                                    <input
                                        type="text" value={form.fullName}
                                        onChange={(e) => setField("fullName", e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all"
                                        style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                        onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                ) : (
                                    <p className="font-body font-semibold" style={{ color: "#3a3737" }}>{displayData.fullName || "—"}</p>
                                )}
                            </FieldBlock>

                            {/* Profile Picture URL (edit only) */}
                            {editing && (
                                <FieldBlock label="Profile Picture URL" editing>
                                    <input
                                        type="url" value={form.profilePictureUrl}
                                        onChange={(e) => setField("profilePictureUrl", e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all"
                                        style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                        onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </FieldBlock>
                            )}

                            {/* Birth Date + Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <FieldBlock label="Birth Date" editing={editing}>
                                    {editing ? (
                                        <input
                                            type="date" value={form.birthDate}
                                            onChange={(e) => setField("birthDate", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all"
                                            style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    ) : (
                                        <p className="font-body font-semibold" style={{ color: "#3a3737" }}>{formatDate(displayData.birthDate)}</p>
                                    )}
                                </FieldBlock>
                                <FieldBlock label="Gender" editing={editing}>
                                    {editing ? (
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setField("gender", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all"
                                            style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737", cursor: "pointer" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; }}
                                            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; }}
                                        >
                                            <option value="">Select</option>
                                            {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    ) : (
                                        <p className="font-body font-semibold" style={{ color: "#3a3737" }}>{displayData.gender || "—"}</p>
                                    )}
                                </FieldBlock>
                            </div>

                            {/* Current Location (edit only as separate field) */}
                            {editing && (
                                <FieldBlock label="Current Location" editing>
                                    <input
                                        type="text" value={form.currentLocation}
                                        onChange={(e) => setField("currentLocation", e.target.value)}
                                        placeholder="City, Country"
                                        className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all"
                                        style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                        onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </FieldBlock>
                            )}

                            {/* Route History (with perforation line) */}
                            <div className="pt-4 border-t border-dashed border-outline-variant relative">
                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "#E9E3DE" }} />
                                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "#E9E3DE" }} />

                                <p className="font-label text-[10px] uppercase tracking-widest mb-4" style={{ color: "#A5937B" }}>Route History</p>
                                <div className="space-y-4">
                                    <RouteItem
                                        icon="↗" sublabel="Origin"
                                        editing={editing}
                                        value={editing ? `${form.originCity}${form.originCity && form.originCountry ? ', ' : ''}${form.originCountry}` : `${displayData.originCity || ""}${displayData.originCity && displayData.originCountry ? ", " : ""}${displayData.originCountry || ""}`}
                                        onChangeCity={(v) => setField("originCity", v)}
                                        onChangeCountry={(v) => setField("originCountry", v)}
                                        cityValue={form?.originCity}
                                        countryValue={form?.originCountry}
                                    />
                                    {!editing && (
                                        <RouteItem
                                            icon="↙" sublabel="Current"
                                            editing={false}
                                            value={displayData.currentLocation || "—"}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="pt-2">
                                <FieldBlock label="Bio" editing={editing}>
                                    {editing ? (
                                        <textarea
                                            value={form.bio}
                                            onChange={(e) => setField("bio", e.target.value)}
                                            placeholder="Tell us about your travel style..."
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none transition-all resize-none leading-relaxed"
                                            style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    ) : (
                                        <p className="font-body text-sm leading-relaxed italic" style={{ color: "#666161" }}>
                                            {displayData.bio ? `"${displayData.bio}"` : "No bio yet."}
                                        </p>
                                    )}
                                </FieldBlock>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── RIGHT: Travel DNA + Interests ── */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Travel DNA */}
                    <section className="rounded-xl p-6 md:p-8" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                        <h2 className="font-headline text-lg font-bold mb-8 flex items-center gap-2" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#A5937B" }}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Travel DNA
                        </h2>
                        <div className="space-y-8">
                            <DnaSelector
                                label="Social Battery"
                                options={SOCIAL_BATTERY_OPTIONS}
                                selected={displayData.socialBattery}
                                editing={editing}
                                onChange={(v) => setField("socialBattery", v)}
                            />
                            <DnaSelector
                                label="Planning Style"
                                options={PLANNING_STYLE_OPTIONS}
                                selected={displayData.planningStyle}
                                editing={editing}
                                onChange={(v) => setField("planningStyle", v)}
                            />
                            <DnaSelector
                                label="Budget Preference"
                                options={BUDGET_OPTIONS}
                                selected={displayData.budget}
                                editing={editing}
                                onChange={(v) => setField("budget", v)}
                            />
                        </div>
                    </section>

                    {/* Interests & Preferences */}
                    <section className="rounded-xl p-6 md:p-8" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                        <h2 className="font-headline text-lg font-bold mb-8 flex items-center gap-2" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#A5937B" }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            Interests &amp; Preferences
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <TagList label="Favorite Activities" items={displayData.activities} editing={editing} onChange={(v) => setField("activities", v)} variant="default" />
                                <TagList label="Languages" items={displayData.languages} editing={editing} onChange={(v) => setField("languages", v)} variant="tertiary" />
                                <TagList label="Looking For What" items={displayData.lookingForWhat} editing={editing} onChange={(v) => setField("lookingForWhat", v)} variant="neutral" />
                            </div>
                            <div className="space-y-6">
                                <TagList label="Destination Types" items={displayData.destinationTypes} editing={editing} onChange={(v) => setField("destinationTypes", v)} variant="secondary" />
                                <TagList label="Experience Types" items={displayData.experienceTypes} editing={editing} onChange={(v) => setField("experienceTypes", v)} variant="default" />
                                <TagList label="Who I Travel With" items={displayData.lookingForWho} editing={editing} onChange={(v) => setField("lookingForWho", v)} variant="neutral" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

/* ── Helper components ── */
function FieldBlock({ label, editing, children }) {
    return (
        <div>
            <p className="font-label text-[10px] uppercase tracking-widest mb-1" style={{ color: "#A5937B" }}>{label}</p>
            {children}
        </div>
    );
}

function RouteItem({ icon, sublabel, editing, value, onChangeCity, onChangeCountry, cityValue, countryValue }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(175,154,201,0.16)", border: "1px solid rgba(175,154,201,0.28)", color: "#AF9AC9" }}>
                {icon}
            </div>
            <div className="flex-grow">
                <p className="text-[11px] font-label leading-none uppercase" style={{ color: "#A5937B" }}>{sublabel}</p>
                {editing && onChangeCity ? (
                    <div className="flex gap-2 mt-1">
                        <input
                            type="text" value={cityValue || ""} onChange={(e) => onChangeCity(e.target.value)}
                            placeholder="City"
                            className="flex-1 px-2 py-1.5 rounded-lg font-body text-sm font-bold outline-none transition-all"
                            style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; }}
                            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; }}
                        />
                        <input
                            type="text" value={countryValue || ""} onChange={(e) => onChangeCountry(e.target.value)}
                            placeholder="Country"
                            className="flex-1 px-2 py-1.5 rounded-lg font-body text-sm font-bold outline-none transition-all"
                            style={{ background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.30)", color: "#3a3737" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; }}
                            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.30)"; }}
                        />
                    </div>
                ) : (
                    <p className="font-body font-bold" style={{ color: "#3a3737" }}>{value || "—"}</p>
                )}
            </div>
        </div>
    );
}