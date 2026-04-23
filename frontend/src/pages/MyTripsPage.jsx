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

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-label text-sm text-outline uppercase tracking-widest">{label}</p>
        </div>
    );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center" style={{ border: "1.5px dashed #ffdad6" }}>
            <p className="font-body text-sm text-on-surface-variant mb-4">{message}</p>
            <button
                onClick={onRetry}
                className="font-label font-bold uppercase px-5 py-2.5 rounded-xl text-on-secondary bg-secondary hover:opacity-90 transition-all active:scale-95"
                style={{ fontSize: "11px", letterSpacing: "0.12em" }}
            >
                Try again
            </button>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onCreateTrip, onExplore }) {
    const isOwned = tab === "created";
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center rounded-xl" style={{ border: "1.5px dashed #c3c6d1" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,29,69,0.05)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-primary" style={{ opacity: 0.35 }}>
                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                </svg>
            </div>
            <div>
                <p className="font-headline font-extrabold text-xl text-primary tracking-tight mb-1">
                    {isOwned ? "No trips created yet" : "No trips joined yet"}
                </p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
                    {isOwned
                        ? "Publish a departure and invite fellow travelers to join."
                        : "Browse open trips and request to join one."}
                </p>
            </div>
            <button
                onClick={isOwned ? onCreateTrip : onExplore}
                className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                style={{
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    background: "#001d45",
                    color: "#ffffff",
                    padding: "10px 22px",
                    borderRadius: "999px",
                    boxShadow: "0 4px 16px rgba(0,29,69,0.20)",
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

// ─── Requester avatar ─────────────────────────────────────────────────────────

function RequesterAvatar({ name = "", url }) {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-lowest flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-surface-container-lowest">
            <span className="font-label font-bold text-on-primary" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
                {initials}
            </span>
        </div>
    );
}

// ─── Single join request row ──────────────────────────────────────────────────

function JoinRequestRow({ request, tripId, onApprove, onReject }) {
    const [loading, setLoading] = useState(null); // "approve" | "reject" | null
    const [done, setDone] = useState(null);        // "approved" | "rejected" | null
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

    const {
        requesterFullName = "",
        requesterProfilePictureUrl,
        requesterCurrentLocation,
        message,
        createdAt,
    } = request;

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
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg" style={{ background: done === "approved" ? "rgba(12,103,128,0.07)" : "rgba(186,26,26,0.05)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={done === "approved" ? "#0c6780" : "#ba1a1a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {done === "approved"
                        ? <polyline points="20 6 9 17 4 12" />
                        : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    }
                </svg>
                <span className="font-label font-semibold" style={{ fontSize: "11px", color: done === "approved" ? "#0c6780" : "#ba1a1a" }}>
                    {requesterFullName} — {done === "approved" ? "Approved" : "Rejected"}
                </span>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4 px-4 rounded-lg group transition-all"
            style={{ border: "1px solid rgba(0,29,69,0.06)", background: "#fff" }}
        >
            {/* Left accent */}
            <div
                className="hidden md:block w-0.5 self-stretch rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(to bottom, #001d45, #0c6780)", minHeight: "40px" }}
            />

            <RequesterAvatar name={requesterFullName} url={requesterProfilePictureUrl} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-label font-bold text-primary" style={{ fontSize: "13px" }}>
                        {requesterFullName}
                    </span>
                    {requesterCurrentLocation && (
                        <span className="font-label text-outline flex items-center gap-1" style={{ fontSize: "10px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            {requesterCurrentLocation}
                        </span>
                    )}
                    {timeAgo && (
                        <span className="font-label text-outline" style={{ fontSize: "10px" }}>{timeAgo}</span>
                    )}
                </div>

                {message && (
                    <p
                        className="font-body text-sm text-on-surface-variant italic leading-relaxed mt-1"
                        style={{
                            borderLeft: "2px solid #e6e8ea",
                            paddingLeft: "10px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        "{message}"
                    </p>
                )}

                {error && (
                    <p className="font-label text-error mt-1" style={{ fontSize: "11px" }}>{error}</p>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => handle("approve")}
                    disabled={!!loading}
                    className="inline-flex items-center gap-1.5 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-50"
                    style={{
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        background: "#001d45",
                        color: "#fff",
                        padding: "8px 14px",
                        borderRadius: "999px",
                        boxShadow: "0 2px 8px rgba(0,29,69,0.18)",
                    }}
                >
                    {loading === "approve" ? (
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                    Approve
                </button>
                <button
                    onClick={() => handle("reject")}
                    disabled={!!loading}
                    className="inline-flex items-center gap-1.5 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-50"
                    style={{
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        background: "transparent",
                        color: "#737780",
                        border: "1px solid #c3c6d1",
                        padding: "8px 14px",
                        borderRadius: "999px",
                    }}
                >
                    {loading === "reject" ? (
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    )}
                    Reject
                </button>
            </div>
        </div>
    );
}

// ─── Manage Trip panel ────────────────────────────────────────────────────────
// Inline panel that slides open below an owned trip card.

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

    const handleApprove = (requestId) => {
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    };
    const handleReject = (requestId) => {
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    };

    const pending = requests.filter((r) => r.status === "PENDING");

    return (
        <div
            className="border-t border-outline-variant bg-surface-container-low px-5 md:px-7 py-5"
            style={{ borderTop: "1px solid rgba(0,29,69,0.08)" }}
        >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-label font-bold text-primary" style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        Passenger Manifest
                    </p>
                    <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>
                        Join requests for this departure
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="font-label text-outline hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container"
                    style={{ fontSize: "10px", letterSpacing: "0.08em" }}
                    aria-label="Close panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {loading && (
                <div className="flex items-center gap-3 py-4">
                    <svg className="animate-spin h-5 w-5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="font-label text-sm text-outline uppercase tracking-widest">Loading requests...</p>
                </div>
            )}

            {!loading && error && (
                <p className="font-body text-sm text-error py-3">{error}</p>
            )}

            {!loading && !error && pending.length === 0 && (
                <div className="py-6 text-center">
                    <p className="font-label text-sm text-outline uppercase tracking-wider" style={{ fontSize: "11px", letterSpacing: "0.12em" }}>
                        No pending requests
                    </p>
                    <p className="font-body text-xs text-on-surface-variant mt-1">
                        When travelers request to join, they will appear here.
                    </p>
                </div>
            )}

            {!loading && !error && pending.length > 0 && (
                <div className="space-y-3">
                    {pending.map((req) => (
                        <JoinRequestRow
                            key={req.requestId}
                            request={req}
                            tripId={trip.tripId}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Create Trip Form ─────────────────────────────────────────────────────────

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
        <button
            type="button"
            onClick={onClick}
            className="font-label font-semibold uppercase transition-all active:scale-95 flex-shrink-0"
            style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                padding: "7px 14px",
                borderRadius: "999px",
                background: selected ? "#001d45" : "#ffffff",
                color: selected ? "#ffffff" : "#737780",
                border: `1px solid ${selected ? "#001d45" : "#c3c6d1"}`,
                boxShadow: selected ? "0 2px 8px rgba(0,29,69,0.16)" : "none",
            }}
        >
            {label}
        </button>
    );
}

function FormLabel({ children }) {
    return (
        <label
            className="font-label uppercase text-outline block mb-2"
            style={{ fontSize: "9px", letterSpacing: "0.14em", fontWeight: 600 }}
        >
            {children}
        </label>
    );
}

function FieldError({ msg }) {
    return msg ? (
        <p className="font-label text-error mt-1" style={{ fontSize: "11px" }}>{msg}</p>
    ) : null;
}

const INITIAL_FORM = {
    title: "",
    destinationCity: "",
    destinationCountry: "",
    startDate: "",
    endDate: "",
    budget: "",
    tripType: "",
    description: "",
    targetGroupSize: 2,
};

function CreateTripForm({ onSuccess, onCancel }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim())            e.title = "Title is required";
        if (!form.destinationCity.trim())   e.destinationCity = "City is required";
        if (!form.destinationCountry.trim()) e.destinationCountry = "Country is required";
        if (!form.startDate)               e.startDate = "Start date is required";
        if (!form.endDate)                 e.endDate = "End date is required";
        if (form.startDate && form.endDate && form.startDate >= form.endDate)
            e.endDate = "End date must be after start date";
        if (!form.budget)                  e.budget = "Select a budget";
        if (!form.tripType)                e.tripType = "Select a trip type";
        if (!form.description.trim())      e.description = "Description is required";
        if (form.targetGroupSize < 2)      e.targetGroupSize = "Minimum group size is 2";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setLoading(true);
        setServerError(null);
        try {
            await createTrip({
                ...form,
                targetGroupSize: Number(form.targetGroupSize),
            });
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
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-label font-bold text-on-primary text-xs flex-shrink-0"
                        style={{ background: "#001d45", fontSize: "10px" }}
                    >
                        1
                    </div>
                    <div>
                        <p className="font-headline font-bold text-primary" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Destination</p>
                        <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>Where are you going?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <FormLabel>Trip Title</FormLabel>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. Rome long weekend — museums & food"
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                            style={{ borderColor: errors.title ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px" }}
                        />
                        <FieldError msg={errors.title} />
                    </div>
                    <div>
                        <FormLabel>City</FormLabel>
                        <input
                            type="text"
                            value={form.destinationCity}
                            onChange={(e) => set("destinationCity", e.target.value)}
                            placeholder="e.g. Rome"
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                            style={{ borderColor: errors.destinationCity ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px" }}
                        />
                        <FieldError msg={errors.destinationCity} />
                    </div>
                    <div>
                        <FormLabel>Country</FormLabel>
                        <input
                            type="text"
                            value={form.destinationCountry}
                            onChange={(e) => set("destinationCountry", e.target.value)}
                            placeholder="e.g. Italy"
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                            style={{ borderColor: errors.destinationCountry ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px" }}
                        />
                        <FieldError msg={errors.destinationCountry} />
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-outline-variant opacity-50" />

            {/* Section 2 — Schedule */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-label font-bold text-on-primary text-xs flex-shrink-0"
                        style={{ background: "#001d45", fontSize: "10px" }}
                    >
                        2
                    </div>
                    <div>
                        <p className="font-headline font-bold text-primary" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Schedule</p>
                        <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>When does this departure leave?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel>Departure date</FormLabel>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => set("startDate", e.target.value)}
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                            style={{ borderColor: errors.startDate ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px" }}
                        />
                        <FieldError msg={errors.startDate} />
                    </div>
                    <div>
                        <FormLabel>Return date</FormLabel>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => set("endDate", e.target.value)}
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                            style={{ borderColor: errors.endDate ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px" }}
                        />
                        <FieldError msg={errors.endDate} />
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-outline-variant opacity-50" />

            {/* Section 3 — Details */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-label font-bold text-on-primary text-xs flex-shrink-0"
                        style={{ background: "#001d45", fontSize: "10px" }}
                    >
                        3
                    </div>
                    <div>
                        <p className="font-headline font-bold text-primary" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Trip Details</p>
                        <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>Type, budget and group size</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <FormLabel>Trip type</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {TRIP_TYPE_OPTIONS.map((opt) => (
                                <SelectionPill
                                    key={opt.value}
                                    label={opt.label}
                                    selected={form.tripType === opt.value}
                                    onClick={() => set("tripType", opt.value)}
                                />
                            ))}
                        </div>
                        <FieldError msg={errors.tripType} />
                    </div>

                    <div>
                        <FormLabel>Budget</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {BUDGET_OPTIONS.map((opt) => (
                                <SelectionPill
                                    key={opt.value}
                                    label={opt.label}
                                    selected={form.budget === opt.value}
                                    onClick={() => set("budget", opt.value)}
                                />
                            ))}
                        </div>
                        <FieldError msg={errors.budget} />
                    </div>

                    <div>
                        <FormLabel>Group size (including you)</FormLabel>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => set("targetGroupSize", Math.max(2, form.targetGroupSize - 1))}
                                className="w-9 h-9 rounded-full border flex items-center justify-center font-headline font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95"
                                style={{ borderColor: "rgba(0,29,69,0.14)", fontSize: "18px" }}
                            >
                                -
                            </button>
                            <span className="font-headline font-extrabold text-primary w-8 text-center" style={{ fontSize: "22px" }}>
                                {form.targetGroupSize}
                            </span>
                            <button
                                type="button"
                                onClick={() => set("targetGroupSize", Math.min(12, form.targetGroupSize + 1))}
                                className="w-9 h-9 rounded-full border flex items-center justify-center font-headline font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95"
                                style={{ borderColor: "rgba(0,29,69,0.14)", fontSize: "18px" }}
                            >
                                +
                            </button>
                            <span className="font-label text-outline" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                                travelers total
                            </span>
                        </div>
                        <FieldError msg={errors.targetGroupSize} />
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-outline-variant opacity-50" />

            {/* Section 4 — Story */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-label font-bold text-on-primary text-xs flex-shrink-0"
                        style={{ background: "#001d45", fontSize: "10px" }}
                    >
                        4
                    </div>
                    <div>
                        <p className="font-headline font-bold text-primary" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Your Story</p>
                        <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>What kind of travelers are you looking for?</p>
                    </div>
                </div>

                <div>
                    <FormLabel>Description</FormLabel>
                    <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Describe what you're planning, what kind of people you're looking for, and what would make this trip special..."
                        rows={4}
                        maxLength={1000}
                        className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest resize-none focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                        style={{ borderColor: errors.description ? "#ba1a1a" : "rgba(0,29,69,0.12)", padding: "10px 12px", fontSize: "14px", lineHeight: "1.6" }}
                    />
                    <div className="flex justify-between mt-1">
                        <FieldError msg={errors.description} />
                        <span className="font-label text-outline ml-auto" style={{ fontSize: "10px" }}>
                            {form.description.length} / 1000
                        </span>
                    </div>
                </div>
            </section>

            {/* Server error */}
            {serverError && (
                <div className="rounded-xl px-4 py-3 bg-error-container">
                    <p className="font-body text-sm text-on-error-container">{serverError}</p>
                </div>
            )}

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-60"
                    style={{
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        background: "#001d45",
                        color: "#ffffff",
                        padding: "12px 24px",
                        borderRadius: "999px",
                        boxShadow: "0 4px 16px rgba(0,29,69,0.22)",
                    }}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Publishing...
                        </>
                    ) : (
                        <>
                            Publish Departure
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="font-label font-semibold text-outline hover:text-on-surface transition-colors disabled:opacity-50"
                    style={{ fontSize: "11px", letterSpacing: "0.08em" }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── MyTripsPage ──────────────────────────────────────────────────────────────

export default function MyTripsPage({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("created"); // "created" | "joined"
    const [createdTrips, setCreatedTrips] = useState([]);
    const [joinedTrips, setJoinedTrips] = useState([]);
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [loadingJoined, setLoadingJoined] = useState(true);
    const [errorCreated, setErrorCreated] = useState(null);
    const [errorJoined, setErrorJoined] = useState(null);

    // Pending request counts per tripId — fetched lazily when manage panel opens
    const [pendingCounts, setPendingCounts] = useState({});

    // Which trip's manage panel is open
    const [openManagePanelId, setOpenManagePanelId] = useState(null);

    // Create trip form visibility
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchCreated = useCallback(async () => {
        setLoadingCreated(true);
        setErrorCreated(null);
        try {
            const data = await getMyCreatedTrips();
            setCreatedTrips(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorCreated(err.message ?? "Failed to load your trips");
        } finally {
            setLoadingCreated(false);
        }
    }, []);

    const fetchJoined = useCallback(async () => {
        setLoadingJoined(true);
        setErrorJoined(null);
        try {
            const data = await getMyJoinedTrips();
            setJoinedTrips(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorJoined(err.message ?? "Failed to load joined trips");
        } finally {
            setLoadingJoined(false);
        }
    }, []);

    useEffect(() => { fetchCreated(); }, [fetchCreated]);
    useEffect(() => { fetchJoined(); }, [fetchJoined]);

    // Fetch pending request counts for owned trips
    useEffect(() => {
        if (createdTrips.length === 0) return;
        createdTrips.forEach((trip) => {
            getTripJoinRequests(trip.tripId)
                .then((reqs) => {
                    const count = Array.isArray(reqs)
                        ? reqs.filter((r) => r.status === "PENDING").length
                        : 0;
                    setPendingCounts((prev) => ({ ...prev, [trip.tripId]: count }));
                })
                .catch(() => {});
        });
    }, [createdTrips]);

    const handleManageTripClick = (trip) => {
        setOpenManagePanelId((prev) => (prev === trip.tripId ? null : trip.tripId));
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        fetchCreated();
    };

    const currentTrips = activeTab === "created" ? createdTrips : joinedTrips;
    const isLoading = activeTab === "created" ? loadingCreated : loadingJoined;
    const currentError = activeTab === "created" ? errorCreated : errorJoined;
    const refetch = activeTab === "created" ? fetchCreated : fetchJoined;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">

            {/* ── Page header ───────────────────────────────────────────────── */}
            <section className="relative bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,29,69,0.05)" }}>
                <div className="h-24 md:h-32 w-full bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90" />
                    <div
                        className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none"
                        style={{ opacity: 0.04 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="white">
                            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent opacity-60" />
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-8 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    <div
                        className="w-14 h-14 rounded-xl border-4 flex items-center justify-center flex-shrink-0"
                        style={{ background: "#001d45", borderColor: "#fff", boxShadow: "0 8px 24px rgba(0,29,69,0.22)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                            My Trips
                        </h1>
                        <p className="font-label text-sm text-on-surface-variant mt-0.5 uppercase tracking-wider">
                            {loadingCreated || loadingJoined
                                ? "Loading your itineraries..."
                                : `${createdTrips.length} commanded · ${joinedTrips.length} enrolled`}
                        </p>
                    </div>

                    {/* New trip button */}
                    {!showCreateForm && (
                        <button
                            onClick={() => { setShowCreateForm(true); setActiveTab("created"); }}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase self-end md:self-auto transition-all active:scale-95 flex-shrink-0"
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                background: "#ffb77d",
                                color: "#2f1500",
                                padding: "9px 18px",
                                borderRadius: "999px",
                                boxShadow: "0 4px 12px rgba(255,183,125,0.30)",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Trip
                        </button>
                    )}
                </div>
            </section>

            {/* ── Create Trip Form ──────────────────────────────────────────── */}
            {showCreateForm && (
                <section
                    className="bg-surface-container-lowest rounded-xl overflow-hidden"
                    style={{ boxShadow: "0 4px 24px rgba(0,29,69,0.08)", border: "1px solid rgba(0,29,69,0.06)" }}
                >
                    {/* Form header */}
                    <div className="px-6 md:px-8 py-5 border-b border-outline-variant flex items-center justify-between" style={{ borderColor: "rgba(0,29,69,0.08)" }}>
                        <div>
                            <p className="font-headline font-bold text-primary" style={{ fontSize: "16px", letterSpacing: "-0.01em" }}>
                                Publish a Departure
                            </p>
                            <p className="font-label text-outline" style={{ fontSize: "10px", letterSpacing: "0.08em" }}>
                                Create a new open trip and invite travelers to join
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="p-2 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Form body */}
                    <div className="px-6 md:px-8 py-7">
                        <CreateTripForm
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                </section>
            )}

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "#eceef0" }}>
                {[
                    { key: "created", label: `Commanded${createdTrips.length > 0 ? ` (${createdTrips.length})` : ""}` },
                    { key: "joined",  label: `Enrolled${joinedTrips.length > 0 ? ` (${joinedTrips.length})` : ""}` },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="font-label font-semibold uppercase transition-all"
                        style={{
                            fontSize: "10px",
                            letterSpacing: "0.12em",
                            padding: "8px 18px",
                            borderRadius: "10px",
                            background: activeTab === tab.key ? "#ffffff" : "transparent",
                            color: activeTab === tab.key ? "#001d45" : "#737780",
                            boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,29,69,0.10)" : "none",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Trip list ─────────────────────────────────────────────────── */}
            {isLoading && <Spinner label="Loading your itineraries..." />}

            {!isLoading && currentError && (
                <ErrorState message={currentError} onRetry={refetch} />
            )}

            {!isLoading && !currentError && currentTrips.length === 0 && (
                <EmptyState
                    tab={activeTab}
                    onCreateTrip={() => setShowCreateForm(true)}
                    onExplore={() => onNavigate?.("open-trips")}
                />
            )}

            {!isLoading && !currentError && currentTrips.length > 0 && (
                <div className="space-y-5">
                    {currentTrips.map((trip) => {
                        const panelOpen = openManagePanelId === trip.tripId;
                        const pendingCount = pendingCounts[trip.tripId] ?? 0;

                        return (
                            <div
                                key={trip.tripId}
                                className="flex flex-col rounded-xl overflow-hidden"
                                style={{
                                    boxShadow: panelOpen
                                        ? "0 8px 32px rgba(0,29,69,0.10)"
                                        : "none",
                                    transition: "box-shadow 0.2s ease",
                                }}
                            >
                                <TripTicketCard
                                    trip={trip}
                                    variant={activeTab === "created" ? "owned" : "joined"}
                                    pendingRequestCount={pendingCount}
                                    onManageTripClick={handleManageTripClick}
                                />
                                {panelOpen && activeTab === "created" && (
                                    <ManageTripPanel
                                        trip={trip}
                                        onClose={() => setOpenManagePanelId(null)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Explore CTA ───────────────────────────────────────────────── */}
            {!isLoading && !currentError && (
                <div className="text-center pt-4 pb-8">
                    <button
                        onClick={() => onNavigate?.("open-trips")}
                        className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                        style={{
                            fontSize: "10px",
                            letterSpacing: "0.12em",
                            background: "transparent",
                            color: "#001d45",
                            border: "1.5px solid rgba(0,29,69,0.20)",
                            padding: "9px 20px",
                            borderRadius: "999px",
                        }}
                    >
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