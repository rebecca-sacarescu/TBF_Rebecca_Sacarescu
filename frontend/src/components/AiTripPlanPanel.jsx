/**
 * AiTripPlanPanel.jsx
 *
 * AI Trip Planner panel for Trip Room.
 * Any ACTIVE member can generate or regenerate the plan.
 * Plan is saved per trip in DB — all members see the same plan.
 * Receives WebSocket notifications when another member regenerates.
 *
 * Props:
 *   tripId            {number}   — required
 *   destinationCity   {string}
 *   destinationCountry{string}
 *   externalPlan      {object|null} — plan pushed via WebSocket from another member
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { generateTripPlan, getTripPlan } from "../services/tripAiPlanApi";

// ─── Design tokens — matches Travel Buddy palette exactly ─────────────────────
const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    lavenderBg: "rgba(175,154,201,0.15)",
    lavenderBorder: "rgba(175,154,201,0.32)",
    white:      "#ffffff",
    error:      "#ba1a1a",
    errorBg:    "rgba(186,26,26,0.08)",
    success:    "#2e7d5a",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

const MAX_PROMPT = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return ""; }
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 22, color = C.grayWarm, accent = C.lavender }) {
    return (
        <>
            <div style={{
                width:  `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor:   color,
                borderRightColor: accent,
                animation: "aip-spin 0.9s linear infinite",
                flexShrink: 0,
            }} />
            <style>{`@keyframes aip-spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function Divider({ label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: C.tanBorder }} />
            {label && (
                <span style={{
                    fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    color: C.tan,
                }}>
                    {label}
                </span>
            )}
            <div style={{ flex: 1, height: "1px", background: C.tanBorder }} />
        </div>
    );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity, index }) {
    const [expanded, setExpanded] = useState(false);
    const hasTip = activity.tip && activity.tip.trim().length > 0;
    const hasCost = activity.estimatedCost && activity.estimatedCost.trim().length > 0;

    return (
        <div
            onClick={() => setExpanded((v) => !v)}
            style={{
                padding: "14px 16px",
                borderRadius: "12px",
                background: C.beigeMid,
                border: `1px solid ${C.tanBorder}`,
                cursor: "pointer",
                transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                userSelect: "none",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(175,154,201,0.40)";
                e.currentTarget.style.boxShadow   = "0 2px 8px rgba(175,154,201,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.tanBorder;
                e.currentTarget.style.boxShadow   = "none";
            }}
        >
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
                    {/* Time badge */}
                    <div style={{
                        padding: "3px 10px",
                        borderRadius: "6px",
                        background: C.lavenderBg,
                        border: `1px solid ${C.lavenderBorder}`,
                        fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                        textTransform: "uppercase", letterSpacing: "0.12em",
                        color: "#3a2d4a",
                        flexShrink: 0,
                        marginTop: "1px",
                    }}>
                        {activity.time || "Anytime"}
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <p style={{
                            fontFamily: SANS, fontWeight: 700, fontSize: "14px",
                            color: C.dark, margin: "0 0 2px",
                            lineHeight: 1.3,
                        }}>
                            {activity.name}
                        </p>
                        {hasCost && (
                            <span style={{
                                fontFamily: SANS, fontWeight: 600, fontSize: "11px",
                                color: C.tan,
                            }}>
                                {activity.estimatedCost}
                            </span>
                        )}
                    </div>
                </div>

                {/* Chevron */}
                <svg
                    xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke={C.tan}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                        flexShrink: 0, marginTop: "3px",
                        transition: "transform 0.22s ease",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${C.tanBorder}`,
                    display: "flex", flexDirection: "column", gap: "8px",
                    animation: "aip-fadein 0.18s ease",
                }}>
                    <style>{`@keyframes aip-fadein { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                    {activity.description && (
                        <p style={{
                            fontFamily: SANS, fontSize: "13px", lineHeight: 1.65,
                            color: C.grayWarm, margin: 0,
                        }}>
                            {activity.description}
                        </p>
                    )}

                    {hasTip && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: "8px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            background: "rgba(227,196,155,0.18)",
                            border: `1px solid rgba(227,196,155,0.40)`,
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={C.sand} style={{ flexShrink: 0, marginTop: "1px" }}>
                                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                            </svg>
                            <p style={{
                                fontFamily: SANS, fontSize: "12px", lineHeight: 1.6,
                                color: "#5a3d00", margin: 0, fontStyle: "italic",
                            }}>
                                {activity.tip}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({ day, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: isSelected ? "none" : `1.5px solid ${C.tanBorder}`,
                background: isSelected
                    ? `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`
                    : C.beigeMid,
                color: isSelected ? C.beigeLight : C.grayWarm,
                boxShadow: isSelected
                    ? `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.18)`
                    : `0 2px 0 #d4cec9`,
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: SANS,
                flexShrink: 0,
                minWidth: "80px",
                textAlign: "left",
            }}
            onMouseDown={(e) => {
                if (isSelected) {
                    e.currentTarget.style.transform  = "translateY(3px)";
                    e.currentTarget.style.boxShadow  = `0 1px 0 ${C.dark}`;
                }
            }}
            onMouseUp={(e) => {
                if (isSelected) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.18)`;
                }
            }}
        >
            <span style={{
                fontWeight: 700, fontSize: "10px",
                textTransform: "uppercase", letterSpacing: "0.14em",
                opacity: isSelected ? 0.65 : 0.55,
            }}>
                Day
            </span>
            <span style={{
                fontFamily: SERIF, fontSize: "1.5rem",
                lineHeight: 1, letterSpacing: "-0.01em",
            }}>
                {day.dayNumber}
            </span>
            {day.theme && (
                <span style={{
                    fontSize: "9px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.10em",
                    opacity: isSelected ? 0.55 : 0.45,
                    maxWidth: "80px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {day.theme}
                </span>
            )}
        </button>
    );
}

// ─── Plan view ────────────────────────────────────────────────────────────────

function PlanView({ plan }) {
    const [selectedDay, setSelectedDay] = useState(0);
    const days = plan.days || [];
    const currentDay = days[selectedDay];
    const generalTips   = plan.generalTips   || [];
    const neighborhoods = plan.neighborhoods || [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Summary row */}
            <div style={{
                padding: "16px 20px",
                borderRadius: "14px",
                background: C.beigeMid,
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 2px 0 #d4cec9`,
            }}>
                <p style={{
                    fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    color: C.tan, margin: "0 0 6px",
                }}>
                    Overview
                </p>
                <p style={{
                    fontFamily: SANS, fontSize: "14px", lineHeight: 1.65,
                    color: C.grayWarm, margin: "0 0 12px",
                }}>
                    {plan.summary}
                </p>

                {plan.estimatedBudgetPerPerson && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                            padding: "4px 12px",
                            borderRadius: "999px",
                            background: "rgba(227,196,155,0.22)",
                            border: `1px solid rgba(227,196,155,0.45)`,
                            fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                            color: "#3d2800",
                        }}>
                            {plan.estimatedBudgetPerPerson} / person
                        </div>
                    </div>
                )}
            </div>

            {/* Neighborhoods */}
            {neighborhoods.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {neighborhoods.map((n, i) => (
                        <div key={i} style={{
                            padding: "5px 14px",
                            borderRadius: "999px",
                            background: C.lavenderBg,
                            border: `1px solid ${C.lavenderBorder}`,
                            fontFamily: SANS, fontWeight: 600, fontSize: "11px",
                            color: "#3a2d4a",
                            letterSpacing: "0.04em",
                        }}>
                            {n}
                        </div>
                    ))}
                </div>
            )}

            {/* Day selector */}
            {days.length > 0 && (
                <>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                        {days.map((day, i) => (
                            <DayCard
                                key={i}
                                day={day}
                                isSelected={selectedDay === i}
                                onClick={() => setSelectedDay(i)}
                            />
                        ))}
                    </div>

                    {/* Day theme */}
                    {currentDay && (
                        <div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px" }}>
                                <h3 style={{
                                    fontFamily: SERIF,
                                    fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                                    color: C.grayWarm,
                                    margin: 0,
                                    letterSpacing: "-0.01em",
                                }}>
                                    Day {currentDay.dayNumber}
                                </h3>
                                {currentDay.theme && (
                                    <span style={{
                                        fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                                        color: C.tan, letterSpacing: "0.04em",
                                    }}>
                                        {currentDay.theme}
                                    </span>
                                )}
                            </div>

                            {/* Activities */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(currentDay.activities || []).map((act, i) => (
                                    <ActivityRow key={i} activity={act} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* General tips */}
            {generalTips.length > 0 && (
                <>
                    <Divider label="Travel Tips" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {generalTips.map((tip, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: "10px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background: C.beigeMid,
                                border: `1px solid ${C.tanBorder}`,
                            }}>
                                <div style={{
                                    width: "20px", height: "20px",
                                    borderRadius: "50%",
                                    background: C.lavenderBg,
                                    border: `1px solid ${C.lavenderBorder}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, marginTop: "1px",
                                }}>
                                    <span style={{
                                        fontFamily: SERIF, fontSize: "10px",
                                        color: C.lavender, lineHeight: 1,
                                    }}>
                                        {i + 1}
                                    </span>
                                </div>
                                <p style={{
                                    fontFamily: SANS, fontSize: "13px",
                                    lineHeight: 1.65, color: C.grayWarm,
                                    margin: 0,
                                }}>
                                    {tip}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Generated by */}
            {plan.generatedByName && (
                <p style={{
                    fontFamily: SANS, fontSize: "11px",
                    color: C.tan, margin: 0,
                    letterSpacing: "0.04em", textAlign: "right",
                }}>
                    Generated by {plan.generatedByName}
                    {plan.generatedAt ? ` · ${formatDate(plan.generatedAt)}` : ""}
                </p>
            )}
        </div>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <>
            <style>{`
                @keyframes aip-shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                }
                .aip-bone {
                    background: linear-gradient(
                        90deg,
                        rgba(165,147,123,0.10) 25%,
                        rgba(165,147,123,0.22) 37%,
                        rgba(165,147,123,0.10) 63%
                    );
                    background-size: 400px 100%;
                    animation: aip-shimmer 1.4s ease infinite;
                    border-radius: 8px;
                }
            `}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="aip-bone" style={{ height: "80px", borderRadius: "14px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="aip-bone" style={{ width: "80px", height: "76px", borderRadius: "12px" }} />
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="aip-bone" style={{ height: "58px", borderRadius: "12px" }} />
                    ))}
                </div>
            </div>
        </>
    );
}

// ─── Generating animation ─────────────────────────────────────────────────────

function GeneratingState({ destination }) {
    const steps = [
        "Analysing crew profile...",
        "Mapping destination highlights...",
        "Crafting daily itinerary...",
        "Estimating costs...",
        "Finalising travel tips...",
    ];
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((v) => (v + 1) % steps.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "20px", padding: "48px 24px",
            textAlign: "center",
        }}>
            {/* Animated ring */}
            <div style={{ position: "relative", width: "56px", height: "56px" }}>
                <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: C.grayWarm,
                    borderRightColor: C.lavender,
                    animation: "aip-spin 1.1s linear infinite",
                }} />
                <div style={{
                    position: "absolute", inset: "8px",
                    borderRadius: "50%",
                    border: "1.5px solid transparent",
                    borderTopColor: C.tan,
                    borderLeftColor: C.sand,
                    animation: "aip-spin 1.8s linear infinite reverse",
                }} />
                <div style={{
                    position: "absolute", inset: "18px",
                    borderRadius: "50%",
                    background: C.lavenderBg,
                    border: `1px solid ${C.lavenderBorder}`,
                }} />
            </div>

            <div>
                <p style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    color: C.grayWarm, margin: "0 0 8px",
                    letterSpacing: "-0.01em",
                }}>
                    Planning your trip{destination ? ` to ${destination}` : ""}
                </p>
                <p
                    key={stepIndex}
                    style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                        textTransform: "uppercase", letterSpacing: "0.14em",
                        color: C.tan, margin: 0,
                        animation: "aip-fadein 0.4s ease",
                    }}
                >
                    {steps[stepIndex]}
                </p>
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ destination, onStartGenerate }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "20px", padding: "48px 24px",
            textAlign: "center",
        }}>
            {/* Icon */}
            <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: C.lavenderBg,
                border: `1px solid ${C.lavenderBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.lavender} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
            </div>

            <div>
                <p style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                    color: C.grayWarm, margin: "0 0 8px",
                    letterSpacing: "-0.01em",
                }}>
                    No itinerary yet{destination ? ` for ${destination}` : ""}
                </p>
                <p style={{
                    fontFamily: SANS, fontSize: "13px",
                    color: C.tan, margin: 0, lineHeight: 1.65,
                    maxWidth: "300px",
                }}>
                    Generate a personalised day-by-day itinerary based on your crew profile and trip details.
                </p>
            </div>

            <button
                onClick={onStartGenerate}
                style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "11px 24px", borderRadius: "999px", border: "none",
                    fontFamily: SANS, fontWeight: 700, fontSize: "12px",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`,
                    color: C.beigeLight,
                    boxShadow: `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform  = "translateY(3px)";
                    e.currentTarget.style.boxShadow  = `0 1px 0 ${C.dark}`;
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform  = "translateY(0)";
                    e.currentTarget.style.boxShadow  = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`;
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Generate Itinerary
            </button>
        </div>
    );
}

// ─── Generate form ────────────────────────────────────────────────────────────

function GenerateForm({ onGenerate, onCancel, isRegenerate, loading }) {
    const [prompt, setPrompt] = useState("");
    const charCount = prompt.length;
    const charOver  = charCount > MAX_PROMPT;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
                <label style={{
                    display: "block",
                    fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                    textTransform: "uppercase", letterSpacing: "0.14em",
                    color: C.tan, marginBottom: "8px",
                }}>
                    Additional hints (optional)
                </label>
                <div style={{ position: "relative" }}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={loading}
                        placeholder="e.g. focus on street food, avoid touristy areas, include one outdoor day..."
                        rows={3}
                        maxLength={MAX_PROMPT + 20}
                        style={{
                            width: "100%", boxSizing: "border-box", resize: "none",
                            padding: "12px 14px",
                            fontFamily: SANS, fontSize: "14px", lineHeight: 1.55,
                            color: C.dark,
                            background: loading ? "rgba(165,147,123,0.07)" : C.white,
                            border: `1.5px solid ${charOver ? C.error : C.tanBorder}`,
                            borderRadius: "12px",
                            outline: "none",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                            cursor: loading ? "not-allowed" : "text",
                        }}
                        onFocus={(e) => {
                            if (!loading) {
                                e.currentTarget.style.borderColor = C.lavender;
                                e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(175,154,201,0.18)";
                            }
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = charOver ? C.error : C.tanBorder;
                            e.currentTarget.style.boxShadow  = "none";
                        }}
                    />
                    {charCount > MAX_PROMPT * 0.75 && (
                        <span style={{
                            position: "absolute", bottom: "10px", right: "12px",
                            fontFamily: SANS, fontWeight: 600, fontSize: "9px",
                            color: charOver ? C.error : C.tan,
                            letterSpacing: "0.06em", pointerEvents: "none",
                        }}>
                            {charCount}/{MAX_PROMPT}
                        </span>
                    )}
                </div>
                <p style={{
                    fontFamily: SANS, fontSize: "11px", color: C.tan,
                    margin: "6px 0 0 2px", lineHeight: 1.5,
                }}>
                    The plan will be personalised based on your crew profile, budget and trip type. This field lets you add specific preferences.
                </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: "9px 18px", borderRadius: "999px",
                            border: `1.5px solid ${C.tanBorder}`,
                            background: "transparent",
                            fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                            textTransform: "uppercase", letterSpacing: "0.10em",
                            color: C.grayWarm,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.5 : 1,
                            transition: "all 0.15s ease",
                        }}
                    >
                        Cancel
                    </button>
                )}

                <button
                    onClick={() => onGenerate(prompt.trim() || null)}
                    disabled={loading || charOver}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "9px 22px", borderRadius: "999px", border: "none",
                        fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                        textTransform: "uppercase", letterSpacing: "0.12em",
                        background: loading || charOver
                            ? "rgba(165,147,123,0.25)"
                            : `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`,
                        color: loading || charOver ? C.tan : C.beigeLight,
                        boxShadow: loading || charOver ? "none" : `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`,
                        cursor: loading || charOver ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                    }}
                    onMouseDown={(e) => {
                        if (!loading && !charOver) {
                            e.currentTarget.style.transform = "translateY(3px)";
                            e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`;
                        }
                    }}
                    onMouseUp={(e) => {
                        if (!loading && !charOver) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`;
                        }
                    }}
                >
                    {loading ? (
                        <Spinner size={14} color={C.tan} accent={C.grayWarm} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                    )}
                    {loading ? "Generating..." : isRegenerate ? "Regenerate" : "Generate"}
                </button>
            </div>
        </div>
    );
}

// ─── AiTripPlanPanel ──────────────────────────────────────────────────────────

/**
 * @param {{
 *   tripId: number,
 *   destinationCity?: string,
 *   destinationCountry?: string,
 *   externalPlan?: object|null
 * }} props
 */
export default function AiTripPlanPanel({
                                            tripId,
                                            destinationCity,
                                            destinationCountry,
                                            externalPlan = null,
                                        }) {
    const destination = [destinationCity, destinationCountry].filter(Boolean).join(", ");

    // "idle" | "loading-existing" | "generating" | "show-form" | "show-plan" | "error"
    const [uiState, setUiState]     = useState("loading-existing");
    const [plan,    setPlan]        = useState(null);
    const [error,   setError]       = useState(null);
    const [newPlanBanner, setNewPlanBanner] = useState(null); // name of member who regenerated

    const isMounted = useRef(true);

    // ── Load existing plan on mount ──────────────────────────────────────────
    useEffect(() => {
        isMounted.current = true;
        let cancelled = false;

        setUiState("loading-existing");
        setError(null);

        getTripPlan(tripId)
            .then((data) => {
                if (cancelled) return;
                setPlan(data);
                setUiState("show-plan");
            })
            .catch(() => {
                if (cancelled) return;
                // No plan yet — show empty state
                setUiState("idle");
            });

        return () => {
            cancelled = true;
            isMounted.current = false;
        };
    }, [tripId]);

    // ── React to WebSocket plan broadcast ───────────────────────────────────
    useEffect(() => {
        if (!externalPlan) return;
        setPlan(externalPlan.plan || externalPlan);
        setUiState("show-plan");
        setNewPlanBanner(externalPlan.generatedByName || "A crew member");

        const timer = setTimeout(() => {
            if (isMounted.current) setNewPlanBanner(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [externalPlan]);

    // ── Generate / regenerate ────────────────────────────────────────────────
    const handleGenerate = useCallback(async (prompt) => {
        if (!isMounted.current) return;
        setUiState("generating");
        setError(null);

        try {
            const data = await generateTripPlan(tripId, prompt);
            if (!isMounted.current) return;
            setPlan(data);
            setUiState("show-plan");
        } catch (err) {
            if (!isMounted.current) return;
            setError(err.message ?? "Failed to generate plan. Please try again.");
            setUiState("error");
        }
    }, [tripId]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <section style={{
            background: C.white,
            borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            overflow: "hidden",
            fontFamily: SANS,
        }}>
            {/* Accent strip */}
            <div style={{
                height: "2px",
                background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})`,
            }} />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{
                padding: "16px 20px 14px",
                borderBottom: `1px solid ${C.tanBorder}`,
                background: C.beigeMid,
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", gap: "12px",
            }}>
                <div style={{ minWidth: 0 }}>
                    <p style={{
                        fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                        textTransform: "uppercase", letterSpacing: "0.18em",
                        color: C.tan, margin: "0 0 3px",
                    }}>
                        AI Trip Planner
                    </p>
                    <h3 style={{
                        fontFamily: SERIF,
                        fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                        color: C.grayWarm, margin: "0 0 2px",
                        letterSpacing: "-0.01em", lineHeight: 1.15,
                    }}>
                        {destination ? `Itinerary — ${destination}` : "Trip Itinerary"}
                    </h3>
                    <p style={{
                        fontFamily: SANS, fontWeight: 500, fontSize: "11px",
                        color: C.tan, margin: 0, letterSpacing: "0.04em",
                    }}>
                        Personalised for your crew
                    </p>
                </div>

                {/* Regenerate button — shown when plan exists and not already in form/generating */}
                {(uiState === "show-plan") && (
                    <button
                        onClick={() => setUiState("show-form")}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "7px 14px", borderRadius: "999px",
                            background: C.lavenderBg,
                            border: `1px solid ${C.lavenderBorder}`,
                            boxShadow: "0 2px 0 rgba(125,106,158,0.25)",
                            fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                            textTransform: "uppercase", letterSpacing: "0.10em",
                            color: "#3a2d4a",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.18s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background  = "rgba(175,154,201,0.26)";
                            e.currentTarget.style.boxShadow   = "0 3px 0 rgba(125,106,158,0.35)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background  = C.lavenderBg;
                            e.currentTarget.style.boxShadow   = "0 2px 0 rgba(125,106,158,0.25)";
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M8 16H3v5"/>
                        </svg>
                        Regenerate
                    </button>
                )}
            </div>

            {/* ── New plan notification banner ─────────────────────────────── */}
            {newPlanBanner && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 20px",
                    background: "rgba(175,154,201,0.12)",
                    borderBottom: `1px solid ${C.lavenderBorder}`,
                    animation: "aip-fadein 0.3s ease",
                }}>
                    <div style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: C.lavender,
                        flexShrink: 0,
                    }} />
                    <p style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                        color: "#3a2d4a", margin: 0, letterSpacing: "0.04em",
                    }}>
                        {newPlanBanner} generated a new itinerary for the crew.
                    </p>
                    <button
                        onClick={() => setNewPlanBanner(null)}
                        style={{
                            marginLeft: "auto", background: "none", border: "none",
                            cursor: "pointer", padding: "2px",
                            color: C.tan, flexShrink: 0,
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div style={{ padding: "20px 20px 24px" }}>

                {/* Loading existing */}
                {uiState === "loading-existing" && (
                    <LoadingSkeleton />
                )}

                {/* Empty — no plan yet */}
                {uiState === "idle" && (
                    <EmptyState
                        destination={destination}
                        onStartGenerate={() => setUiState("show-form")}
                    />
                )}

                {/* Generate form — first time */}
                {uiState === "show-form" && !plan && (
                    <GenerateForm
                        onGenerate={handleGenerate}
                        onCancel={() => setUiState("idle")}
                        isRegenerate={false}
                        loading={false}
                    />
                )}

                {/* Regenerate form — plan exists, user clicked regenerate */}
                {uiState === "show-form" && plan && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <GenerateForm
                            onGenerate={handleGenerate}
                            onCancel={() => setUiState("show-plan")}
                            isRegenerate={true}
                            loading={false}
                        />
                        <Divider label="Current plan" />
                        <PlanView plan={plan} />
                    </div>
                )}

                {/* Generating animation */}
                {uiState === "generating" && (
                    <GeneratingState destination={destination} />
                )}

                {/* Plan view */}
                {uiState === "show-plan" && plan && (
                    <PlanView plan={plan} />
                )}

                {/* Error */}
                {uiState === "error" && (
                    <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "16px",
                        padding: "40px 24px", textAlign: "center",
                    }}>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "50%",
                            background: C.errorBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={C.error} style={{ opacity: 0.8 }}>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                        <p style={{
                            fontFamily: SANS, fontSize: "13px",
                            color: C.tan, lineHeight: 1.65, margin: 0,
                            maxWidth: "280px",
                        }}>
                            {error}
                        </p>
                        <button
                            onClick={() => setUiState(plan ? "show-form" : "idle")}
                            style={{
                                padding: "9px 22px", borderRadius: "999px", border: "none",
                                fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                                textTransform: "uppercase", letterSpacing: "0.12em",
                                background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`,
                                color: C.beigeLight,
                                boxShadow: `0 4px 0 ${C.dark}`,
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}