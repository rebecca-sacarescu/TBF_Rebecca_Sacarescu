import { useState, useEffect, useRef, useCallback } from "react";
import TokenService from "../services/tokenService";
import profileApi from "../services/profileApi";

// ─── Palette (matches FeedPage) ───────────────────────────────────────────────
const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    lavender:   "#AF9AC9",
    dark:       "#3a3737",
};

const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

// ─── Nav structure — unchanged ────────────────────────────────────────────────
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
    const inits = name.trim().split(/\s+/).filter(Boolean)
        .slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "TB";

    return (
        <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            background: `linear-gradient(135deg, ${C.lavender} 0%, ${C.tan} 100%)`,
            border: `2px solid rgba(233,227,222,0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 2px 8px rgba(102,97,97,0.20)`,
        }}>
            {url ? (
                <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                     onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12px", color: C.beigeLight, letterSpacing: "0.04em" }}>
                    {inits}
                </span>
            )}
        </div>
    );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
export default function TopNav({ activeTab, onNavigate }) {
    const [open, setOpen]       = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef           = useRef(null);
    const triggerRef            = useRef(null);

    const active     = resolveActive(activeTab);
    const activeItem = getActiveItem(activeTab);

    // Fetch profile for avatar — fire and forget — unchanged
    useEffect(() => {
        profileApi.getMyProfile().then((data) => setProfile(data)).catch(() => {});
    }, []);

    // Close on outside click — unchanged
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                triggerRef.current  && !triggerRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close on Escape — unchanged
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    const handleNavigate = useCallback((key) => { setOpen(false); onNavigate(key); }, [onNavigate]);
    const handleLogout   = useCallback(() => { setOpen(false); TokenService.logout(); onNavigate("login"); }, [onNavigate]);

    return (
        <>
            {/* Google Fonts — same as FeedPage */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* ── Header bar ──────────────────────────────────────────────── */}
            <header
                className="fixed top-0 w-full z-50"
                style={{
                    height: "72px",
                    background: `linear-gradient(180deg, ${C.grayWarm} 0%, #575353 100%)`,
                    boxShadow: `0 4px 0 ${C.dark}, 0 6px 24px rgba(58,55,55,0.28)`,
                    borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}
            >
                <nav style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: "100%", padding: "0 24px",
                    maxWidth: "100%",
                }}>

                    {/* Left: trigger */}
                    <button
                        ref={triggerRef}
                        onClick={() => setOpen((v) => !v)}
                        style={{
                            display: "flex", alignItems: "center", gap: "14px",
                            background: "none", border: "none", cursor: "pointer",
                            padding: 0, outline: "none",
                        }}
                        aria-label="Open navigation"
                        aria-expanded={open}
                    >
                        {/* Hamburger */}
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: "5px",
                            background: open ? "rgba(233,227,222,0.12)" : "rgba(233,227,222,0.06)",
                            border: "1px solid rgba(233,227,222,0.12)",
                            transition: "background 0.15s ease",
                        }}>
                            <span style={{
                                display: "block", width: "15px", height: "1.5px",
                                background: C.beigeLight, borderRadius: "999px",
                                transition: "transform 0.25s ease",
                                transform: open ? "translateY(6.5px) rotate(45deg)" : "none",
                            }} />
                            <span style={{
                                display: "block", width: "15px", height: "1.5px",
                                background: C.beigeLight, borderRadius: "999px",
                                transition: "opacity 0.2s ease, transform 0.2s ease",
                                opacity: open ? 0 : 0.6,
                                transform: open ? "scaleX(0)" : "none",
                            }} />
                            <span style={{
                                display: "block", width: "15px", height: "1.5px",
                                background: C.beigeLight, borderRadius: "999px",
                                transition: "transform 0.25s ease",
                                transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none",
                            }} />
                        </div>

                        {/* Brand */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                            <span style={{
                                fontFamily: SERIF,
                                fontSize: "18px",
                                color: C.beigeLight,
                                letterSpacing: "0.02em",
                                lineHeight: 1,
                            }}>
                                Travel Buddy
                            </span>
                            <span style={{
                                fontFamily: SANS,
                                fontWeight: 500,
                                fontSize: "9px",
                                color: C.sand,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                opacity: 0.80,
                                lineHeight: 1,
                            }}>
                                {activeItem.label}
                            </span>
                        </div>
                    </button>

                    {/* Right: name + avatar */}
                    <button
                        onClick={() => handleNavigate("profile")}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            background: "none", border: "none", cursor: "pointer",
                            padding: 0, outline: "none",
                        }}
                        aria-label="My profile"
                    >
                        <span style={{
                            fontFamily: SANS, fontWeight: 500, fontSize: "12px",
                            color: "rgba(233,227,222,0.65)", letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: window.innerWidth < 768 ? "none" : "block",
                        }}>
                            {profile?.fullName?.split(" ")[0] ?? "Profile"}
                        </span>
                        <NavAvatar name={profile?.fullName ?? ""} url={profile?.profilePictureUrl} />
                    </button>
                </nav>
            </header>

            {/* ── Backdrop ────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-40"
                style={{
                    background: "rgba(58,55,55,0.45)",
                    backdropFilter: "blur(3px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.20s ease",
                }}
                aria-hidden="true"
            />

            {/* ── Dropdown panel ──────────────────────────────────────────── */}
            <div
                ref={dropdownRef}
                className="fixed left-0 z-50"
                style={{
                    top: "72px",
                    opacity: open ? 1 : 0,
                    transform: open ? "scale(1) translateY(0)" : "scale(0.96) translateY(-8px)",
                    transition: "opacity 0.18s ease, transform 0.18s ease",
                    pointerEvents: open ? "auto" : "none",
                    transformOrigin: "top left",
                }}
            >
                <div
                    style={{
                        margin: "10px 12px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        width: "clamp(260px, 88vw, 292px)",
                        background: C.beigeLight,
                        boxShadow: `0 6px 0 ${C.dark}, 0 12px 40px rgba(58,55,55,0.22), 0 4px 12px rgba(58,55,55,0.12)`,
                        border: `1px solid rgba(165,147,123,0.22)`,
                        display: "flex", flexDirection: "column",
                    }}
                >
                    {/* Top accent strip */}
                    <div style={{
                        height: "3px", width: "100%", flexShrink: 0,
                        background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})`,
                    }} />

                    {/* Nav items */}
                    <div style={{ padding: "8px 0", overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}>
                        {NAV_GROUPS.map((group, gi) => (
                            <div key={group.label}>
                                {/* Group label row */}
                                <div style={{
                                    padding: gi === 0 ? "10px 16px 4px" : "12px 16px 4px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                }}>
                                    {gi > 0 && <div style={{ flex: 1, height: "1px", background: `rgba(165,147,123,0.25)` }} />}
                                    <span style={{
                                        fontFamily: SANS, fontWeight: 700,
                                        fontSize: "8px", letterSpacing: "0.22em",
                                        textTransform: "uppercase", color: C.tan,
                                        flexShrink: 0,
                                    }}>
                                        {group.label}
                                    </span>
                                    {gi > 0 && <div style={{ flex: 1, height: "1px", background: `rgba(165,147,123,0.25)` }} />}
                                </div>

                                {/* Items */}
                                {group.items.map((item) => {
                                    const isActive = active === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNavigate(item.key)}
                                            style={{
                                                width: "100%", display: "flex", alignItems: "center",
                                                gap: "12px", padding: "8px 12px",
                                                background: isActive ? `rgba(165,147,123,0.14)` : "transparent",
                                                border: "none", cursor: "pointer", position: "relative",
                                                transition: "background 0.15s ease", outline: "none",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.background = "rgba(165,147,123,0.08)";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            {/* Active bar */}
                                            <div style={{
                                                position: "absolute", left: 0,
                                                top: "50%", transform: "translateY(-50%)",
                                                width: "3px",
                                                height: isActive ? "56%" : "0%",
                                                borderRadius: "0 3px 3px 0",
                                                background: `linear-gradient(to bottom, ${C.grayWarm}, ${C.tan})`,
                                                transition: "height 0.15s ease",
                                            }} />

                                            {/* Icon box */}
                                            <div style={{
                                                width: "34px", height: "34px", borderRadius: "12px",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, transition: "all 0.15s ease",
                                                background: isActive
                                                    ? `linear-gradient(135deg, ${C.grayWarm} 0%, #575353 100%)`
                                                    : `rgba(165,147,123,0.14)`,
                                                color: isActive ? C.beigeLight : C.grayWarm,
                                                boxShadow: isActive
                                                    ? `0 3px 0 ${C.dark}, 0 4px 10px rgba(102,97,97,0.22)`
                                                    : "none",
                                            }}>
                                                {item.icon}
                                            </div>

                                            {/* Text */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0, flex: 1 }}>
                                                <span style={{
                                                    fontFamily: SANS,
                                                    fontSize: "13px",
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? C.grayWarm : "#4a4646",
                                                    letterSpacing: "-0.01em",
                                                    lineHeight: 1.3,
                                                }}>
                                                    {item.label}
                                                </span>
                                                <span style={{
                                                    fontFamily: SANS, fontSize: "10px",
                                                    color: C.tan, letterSpacing: "0.01em",
                                                    lineHeight: 1.3,
                                                }}>
                                                    {item.sub}
                                                </span>
                                            </div>

                                            {/* Active check */}
                                            {isActive && (
                                                <div style={{ flexShrink: 0, marginLeft: "4px" }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.tan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    <div style={{
                        flexShrink: 0, padding: "10px 16px",
                        borderTop: `1px solid rgba(165,147,123,0.22)`,
                        background: `rgba(165,147,123,0.08)`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        {/* Dots + brand */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "5px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.grayWarm, opacity: 0.30 }} />
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.tan,     opacity: 0.35 }} />
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.lavender,opacity: 0.50 }} />
                            </div>
                            <span style={{
                                fontFamily: SERIF, fontSize: "11px", color: C.tan, letterSpacing: "0.04em",
                            }}>
                                Travel Buddy
                            </span>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                                color: C.grayWarm, letterSpacing: "0.10em", textTransform: "uppercase",
                                background: "none", border: "none", cursor: "pointer",
                                padding: "6px 10px", borderRadius: "8px",
                                transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(186,26,26,0.08)";
                                e.currentTarget.style.color = "#ba1a1a";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "none";
                                e.currentTarget.style.color = C.grayWarm;
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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