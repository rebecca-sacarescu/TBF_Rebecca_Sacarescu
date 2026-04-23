import { useState, useEffect, useRef, useCallback } from "react";
import TokenService from "../services/tokenService";
import profileApi from "../services/profileApi";

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_GROUPS = [
    {
        label: "Discovery",
        items: [
            {
                key: "feed",
                label: "My Feed",
                sub: "Discover travelers",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.27 15.58l-1.54-3.77-3.77-1.54 8.69-3.38-3.38 8.69z" />
                    </svg>
                ),
            },
            {
                key: "saved",
                label: "Saved",
                sub: "Profiles you bookmarked",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "Social",
        items: [
            {
                key: "matches",
                label: "Matches",
                sub: "Mutual connections",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "Trips",
        items: [
            {
                key: "open-trips",
                label: "Open Trips",
                sub: "Browse departures",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                    </svg>
                ),
            },
            {
                key: "my-trips",
                label: "My Trips",
                sub: "Commanded & enrolled",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "Account",
        items: [
            {
                key: "profile",
                label: "My Profile",
                sub: "Travel DNA & settings",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                ),
            },
        ],
    },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function resolveActive(page) {
    if (page === "discover") return "feed";
    return page;
}

function getActiveItem(page) {
    const key = resolveActive(page);
    return ALL_ITEMS.find((i) => i.key === key) ?? ALL_ITEMS[0];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function NavAvatar({ name = "", url }) {
    const initials =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join("") || "TB";

    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
                background: "rgba(255,183,125,0.18)",
                border: "1.5px solid rgba(255,183,125,0.35)",
            }}
        >
            {url ? (
                <img
                    src={url}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <span
                    className="font-label font-bold text-tertiary-fixed-dim select-none"
                    style={{ fontSize: "10px", letterSpacing: "0.06em" }}
                >
                    {initials}
                </span>
            )}
        </div>
    );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

export default function TopNav({ activeTab, onNavigate }) {
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const active = resolveActive(activeTab);
    const activeItem = getActiveItem(activeTab);

    // Fetch profile for avatar — fire and forget
    useEffect(() => {
        profileApi
            .getMyProfile()
            .then((data) => setProfile(data))
            .catch(() => {});
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    const handleNavigate = useCallback(
        (key) => {
            setOpen(false);
            onNavigate(key);
        },
        [onNavigate]
    );

    const handleLogout = useCallback(() => {
        setOpen(false);
        TokenService.logout();
        onNavigate("login");
    }, [onNavigate]);

    return (
        <>
            {/* ── Header bar ──────────────────────────────────────────────── */}
            <header
                className="fixed top-0 w-full z-50 bg-primary"
                style={{ boxShadow: "0 2px 24px rgba(0,29,69,0.20)" }}
            >
                <nav className="flex items-center justify-between px-5 md:px-8 h-16 md:h-[68px]">

                    {/* Left: trigger button */}
                    <button
                        ref={triggerRef}
                        onClick={() => setOpen((v) => !v)}
                        className="flex items-center gap-3 select-none focus:outline-none"
                        aria-label="Open navigation"
                        aria-expanded={open}
                    >
                        {/* Animated hamburger */}
                        <div
                            className="w-8 h-8 rounded-lg flex flex-col items-center justify-center gap-[5px] transition-colors"
                            style={{ background: open ? "rgba(255,255,255,0.10)" : "transparent" }}
                        >
                            <span
                                className="block rounded-full transition-all duration-250 origin-center"
                                style={{
                                    width: "15px",
                                    height: "1.5px",
                                    background: "#fff",
                                    transform: open
                                        ? "translateY(6.5px) rotate(45deg)"
                                        : "none",
                                }}
                            />
                            <span
                                className="block rounded-full transition-all duration-200"
                                style={{
                                    width: "15px",
                                    height: "1.5px",
                                    background: "#fff",
                                    opacity: open ? 0 : 0.55,
                                    transform: open ? "scaleX(0)" : "none",
                                }}
                            />
                            <span
                                className="block rounded-full transition-all duration-250 origin-center"
                                style={{
                                    width: "15px",
                                    height: "1.5px",
                                    background: "#fff",
                                    transform: open
                                        ? "translateY(-6.5px) rotate(-45deg)"
                                        : "none",
                                }}
                            />
                        </div>

                        {/* Brand + current page label */}
                        <div className="flex flex-col items-start leading-none gap-0.5">
                            <span
                                className="font-headline font-extrabold text-white uppercase"
                                style={{ fontSize: "14px", letterSpacing: "0.20em" }}
                            >
                                Travel Buddy
                            </span>
                            <span
                                className="font-label font-semibold uppercase text-tertiary-fixed-dim"
                                style={{ fontSize: "9px", letterSpacing: "0.16em", opacity: 0.85 }}
                            >
                                {activeItem.label}
                            </span>
                        </div>
                    </button>

                    {/* Right: avatar → goes to profile */}
                    <button
                        onClick={() => handleNavigate("profile")}
                        className="flex items-center gap-2.5 group focus:outline-none"
                        aria-label="My profile"
                    >
                        <span
                            className="hidden md:block font-label font-semibold uppercase text-slate-300 group-hover:text-white transition-colors"
                            style={{ fontSize: "10px", letterSpacing: "0.12em" }}
                        >
                            {profile?.fullName?.split(" ")[0] ?? "Profile"}
                        </span>
                        <NavAvatar
                            name={profile?.fullName ?? ""}
                            url={profile?.profilePictureUrl}
                        />
                    </button>
                </nav>
            </header>

            {/* ── Backdrop ────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-40 transition-all duration-200"
                style={{
                    background: "rgba(0,10,28,0.35)",
                    backdropFilter: "blur(2px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
                aria-hidden="true"
            />

            {/* ── Dropdown panel ──────────────────────────────────────────── */}
            <div
                ref={dropdownRef}
                className="fixed top-16 md:top-[68px] left-0 z-50"
                style={{
                    opacity: open ? 1 : 0,
                    transform: open
                        ? "scale(1) translateY(0)"
                        : "scale(0.96) translateY(-8px)",
                    transition: "opacity 0.18s ease, transform 0.18s ease",
                    pointerEvents: open ? "auto" : "none",
                    transformOrigin: "top left",
                }}
            >
                <div
                    className="m-3 rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        width: "clamp(260px, 88vw, 296px)",
                        background: "#ffffff",
                        boxShadow:
                            "0 20px 60px rgba(0,29,69,0.18), 0 4px 16px rgba(0,29,69,0.08)",
                        border: "1px solid rgba(0,29,69,0.06)",
                    }}
                >
                    {/* Top accent strip */}
                    <div
                        className="h-0.5 w-full flex-shrink-0"
                        style={{
                            background:
                                "linear-gradient(to right, #001d45, #0c6780, #ffb77d)",
                        }}
                    />

                    {/* Nav items */}
                    <div
                        className="py-2 flex-1 overflow-y-auto"
                        style={{ maxHeight: "calc(100vh - 130px)" }}
                    >
                        {NAV_GROUPS.map((group, gi) => (
                            <div key={group.label}>
                                {/* Group label */}
                                <div
                                    className={`px-4 ${gi === 0 ? "pt-2 pb-1" : "pt-3 pb-1"} flex items-center gap-2`}
                                >
                                    {gi > 0 && (
                                        <div
                                            className="flex-1 h-px"
                                            style={{ background: "rgba(0,29,69,0.06)" }}
                                        />
                                    )}
                                    <span
                                        className="font-label text-outline flex-shrink-0"
                                        style={{
                                            fontSize: "8px",
                                            letterSpacing: "0.20em",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {group.label}
                                    </span>
                                    {gi > 0 && (
                                        <div
                                            className="flex-1 h-px"
                                            style={{ background: "rgba(0,29,69,0.06)" }}
                                        />
                                    )}
                                </div>

                                {/* Items */}
                                {group.items.map((item) => {
                                    const isActive = active === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNavigate(item.key)}
                                            className="w-full flex items-center gap-3 px-3 py-2 relative transition-colors focus:outline-none"
                                            style={{
                                                background: isActive
                                                    ? "rgba(0,29,69,0.045)"
                                                    : "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive)
                                                    e.currentTarget.style.background =
                                                        "rgba(0,29,69,0.025)";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive)
                                                    e.currentTarget.style.background =
                                                        "transparent";
                                            }}
                                        >
                                            {/* Active bar */}
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                                                style={{
                                                    width: "3px",
                                                    height: isActive ? "56%" : "0%",
                                                    background:
                                                        "linear-gradient(to bottom, #001d45, #0c6780)",
                                                    transition: "height 0.15s ease",
                                                }}
                                            />

                                            {/* Icon */}
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                                                style={{
                                                    background: isActive
                                                        ? "#001d45"
                                                        : "rgba(0,29,69,0.06)",
                                                    color: isActive ? "#ffffff" : "#43474f",
                                                }}
                                            >
                                                {item.icon}
                                            </div>

                                            {/* Text */}
                                            <div className="flex flex-col items-start min-w-0 flex-1">
                                                <span
                                                    className="font-label leading-snug"
                                                    style={{
                                                        fontSize: "13px",
                                                        fontWeight: isActive ? 700 : 500,
                                                        color: isActive ? "#001d45" : "#191c1e",
                                                        letterSpacing: "-0.01em",
                                                    }}
                                                >
                                                    {item.label}
                                                </span>
                                                <span
                                                    className="font-label text-outline leading-tight truncate w-full text-left"
                                                    style={{
                                                        fontSize: "10px",
                                                        letterSpacing: "0.01em",
                                                    }}
                                                >
                                                    {item.sub}
                                                </span>
                                            </div>

                                            {/* Active checkmark */}
                                            {isActive && (
                                                <div className="flex-shrink-0 ml-1">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#0c6780"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
                        style={{
                            borderTop: "1px solid rgba(0,29,69,0.07)",
                            background: "rgba(0,29,69,0.018)",
                        }}
                    >
                        {/* Decorative dots */}
                        <div className="flex items-center gap-2">
                            <div className="flex gap-[5px]">
                                <div
                                    className="w-1.5 h-1.5 rounded-full bg-primary"
                                    style={{ opacity: 0.25 }}
                                />
                                <div
                                    className="w-1.5 h-1.5 rounded-full bg-secondary"
                                    style={{ opacity: 0.25 }}
                                />
                                <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: "#ffb77d", opacity: 0.45 }}
                                />
                            </div>
                            <span
                                className="font-label text-outline"
                                style={{
                                    fontSize: "8px",
                                    letterSpacing: "0.16em",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                }}
                            >
                                Travel Buddy
                            </span>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 font-label font-semibold text-outline hover:text-error transition-colors px-2.5 py-1.5 rounded-lg hover:bg-error-container"
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.10em",
                                textTransform: "uppercase",
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}