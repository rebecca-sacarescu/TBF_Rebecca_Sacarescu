import { useState, useEffect, useCallback } from "react";
import {
    getMyCreatedTrips,
    getMyJoinedTrips,
    getTripJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    createTrip,
} from "../services/tripsApi";
import TripTicketCard from "../components/TripTicketCard";
import DiscoverPlaces from "../components/DiscoverPlaces";

function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#666161", borderRightColor: "#AF9AC9", animation: "spin 0.9s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p className="font-label text-sm uppercase tracking-widest" style={{ color: "#A5937B" }}>{label}</p>
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="rounded-xl p-8 text-center" style={{ background: "#ffffff", border: "1.5px dashed rgba(165,147,123,0.40)" }}>
            <p className="font-body text-sm mb-4" style={{ color: "#666161" }}>{message}</p>
            <button
                onClick={onRetry}
                className="font-label font-bold uppercase px-5 py-2.5 rounded-xl transition-all active:scale-95"
                style={{ fontSize: "11px", letterSpacing: "0.12em", background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)", color: "#E9E3DE", border: "none", boxShadow: "0 3px 0 #3a3737" }}
            >
                Try again
            </button>
        </div>
    );
}

function EmptyState({ tab, onCreateTrip, onExplore }) {
    const isOwned = tab === "created";
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center rounded-xl" style={{ border: "1.5px dashed rgba(165,147,123,0.35)", background: "#ffffff" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(175,154,201,0.16)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#666161" style={{ opacity: 0.45 }}>
                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                </svg>
            </div>
            <div>
                <p className="font-headline font-extrabold text-xl tracking-tight mb-1" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                    {isOwned ? "No trips created yet" : "No trips joined yet"}
                </p>
                <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: "#666161" }}>
                    {isOwned
                        ? "Publish a departure and invite fellow travelers to join."
                        : "Browse open trips and request to join one."}
                </p>
            </div>
            <button
                onClick={isOwned ? onCreateTrip : onExplore}
                className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                style={{
                    fontSize: "11px", letterSpacing: "0.12em",
                    background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)",
                    color: "#E9E3DE", padding: "10px 22px", borderRadius: "999px",
                    border: "none", boxShadow: "0 4px 0 #3a3737, 0 6px 14px rgba(58,55,55,0.20)",
                }}
            >
                {isOwned ? "Publish a Departure" : "Explore Open Trips"}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

function RequesterAvatar({ name = "", url }) {
    const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
    if (url) {
        return (
            <img src={url} alt={name}
                 style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E9E3DE", flexShrink: 0 }}
                 onError={(e) => { e.currentTarget.style.display = "none"; }} />
        );
    }
    return (
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #666161 0%, #4d4949 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #E9E3DE" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "11px", color: "#E9E3DE", letterSpacing: "0.06em" }}>{initials}</span>
        </div>
    );
}

function JoinRequestRow({ request, tripId, onApprove, onReject }) {
    const [loading, setLoading] = useState(null);
    const [done, setDone] = useState(null);
    const [error, setError] = useState(null);

    const handle = async (action) => {
        setLoading(action);
        setError(null);
        try {
            if (action === "approve") {
                await approveJoinRequest(tripId, request.requestId);
                setDone("approved");
                setTimeout(() => onApprove?.(request.requestId), 800);
            } else {
                await rejectJoinRequest(tripId, request.requestId);
                setDone("rejected");
                setTimeout(() => onReject?.(request.requestId), 800);
            }
        } catch (err) {
            setError(err.message ?? "Action failed. Please try again.");
            setLoading(null);
        }
    };

    const { requesterFullName = "", requesterProfilePictureUrl, requesterCurrentLocation, message, createdAt } = request;

    const timeAgo = (() => {
        if (!createdAt) return null;
        try {
            const diff = Date.now() - new Date(createdAt).getTime();
            const h = Math.floor(diff / 3600000);
            if (h < 1) return "Just now";
            if (h < 24) return `${h}h ago`;
            const d = Math.floor(h / 24);
            return `${d}d ago`;
        } catch { return null; }
    })();

    if (done) {
        return (
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg" style={{ background: done === "approved" ? "rgba(175,154,201,0.12)" : "rgba(186,26,26,0.05)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={done === "approved" ? "#AF9AC9" : "#ba1a1a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {done === "approved"
                        ? <polyline points="20 6 9 17 4 12" />
                        : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                </svg>
                <span className="font-label font-semibold" style={{ fontSize: "11px", color: done === "approved" ? "#3a2d4a" : "#ba1a1a" }}>
                    {requesterFullName} — {done === "approved" ? "Approved" : "Rejected"}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4 px-4 rounded-lg group transition-all"
             style={{ border: "1px solid rgba(165,147,123,0.20)", background: "#faf8f6" }}>
            <div className="hidden md:block w-0.5 self-stretch rounded-full flex-shrink-0"
                 style={{ background: "linear-gradient(to bottom, #666161, #A5937B)", minHeight: "40px" }} />
            <RequesterAvatar name={requesterFullName} url={requesterProfilePictureUrl} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-label font-bold" style={{ fontSize: "13px", color: "#3a3737" }}>{requesterFullName}</span>
                    {requesterCurrentLocation && (
                        <span className="font-label flex items-center gap-1" style={{ fontSize: "10px", color: "#A5937B" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            {requesterCurrentLocation}
                        </span>
                    )}
                    {timeAgo && <span className="font-label" style={{ fontSize: "10px", color: "#A5937B" }}>{timeAgo}</span>}
                </div>
                {message && (
                    <p className="font-body text-sm italic leading-relaxed mt-1" style={{ color: "#666161", borderLeft: "2px solid rgba(165,147,123,0.35)", paddingLeft: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        "{message}"
                    </p>
                )}
                {error && <p className="font-label mt-1" style={{ fontSize: "11px", color: "#ba1a1a" }}>{error}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handle("approve")} disabled={!!loading}
                        className="inline-flex items-center gap-1.5 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-50"
                        style={{ fontSize: "10px", letterSpacing: "0.12em", background: "linear-gradient(180deg, #767070 0%, #666161 100%)", color: "#E9E3DE", padding: "8px 14px", borderRadius: "999px", border: "none", boxShadow: "0 2px 0 #3a3737" }}>
                    {loading === "approve" ? (
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#E9E3DE", animation: "spin 0.8s linear infinite" }} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                    Approve
                </button>
                <button onClick={() => handle("reject")} disabled={!!loading}
                        className="inline-flex items-center gap-1.5 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-50"
                        style={{ fontSize: "10px", letterSpacing: "0.12em", background: "transparent", color: "#A5937B", border: "1px solid rgba(165,147,123,0.35)", padding: "8px 14px", borderRadius: "999px" }}>
                    {loading === "reject" ? (
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#A5937B", animation: "spin 0.8s linear infinite" }} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                    Reject
                </button>
            </div>
        </div>
    );
}

function ManageTripPanel({ trip, onClose }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getTripJoinRequests(trip.tripId)
            .then((data) => { if (!cancelled) setRequests(Array.isArray(data) ? data : []); })
            .catch((err) => { if (!cancelled) setError(err.message ?? "Failed to load requests"); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [trip.tripId]);

    const handleApprove = (requestId) => setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    const handleReject  = (requestId) => setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    const pending = requests.filter((r) => r.status === "PENDING");

    return (
        <div className="px-5 md:px-7 py-5" style={{ borderTop: "1px solid rgba(165,147,123,0.25)", background: "#faf8f6" }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-label font-bold uppercase" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#3a3737" }}>Passenger Manifest</p>
                    <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>Join requests for this departure</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "#A5937B" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(165,147,123,0.12)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
            {loading && (
                <div className="flex items-center gap-3 py-4">
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#A5937B", borderRightColor: "#AF9AC9", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
                    <p className="font-label text-sm uppercase tracking-widest" style={{ color: "#A5937B" }}>Loading requests...</p>
                </div>
            )}
            {!loading && error && <p className="font-body text-sm py-3" style={{ color: "#ba1a1a" }}>{error}</p>}
            {!loading && !error && pending.length === 0 && (
                <div className="py-6 text-center">
                    <p className="font-label text-sm uppercase tracking-wider" style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#A5937B" }}>No pending requests</p>
                    <p className="font-body text-xs mt-1" style={{ color: "#666161" }}>When travelers request to join, they will appear here.</p>
                </div>
            )}
            {!loading && !error && pending.length > 0 && (
                <div className="space-y-3">
                    {pending.map((req) => (
                        <JoinRequestRow key={req.requestId} request={req} tripId={trip.tripId} onApprove={handleApprove} onReject={handleReject} />
                    ))}
                </div>
            )}
        </div>
    );
}

const TRIP_TYPE_OPTIONS = [
    { value: "CITY_BREAK",    label: "City Break" },
    { value: "ROAD_TRIP",     label: "Road Trip" },
    { value: "BEACH_ESCAPE",  label: "Beach Escape" },
    { value: "HIKING_NATURE", label: "Hiking" },
    { value: "CULTURE_FOOD",  label: "Culture & Food" },
    { value: "BACKPACKING",   label: "Backpacking" },
];

const BUDGET_OPTIONS = [
    { value: "BUDGET_FRIENDLY", label: "Budget" },
    { value: "MODERATE",        label: "Moderate" },
    { value: "LUXURY",          label: "Luxury" },
];

function SelectionPill({ label, selected, onClick }) {
    return (
        <button type="button" onClick={onClick}
                className="font-label font-semibold uppercase transition-all active:scale-95 flex-shrink-0"
                style={{
                    fontSize: "10px", letterSpacing: "0.12em", padding: "7px 14px", borderRadius: "999px",
                    background: selected ? "linear-gradient(180deg, #767070 0%, #666161 100%)" : "#faf8f6",
                    color: selected ? "#E9E3DE" : "#666161",
                    border: `1px solid ${selected ? "transparent" : "rgba(165,147,123,0.30)"}`,
                    boxShadow: selected ? "0 2px 0 #3a3737" : "none",
                }}>
            {label}
        </button>
    );
}

function FormLabel({ children }) {
    return (
        <label className="font-label uppercase block mb-2" style={{ fontSize: "9px", letterSpacing: "0.14em", fontWeight: 600, color: "#A5937B" }}>
            {children}
        </label>
    );
}

function FieldError({ msg }) {
    return msg ? <p className="font-label mt-1" style={{ fontSize: "11px", color: "#ba1a1a" }}>{msg}</p> : null;
}

const INITIAL_FORM = { title: "", destinationCity: "", destinationCountry: "", startDate: "", endDate: "", budget: "", tripType: "", description: "", targetGroupSize: 2 };

const inputStyle = { padding: "10px 12px", fontSize: "14px", background: "#faf8f6", border: "1.5px solid rgba(165,147,123,0.28)", borderRadius: "10px", color: "#3a3737", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" };
const inputFocus = (e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; };
const inputBlur  = (e) => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.28)"; e.currentTarget.style.boxShadow = "none"; };

function SectionNumber({ n }) {
    return (
        <div className="w-6 h-6 rounded-full flex items-center justify-center font-label font-bold text-xs flex-shrink-0"
             style={{ background: "linear-gradient(180deg, #767070 0%, #666161 100%)", color: "#E9E3DE", fontSize: "10px", boxShadow: "0 2px 0 #3a3737" }}>
            {n}
        </div>
    );
}

function CreateTripForm({ onSuccess, onCancel }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [debouncedCity, setDebouncedCity] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedCity(form.destinationCity), 500);
        return () => clearTimeout(t);
    }, [form.destinationCity]);

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim())             e.title = "Title is required";
        if (!form.destinationCity.trim())    e.destinationCity = "City is required";
        if (!form.destinationCountry.trim()) e.destinationCountry = "Country is required";
        if (!form.startDate)                e.startDate = "Start date is required";
        if (!form.endDate)                  e.endDate = "End date is required";
        if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = "End date must be after start date";
        if (!form.budget)                   e.budget = "Select a budget";
        if (!form.tripType)                 e.tripType = "Select a trip type";
        if (!form.description.trim())       e.description = "Description is required";
        if (form.targetGroupSize < 2)       e.targetGroupSize = "Minimum group size is 2";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setLoading(true); setServerError(null);
        try {
            await createTrip({ ...form, targetGroupSize: Number(form.targetGroupSize) });
            onSuccess?.();
        } catch (err) {
            setServerError(err.message ?? "Failed to create trip. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">

            {/* Section 1 — Destination */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <SectionNumber n={1} />
                    <div>
                        <p className="font-headline font-bold" style={{ fontSize: "15px", letterSpacing: "-0.01em", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Destination</p>
                        <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>Where are you going?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <FormLabel>Trip Title</FormLabel>
                        <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Rome long weekend — museums & food"
                               style={{ ...inputStyle, borderColor: errors.title ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                               onFocus={inputFocus} onBlur={inputBlur} />
                        <FieldError msg={errors.title} />
                    </div>
                    <div>
                        <FormLabel>City</FormLabel>
                        <input type="text" value={form.destinationCity} onChange={(e) => set("destinationCity", e.target.value)} placeholder="e.g. Rome"
                               style={{ ...inputStyle, borderColor: errors.destinationCity ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                               onFocus={inputFocus} onBlur={inputBlur} />
                        <FieldError msg={errors.destinationCity} />
                    </div>
                    <div>
                        <FormLabel>Country</FormLabel>
                        <input type="text" value={form.destinationCountry} onChange={(e) => set("destinationCountry", e.target.value)} placeholder="e.g. Italy"
                               style={{ ...inputStyle, borderColor: errors.destinationCountry ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                               onFocus={inputFocus} onBlur={inputBlur} />
                        <FieldError msg={errors.destinationCountry} />
                    </div>
                </div>

                {/* DiscoverPlaces — in afara grid-ului, full width */}
                {debouncedCity && debouncedCity.trim().length >= 2 && (
                    <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "14px", background: "#faf8f6", border: "1px solid rgba(165,147,123,0.22)" }}>
                        <DiscoverPlaces
                            city={debouncedCity}
                            country={form.destinationCountry}
                            tripType={form.tripType}
                            compact={true}
                        />
                    </div>
                )}
            </section>

            <div className="h-px opacity-50" style={{ background: "rgba(165,147,123,0.35)" }} />

            {/* Section 2 — Schedule */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <SectionNumber n={2} />
                    <div>
                        <p className="font-headline font-bold" style={{ fontSize: "15px", letterSpacing: "-0.01em", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Schedule</p>
                        <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>When does this departure leave?</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel>Departure date</FormLabel>
                        <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                               style={{ ...inputStyle, borderColor: errors.startDate ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                               onFocus={inputFocus} onBlur={inputBlur} />
                        <FieldError msg={errors.startDate} />
                    </div>
                    <div>
                        <FormLabel>Return date</FormLabel>
                        <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)}
                               style={{ ...inputStyle, borderColor: errors.endDate ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                               onFocus={inputFocus} onBlur={inputBlur} />
                        <FieldError msg={errors.endDate} />
                    </div>
                </div>
            </section>

            <div className="h-px opacity-50" style={{ background: "rgba(165,147,123,0.35)" }} />

            {/* Section 3 — Details */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <SectionNumber n={3} />
                    <div>
                        <p className="font-headline font-bold" style={{ fontSize: "15px", letterSpacing: "-0.01em", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Trip Details</p>
                        <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>Type, budget and group size</p>
                    </div>
                </div>
                <div className="space-y-5">
                    <div>
                        <FormLabel>Trip type</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {TRIP_TYPE_OPTIONS.map((opt) => (
                                <SelectionPill key={opt.value} label={opt.label} selected={form.tripType === opt.value} onClick={() => set("tripType", opt.value)} />
                            ))}
                        </div>
                        <FieldError msg={errors.tripType} />
                    </div>
                    <div>
                        <FormLabel>Budget</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {BUDGET_OPTIONS.map((opt) => (
                                <SelectionPill key={opt.value} label={opt.label} selected={form.budget === opt.value} onClick={() => set("budget", opt.value)} />
                            ))}
                        </div>
                        <FieldError msg={errors.budget} />
                    </div>
                    <div>
                        <FormLabel>Group size (including you)</FormLabel>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => set("targetGroupSize", Math.max(2, form.targetGroupSize - 1))}
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold transition-all active:scale-95"
                                    style={{ border: "1px solid rgba(165,147,123,0.35)", fontSize: "18px", background: "#faf8f6", color: "#3a3737" }}>-</button>
                            <span className="font-headline font-extrabold w-8 text-center" style={{ fontSize: "22px", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>{form.targetGroupSize}</span>
                            <button type="button" onClick={() => set("targetGroupSize", Math.min(12, form.targetGroupSize + 1))}
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold transition-all active:scale-95"
                                    style={{ border: "1px solid rgba(165,147,123,0.35)", fontSize: "18px", background: "#faf8f6", color: "#3a3737" }}>+</button>
                            <span className="font-label" style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#A5937B" }}>travelers total</span>
                        </div>
                        <FieldError msg={errors.targetGroupSize} />
                    </div>
                </div>
            </section>

            <div className="h-px opacity-50" style={{ background: "rgba(165,147,123,0.35)" }} />

            {/* Section 4 — Story */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <SectionNumber n={4} />
                    <div>
                        <p className="font-headline font-bold" style={{ fontSize: "15px", letterSpacing: "-0.01em", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Your Story</p>
                        <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>What kind of travelers are you looking for?</p>
                    </div>
                </div>
                <div>
                    <FormLabel>Description</FormLabel>
                    <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                              placeholder="Describe what you're planning, what kind of people you're looking for, and what would make this trip special..."
                              rows={4} maxLength={1000}
                              style={{ ...inputStyle, resize: "none", lineHeight: "1.6", borderColor: errors.description ? "#ba1a1a" : "rgba(165,147,123,0.28)" }}
                              onFocus={inputFocus} onBlur={inputBlur} />
                    <div className="flex justify-between mt-1">
                        <FieldError msg={errors.description} />
                        <span className="font-label ml-auto" style={{ fontSize: "10px", color: "#A5937B" }}>{form.description.length} / 1000</span>
                    </div>
                </div>
            </section>

            {serverError && (
                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.25)" }}>
                    <p className="font-body text-sm" style={{ color: "#ba1a1a" }}>{serverError}</p>
                </div>
            )}

            <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleSubmit} disabled={loading}
                        className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-60"
                        style={{ fontSize: "11px", letterSpacing: "0.12em", background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)", color: "#E9E3DE", padding: "12px 24px", borderRadius: "999px", border: "none", boxShadow: "0 4px 0 #3a3737, 0 6px 14px rgba(58,55,55,0.20)" }}>
                    {loading ? (
                        <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#E9E3DE", animation: "spin 0.8s linear infinite" }} />Publishing...</>
                    ) : (
                        <>Publish Departure<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></>
                    )}
                </button>
                <button type="button" onClick={onCancel} disabled={loading}
                        className="font-label font-semibold transition-colors disabled:opacity-50"
                        style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#A5937B", background: "none", border: "none", cursor: "pointer" }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default function MyTripsPage({ onNavigate, onOpenRoom }) {
    const [activeTab, setActiveTab] = useState("created");
    const [createdTrips, setCreatedTrips] = useState([]);
    const [joinedTrips, setJoinedTrips] = useState([]);
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [loadingJoined, setLoadingJoined] = useState(true);
    const [errorCreated, setErrorCreated] = useState(null);
    const [errorJoined, setErrorJoined] = useState(null);
    const [pendingCounts, setPendingCounts] = useState({});
    const [openManagePanelId, setOpenManagePanelId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchCreated = useCallback(async () => {
        setLoadingCreated(true); setErrorCreated(null);
        try { const data = await getMyCreatedTrips(); setCreatedTrips(Array.isArray(data) ? data : []); }
        catch (err) { setErrorCreated(err.message ?? "Failed to load your trips"); }
        finally { setLoadingCreated(false); }
    }, []);

    const fetchJoined = useCallback(async () => {
        setLoadingJoined(true); setErrorJoined(null);
        try { const data = await getMyJoinedTrips(); setJoinedTrips(Array.isArray(data) ? data : []); }
        catch (err) { setErrorJoined(err.message ?? "Failed to load joined trips"); }
        finally { setLoadingJoined(false); }
    }, []);

    useEffect(() => { fetchCreated(); }, [fetchCreated]);
    useEffect(() => { fetchJoined(); }, [fetchJoined]);

    useEffect(() => {
        if (createdTrips.length === 0) return;
        createdTrips.forEach((trip) => {
            getTripJoinRequests(trip.tripId)
                .then((reqs) => {
                    const count = Array.isArray(reqs) ? reqs.filter((r) => r.status === "PENDING").length : 0;
                    setPendingCounts((prev) => ({ ...prev, [trip.tripId]: count }));
                })
                .catch(() => {});
        });
    }, [createdTrips]);

    const handleManageTripClick = (trip) => setOpenManagePanelId((prev) => (prev === trip.tripId ? null : trip.tripId));
    const handleCreateSuccess = () => { setShowCreateForm(false); fetchCreated(); };

    const currentTrips = activeTab === "created" ? createdTrips : joinedTrips;
    const isLoading = activeTab === "created" ? loadingCreated : loadingJoined;
    const currentError = activeTab === "created" ? errorCreated : errorJoined;
    const refetch = activeTab === "created" ? fetchCreated : fetchJoined;

    return (
        <div className="space-y-8">

            <section className="relative rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                <div className="h-24 md:h-32 w-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #666161 0%, #575353 40%, #4d4949 100%)" }}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(58,55,55,0.55) 100%)" }} />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.06 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="#E9E3DE">
                            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                        </svg>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #666161, #A5937B, #AF9AC9)" }} />
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-8 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    <div className="w-14 h-14 rounded-xl border-4 flex items-center justify-center flex-shrink-0"
                         style={{ background: "linear-gradient(135deg, #666161 0%, #4d4949 100%)", borderColor: "#E9E3DE", boxShadow: "0 4px 0 #bfb9b4, 0 6px 16px rgba(58,55,55,0.18)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#E9E3DE">
                            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl tracking-tight" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                            My Trips
                        </h1>
                        <p className="font-label text-sm mt-0.5 uppercase tracking-wider" style={{ color: "#A5937B" }}>
                            {loadingCreated || loadingJoined
                                ? "Loading your itineraries..."
                                : `${createdTrips.length} commanded · ${joinedTrips.length} enrolled`}
                        </p>
                    </div>
                    {!showCreateForm && (
                        <button onClick={() => { setShowCreateForm(true); setActiveTab("created"); }}
                                className="inline-flex items-center gap-2 font-label font-bold uppercase self-end md:self-auto transition-all active:scale-95 flex-shrink-0"
                                style={{ fontSize: "10px", letterSpacing: "0.12em", background: "#E3C49B", color: "#3d2800", padding: "9px 18px", borderRadius: "999px", border: "none", boxShadow: "0 3px 0 #8a6e3a" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Trip
                        </button>
                    )}
                </div>
            </section>

            {showCreateForm && (
                <section className="rounded-xl overflow-hidden" style={{ background: "#ffffff", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)", border: "1px solid rgba(165,147,123,0.25)" }}>
                    <div className="px-6 md:px-8 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(165,147,123,0.25)" }}>
                        <div>
                            <p className="font-headline font-bold" style={{ fontSize: "16px", letterSpacing: "-0.01em", color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Publish a Departure</p>
                            <p className="font-label" style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#A5937B" }}>Create a new open trip and invite travelers to join</p>
                        </div>
                        <button onClick={() => setShowCreateForm(false)}
                                className="p-2 rounded-lg transition-all" style={{ color: "#A5937B", background: "none", border: "none", cursor: "pointer" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(165,147,123,0.12)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-6 md:px-8 py-7">
                        <CreateTripForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
                    </div>
                </section>
            )}

            <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "rgba(165,147,123,0.14)" }}>
                {[
                    { key: "created", label: `Commanded${createdTrips.length > 0 ? ` (${createdTrips.length})` : ""}` },
                    { key: "joined",  label: `Enrolled${joinedTrips.length > 0 ? ` (${joinedTrips.length})` : ""}` },
                ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className="font-label font-semibold uppercase transition-all"
                            style={{
                                fontSize: "10px", letterSpacing: "0.12em", padding: "8px 18px", borderRadius: "10px",
                                background: activeTab === tab.key ? "#ffffff" : "transparent",
                                color: activeTab === tab.key ? "#3a3737" : "#A5937B",
                                boxShadow: activeTab === tab.key ? "0 1px 4px rgba(58,55,55,0.12)" : "none",
                                border: "none", cursor: "pointer", transition: "all 0.15s ease",
                            }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading && <Spinner label="Loading your itineraries..." />}
            {!isLoading && currentError && <ErrorState message={currentError} onRetry={refetch} />}
            {!isLoading && !currentError && currentTrips.length === 0 && (
                <EmptyState tab={activeTab} onCreateTrip={() => setShowCreateForm(true)} onExplore={() => onNavigate?.("open-trips")} />
            )}
            {!isLoading && !currentError && currentTrips.length > 0 && (
                <div className="space-y-5">
                    {currentTrips.map((trip) => {
                        const panelOpen = openManagePanelId === trip.tripId;
                        const pendingCount = pendingCounts[trip.tripId] ?? 0;
                        return (
                            <div key={trip.tripId} className="flex flex-col rounded-xl overflow-hidden"
                                 style={{ boxShadow: panelOpen ? "0 8px 32px rgba(58,55,55,0.12)" : "none", transition: "box-shadow 0.2s ease" }}>
                                <TripTicketCard
                                    trip={trip}
                                    variant={activeTab === "created" ? "owned" : "joined"}
                                    pendingRequestCount={pendingCount}
                                    onManageTripClick={handleManageTripClick}
                                    onOpenRoom={onOpenRoom ? (t) => onOpenRoom(t.tripId) : undefined}
                                />
                                {panelOpen && activeTab === "created" && (
                                    <ManageTripPanel trip={trip} onClose={() => setOpenManagePanelId(null)} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!isLoading && !currentError && (
                <div className="text-center pt-4 pb-8">
                    <button onClick={() => onNavigate?.("open-trips")}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                            style={{ fontSize: "10px", letterSpacing: "0.12em", background: "transparent", color: "#666161", border: "1.5px solid rgba(165,147,123,0.35)", padding: "9px 20px", borderRadius: "999px", cursor: "pointer" }}>
                        Explore Open Trips
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}