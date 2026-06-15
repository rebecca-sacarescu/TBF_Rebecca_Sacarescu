import { useState, useEffect, useRef, useCallback } from "react";
import TokenService from "../services/tokenService";
import profileApi from "../services/profileApi";

const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

function resolveActive(page) {
    if (page === "discover")  return "feed";
    if (page === "trip-room") return "my-trips";
    return page;
}

function NavAvatar({ name = "", url }) {
    const inits = name.trim().split(/\s+/).filter(Boolean)
        .slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "TB";
    return (
        <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            background: "linear-gradient(135deg, #AF9AC9 0%, #A5937B 100%)",
            border: "1.5px solid rgba(255,255,255,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            {url ? (
                <img src={url} alt={name}
                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
                     onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", color: "#E9E3DE", letterSpacing: "0.04em" }}>
                    {inits}
                </span>
            )}
        </div>
    );
}

function Dropdown({ items, onNavigate, active }) {
    return (
        <div style={{
            position: "absolute", top: "calc(100% + 10px)", left: "50%",
            transform: "translateX(-50%)",
            background: "#E9E3DE",
            borderRadius: "14px",
            border: "1px solid rgba(165,147,123,0.28)",
            boxShadow: "0 6px 0 #3a3737, 0 10px 32px rgba(58,55,55,0.22)",
            overflow: "hidden",
            minWidth: "170px",
            zIndex: 100,
        }}>
            {/* accent strip */}
            <div style={{ height: "2px", background: "linear-gradient(to right, #666161, #A5937B, #AF9AC9)" }} />
            <div style={{ padding: "6px" }}>
                {items.map((item) => {
                    const isActive = active === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={(e) => { e.stopPropagation(); onNavigate(item.key); }}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                padding: "8px 10px", borderRadius: "10px",
                                background: isActive ? "rgba(165,147,123,0.18)" : "transparent",
                                border: "none", cursor: "pointer",
                                transition: "background 0.13s ease",
                                textAlign: "left",
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(165,147,123,0.10)"; }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                        >
                            <div style={{
                                width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: isActive
                                    ? "linear-gradient(135deg, #666161 0%, #4d4949 100%)"
                                    : "rgba(165,147,123,0.18)",
                                color: isActive ? "#E9E3DE" : "#666161",
                                boxShadow: isActive ? "0 2px 0 #3a3737" : "none",
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: isActive ? 700 : 500, fontSize: "13px", color: "#3a3737", margin: 0, lineHeight: 1.2 }}>
                                    {item.label}
                                </p>
                                <p style={{ fontFamily: SANS, fontSize: "10px", color: "#A5937B", margin: 0, lineHeight: 1.2 }}>
                                    {item.sub}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function NavItem({ label, items, navKey, active, onNavigate }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const timeoutRef = useRef(null);

    const hasDropdown = items && items.length > 0;
    const isActive = hasDropdown
        ? items.some((i) => i.key === active)
        : active === navKey;

    const openDropdown  = () => { clearTimeout(timeoutRef.current); setOpen(true); };
    const closeDropdown = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120); };

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const handleClick = () => {
        if (!hasDropdown) onNavigate(navKey);
    };

    return (
        <div
            ref={ref}
            style={{ position: "relative" }}
            onMouseEnter={hasDropdown ? openDropdown : undefined}
            onMouseLeave={hasDropdown ? closeDropdown : undefined}
        >
            <button
                onClick={handleClick}
                style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "6px 10px", borderRadius: "8px",
                    fontFamily: SANS, fontWeight: isActive ? 700 : 500,
                    fontSize: "13px", letterSpacing: "0.02em",
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                    transition: "color 0.15s ease, background 0.15s ease",
                    position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.72)"; }}
            >
                {label}
                {isActive && (
                    <span style={{
                        position: "absolute", bottom: "2px", left: "10px", right: "10px",
                        height: "2px", borderRadius: "999px",
                        background: "linear-gradient(to right, #A5937B, #AF9AC9)",
                    }} />
                )}
                {hasDropdown && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: "transform 0.18s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.70 }}
                    >
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                )}
            </button>

            {hasDropdown && open && (
                <Dropdown items={items} onNavigate={(key) => { onNavigate(key); setOpen(false); }} active={active} />
            )}
        </div>
    );
}

export default function TopNav({ activeTab, onNavigate }) {
    const [profile, setProfile] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const active = resolveActive(activeTab);

    useEffect(() => {
        profileApi.getMyProfile().then((data) => setProfile(data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (!profileOpen) return;
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [profileOpen]);

    const handleNavigate = useCallback((key) => {
        setProfileOpen(false);
        onNavigate(key);
    }, [onNavigate]);

    const handleLogout = useCallback(() => {
        setProfileOpen(false);
        TokenService.logout();
        onNavigate("login");
    }, [onNavigate]);

    const NAV_ITEMS = [
        {
            label: "Discovery",
            items: [
                {
                    key: "feed", label: "My Feed", sub: "Discover travelers",
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.27 15.58l-1.54-3.77-3.77-1.54 8.69-3.38-3.38 8.69z"/>
                        </svg>
                    ),
                },
                {
                    key: "saved", label: "Saved", sub: "Bookmarked profiles",
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                        </svg>
                    ),
                },
            ],
        },
        {
            label: "Social",
            navKey: "matches",
            items: null,
        },
        {
            label: "Trips",
            items: [
                {
                    key: "open-trips", label: "Open Trips", sub: "Browse departures",
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                        </svg>
                    ),
                },
                {
                    key: "my-trips", label: "My Trips", sub: "Commanded & enrolled",
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z"/>
                        </svg>
                    ),
                },
            ],
        },
    ];

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <header
                className="fixed top-0 w-full z-50"
                style={{
                    height: "64px",
                    background: "rgba(102,97,97,0.18)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                }}
            >
                <nav style={{
                    display: "flex", alignItems: "center",
                    height: "100%", padding: "0 32px",
                    maxWidth: "1280px", margin: "0 auto",
                    gap: "0",
                }}>

                    <button
                        onClick={() => handleNavigate("feed")}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            padding: 0, marginRight: "36px", flexShrink: 0,
                        }}
                    >
                        <span style={{
                            fontFamily: SERIF, fontSize: "20px",
                            color: "#ffffff",
                            letterSpacing: "0.02em", lineHeight: 1,
                            textShadow: "0 1px 8px rgba(58,55,55,0.35)",
                        }}>
                            Travel Buddy
                        </span>
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                        {NAV_ITEMS.map((item) => (
                            <NavItem
                                key={item.label}
                                label={item.label}
                                items={item.items}
                                navKey={item.navKey}
                                active={active}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>

                    <div ref={profileRef} style={{ position: "relative", flexShrink: 0 }}>
                        <button
                            onClick={() => setProfileOpen((v) => !v)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: profileOpen
                                    ? "rgba(255,255,255,0.14)"
                                    : "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                borderRadius: "999px",
                                padding: "5px 12px 5px 6px",
                                cursor: "pointer", transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                            onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        >
                            <NavAvatar name={profile?.fullName ?? ""} url={profile?.profilePictureUrl} />
                            <span style={{
                                fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                                color: active === "profile" ? "#ffffff" : "rgba(255,255,255,0.80)",
                                letterSpacing: "0.04em",
                            }}>
                                {profile?.fullName?.split(" ")[0] ?? "Profile"}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                 viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.60)"
                                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                 style={{ transition: "transform 0.18s ease", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>

                        {profileOpen && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 10px)", right: 0,
                                background: "#E9E3DE",
                                borderRadius: "14px",
                                border: "1px solid rgba(165,147,123,0.28)",
                                boxShadow: "0 6px 0 #3a3737, 0 10px 32px rgba(58,55,55,0.22)",
                                overflow: "hidden",
                                minWidth: "180px",
                                zIndex: 100,
                            }}>
                                <div style={{ height: "2px", background: "linear-gradient(to right, #666161, #A5937B, #AF9AC9)" }} />
                                <div style={{ padding: "6px" }}>
                                    <button
                                        onClick={() => handleNavigate("profile")}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                            padding: "8px 10px", borderRadius: "10px",
                                            background: active === "profile" ? "rgba(165,147,123,0.18)" : "transparent",
                                            border: "none", cursor: "pointer",
                                            transition: "background 0.13s ease",
                                        }}
                                        onMouseEnter={(e) => { if (active !== "profile") e.currentTarget.style.background = "rgba(165,147,123,0.10)"; }}
                                        onMouseLeave={(e) => { if (active !== "profile") e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <div style={{
                                            width: "28px", height: "28px", borderRadius: "8px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: active === "profile"
                                                ? "linear-gradient(135deg, #666161 0%, #4d4949 100%)"
                                                : "rgba(165,147,123,0.18)",
                                            color: active === "profile" ? "#E9E3DE" : "#666161",
                                            boxShadow: active === "profile" ? "0 2px 0 #3a3737" : "none",
                                            flexShrink: 0,
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: SANS, fontWeight: active === "profile" ? 700 : 500, fontSize: "13px", color: "#3a3737", margin: 0, lineHeight: 1.2 }}>My Profile</p>
                                            <p style={{ fontFamily: SANS, fontSize: "10px", color: "#A5937B", margin: 0, lineHeight: 1.2 }}>Travel DNA & settings</p>
                                        </div>
                                    </button>
                                </div>
                                <div style={{ borderTop: "1px solid rgba(165,147,123,0.22)", padding: "6px" }}>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "8px",
                                            padding: "8px 10px", borderRadius: "10px",
                                            fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                                            color: "#666161", letterSpacing: "0.06em",
                                            background: "transparent", border: "none", cursor: "pointer",
                                            transition: "all 0.13s ease",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(186,26,26,0.08)"; e.currentTarget.style.color = "#ba1a1a"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666161"; }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                            <polyline points="16 17 21 12 16 7"/>
                                            <line x1="21" y1="12" x2="9" y2="12"/>
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
}