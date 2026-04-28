/**
 * TripChatPanel.jsx
 *
 * Real-time group chat panel for a Trip Room.
 * Loads history via REST, then upgrades to live WebSocket (STOMP/SockJS).
 *
 * Props:
 *   tripId            {number}   — required
 *   tripTitle         {string}   — display name of the trip
 *   destinationCity   {string}
 *   destinationCountry{string}
 *   memberCount       {number}
 *   readonly          {boolean}  — true when trip is CLOSED/CANCELLED/EXPIRED or ended
 *   currentUserId     {number|null} — optional; used to align own messages to the right
 */

import { useState, useEffect, useRef, useCallback } from "react";
import TokenService from "../services/tokenService";
import { getTripChatMessages } from "../services/tripChatApi";
import { connectTripChatSocket } from "../services/tripChatSocket";

// ─── Design tokens (matches Travel Buddy palette) ─────────────────────────────
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
    white:      "#ffffff",
    error:      "#ba1a1a",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function formatTime(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        const now = new Date();
        const sameDay = d.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();

        const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        if (sameDay) return time;
        if (isYesterday) return `Yesterday · ${time}`;
        return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${time}`;
    } catch { return ""; }
}

/** Stable sort: by createdAt ascending, then by id ascending for ties */
function sortMessages(msgs) {
    return [...msgs].sort((a, b) => {
        const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (t !== 0) return t;
        return (a.id ?? 0) - (b.id ?? 0);
    });
}

/** Deduplicate by message id */
function dedupeMessages(msgs) {
    const seen = new Set();
    return msgs.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner({ size = 24, color = C.grayWarm, accent = C.lavender }) {
    return (
        <>
            <div style={{
                width: `${size}px`, height: `${size}px`, borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: color, borderRightColor: accent,
                animation: "tbc-spin 0.9s linear infinite",
                flexShrink: 0,
            }} />
            <style>{`@keyframes tbc-spin{to{transform:rotate(360deg)}}`}</style>
        </>
    );
}

/** Avatar circle with image or initials fallback */
function Avatar({ name, url, size = 34, isOwn = false }) {
    const inits = getInitials(name);
    return (
        <div style={{
            width: `${size}px`, height: `${size}px`, borderRadius: "50%", flexShrink: 0,
            background: isOwn
                ? `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`
                : `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)`,
            border: isOwn ? `2px solid rgba(175,154,201,0.55)` : `2px solid ${C.beigeLight}`,
            overflow: "hidden", position: "relative",
            boxShadow: "0 2px 6px rgba(58,55,55,0.14)",
        }}>
            {url ? (
                <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                     onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: SERIF, fontSize: `${size * 0.33}px`, color: C.beigeLight, opacity: 0.8, lineHeight: 1 }}>
                        {inits}
                    </span>
                </div>
            )}
        </div>
    );
}

/** System message timeline chip */
function SystemChip({ content }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: C.tanBorder }} />
            <span style={{
                fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                letterSpacing: "0.10em", textTransform: "uppercase",
                color: C.tan, background: C.beigeMid,
                padding: "4px 12px", borderRadius: "999px",
                border: `1px solid ${C.tanBorder}`,
            }}>
                {content}
            </span>
            <div style={{ flex: 1, height: "1px", background: C.tanBorder }} />
        </div>
    );
}

/** Single chat message bubble */
function MessageBubble({ msg, isOwn, showAvatar, showName }) {
    const isSystem = msg.messageType === "SYSTEM_MESSAGE";
    if (isSystem) return <SystemChip content={msg.content} />;

    return (
        <div style={{
            display: "flex", flexDirection: isOwn ? "row-reverse" : "row",
            alignItems: "flex-end", gap: "8px",
            marginBottom: "2px",
        }}>
            {/* Avatar — only shown on the first message of a group */}
            <div style={{ width: "34px", flexShrink: 0, alignSelf: "flex-end" }}>
                {showAvatar && (
                    <Avatar
                        name={msg.senderName}
                        url={msg.senderProfilePictureUrl}
                        size={34}
                        isOwn={isOwn}
                    />
                )}
            </div>

            <div style={{
                display: "flex", flexDirection: "column",
                alignItems: isOwn ? "flex-end" : "flex-start",
                maxWidth: "68%",
                gap: "3px",
            }}>
                {showName && !isOwn && (
                    <span style={{
                        fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                        letterSpacing: "0.04em", color: C.tan,
                        paddingLeft: "4px",
                    }}>
                        {msg.senderName}
                    </span>
                )}

                <div style={{
                    padding: "10px 14px",
                    borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isOwn
                        ? `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`
                        : C.white,
                    border: isOwn ? "none" : `1px solid ${C.tanBorder}`,
                    boxShadow: isOwn
                        ? `0 3px 0 #7d6a9e, 0 4px 12px rgba(175,154,201,0.22)`
                        : `0 2px 0 #d4cec9, 0 4px 10px rgba(165,147,123,0.08)`,
                    color: isOwn ? "#ffffff" : C.dark,
                    fontFamily: SANS, fontSize: "14px", lineHeight: "1.55",
                    wordBreak: "break-word", whiteSpace: "pre-wrap",
                }}>
                    {msg.content}
                </div>

                <span style={{
                    fontFamily: SANS, fontWeight: 500, fontSize: "10px",
                    color: C.tan, opacity: 0.75,
                    paddingLeft: isOwn ? 0 : "4px",
                    paddingRight: isOwn ? "4px" : 0,
                }}>
                    {formatTime(msg.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ─── TripChatPanel ────────────────────────────────────────────────────────────

const MAX_CHARS = 1000;

export default function TripChatPanel({
                                          tripId,
                                          tripTitle,
                                          destinationCity,
                                          destinationCountry,
                                          memberCount,
                                          readonly = false,
                                          currentUserId = null,
                                      }) {
    const [messages,      setMessages]      = useState([]);
    const [loadingHist,   setLoadingHist]   = useState(true);
    const [histError,     setHistError]     = useState(null);

    const [socketStatus,  setSocketStatus]  = useState("connecting"); // "connecting"|"connected"|"reconnecting"|"error"

    const [inputText,     setInputText]     = useState("");
    const [sendError,     setSendError]     = useState(null);

    const socketRef    = useRef(null);
    const bottomRef    = useRef(null);
    const inputRef     = useRef(null);
    const isMounted    = useRef(true);

    // ── Scroll to bottom ────────────────────────────────────────────────────
    const scrollToBottom = useCallback((behavior = "smooth") => {
        bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    }, []);

    // ── Append incoming message (dedupe) ────────────────────────────────────
    const handleIncoming = useCallback((msg) => {
        if (!isMounted.current) return;
        setMessages((prev) => {
            const merged = dedupeMessages([...prev, msg]);
            return sortMessages(merged);
        });
    }, []);

    // ── Fetch history on mount ───────────────────────────────────────────────
    useEffect(() => {
        isMounted.current = true;
        let cancelled = false;

        setLoadingHist(true);
        setHistError(null);

        getTripChatMessages(tripId, 0, 30)
            .then((data) => {
                if (cancelled) return;
                setMessages(sortMessages(dedupeMessages(data)));
            })
            .catch((err) => {
                if (cancelled) return;
                setHistError(err.message ?? "Failed to load chat history.");
            })
            .finally(() => {
                if (!cancelled) setLoadingHist(false);
            });

        return () => { cancelled = true; };
    }, [tripId]);

    // ── Scroll to bottom when history loads ─────────────────────────────────
    useEffect(() => {
        if (!loadingHist) scrollToBottom("instant");
    }, [loadingHist, scrollToBottom]);

    // ── Scroll to bottom on new messages ────────────────────────────────────
    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages.length, scrollToBottom]);

    // ── WebSocket connection ─────────────────────────────────────────────────
    useEffect(() => {
        if (readonly) return; // read-only trips don't need a live socket
        isMounted.current = true;
        const token = TokenService.getToken();
        if (!token) return;

        setSocketStatus("connecting");

        const { sendMessage, disconnect } = connectTripChatSocket({
            tripId,
            token,
            onMessage: handleIncoming,
            onConnect: () => {
                if (!isMounted.current) return;
                setSocketStatus("connected");
            },
            onError: () => {
                if (!isMounted.current) return;
                setSocketStatus("reconnecting");
            },
        });

        socketRef.current = { sendMessage, disconnect };

        return () => {
            isMounted.current = false;
            disconnect();
            socketRef.current = null;
        };
    }, [tripId, readonly, handleIncoming]);

    // ── Send handler ─────────────────────────────────────────────────────────
    const canSend = (
        !readonly &&
        socketStatus === "connected" &&
        inputText.trim().length > 0 &&
        inputText.length <= MAX_CHARS
    );

    const handleSend = useCallback(() => {
        if (!canSend) return;
        setSendError(null);
        try {
            socketRef.current?.sendMessage(inputText);
            setInputText("");
            inputRef.current?.focus();
        } catch {
            setSendError("Failed to send. Please try again.");
        }
    }, [canSend, inputText]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Shift+Enter = newline (default textarea behavior)
    }, [handleSend]);

    // ── Status indicator helpers ─────────────────────────────────────────────
    const statusDot = {
        connected:    { color: "#5dba7d", label: "Live" },
        connecting:   { color: C.sand,   label: "Connecting…" },
        reconnecting: { color: C.sand,   label: "Reconnecting…" },
        error:        { color: C.error,  label: "Disconnected" },
    }[socketStatus] ?? { color: C.tan, label: "—" };

    // ── Group messages by sender (show avatar/name only on first of group) ───
    function buildGroups(msgs) {
        return msgs.map((msg, i) => {
            const prev = msgs[i - 1];
            const isOwn    = currentUserId != null && msg.senderUserId === currentUserId;
            const isSystem = msg.messageType === "SYSTEM_MESSAGE";

            // Show avatar + name if:
            // first message OR previous sender differs OR previous was a system msg
            const showAvatar = (
                !isSystem && (
                    !prev ||
                    prev.messageType === "SYSTEM_MESSAGE" ||
                    prev.senderUserId !== msg.senderUserId
                )
            );

            return { msg, isOwn, showAvatar, showName: showAvatar };
        });
    }

    const groups = buildGroups(messages);
    const charCount = inputText.length;
    const charOver  = charCount > MAX_CHARS;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <section style={{
            display: "flex", flexDirection: "column",
            background: C.white,
            borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            overflow: "hidden",
            fontFamily: SANS,
            minHeight: "520px",
            maxHeight: "700px",
        }}>

            {/* ── Panel header ──────────────────────────────────────────────── */}
            <div style={{
                padding: "16px 20px 14px",
                borderBottom: `1px solid ${C.tanBorder}`,
                background: C.beigeMid,
                flexShrink: 0,
            }}>
                {/* Accent strip */}
                <div style={{
                    position: "absolute", left: 0, right: 0,
                    height: "2px",
                    background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})`,
                    marginTop: "-16px",
                    pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ minWidth: 0 }}>
                        {/* Label */}
                        <p style={{
                            fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                            textTransform: "uppercase", letterSpacing: "0.18em",
                            color: C.tan, margin: "0 0 3px",
                        }}>
                            Trip Room Chat
                        </p>
                        {/* Trip title */}
                        <h3 style={{
                            fontFamily: SERIF,
                            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                            color: C.grayWarm, margin: "0 0 2px",
                            letterSpacing: "-0.01em", lineHeight: 1.15,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {tripTitle || [destinationCity, destinationCountry].filter(Boolean).join(", ") || "Trip Chat"}
                        </h3>
                        {/* Destination */}
                        {(destinationCity || destinationCountry) && (
                            <p style={{
                                fontFamily: SANS, fontWeight: 500, fontSize: "11px",
                                color: C.tan, margin: "0",
                                letterSpacing: "0.04em",
                            }}>
                                {[destinationCity, destinationCountry].filter(Boolean).join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Right side: member count + live dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                        {/* Member badge */}
                        {memberCount != null && (
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "4px 10px", borderRadius: "999px",
                                background: C.beigeLight, border: `1px solid ${C.tanBorder}`,
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill={C.tan}>
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                </svg>
                                <span style={{
                                    fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                                    color: C.grayWarm, letterSpacing: "0.06em",
                                }}>
                                    {memberCount}
                                </span>
                            </div>
                        )}

                        {/* Live status */}
                        {!readonly && (
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "3px 9px", borderRadius: "999px",
                                background: C.beigeLight, border: `1px solid ${C.tanBorder}`,
                            }}>
                                <div style={{
                                    width: "6px", height: "6px", borderRadius: "50%",
                                    background: statusDot.color,
                                    boxShadow: socketStatus === "connected"
                                        ? `0 0 0 2px rgba(93,186,125,0.25)`
                                        : "none",
                                    animation: socketStatus === "connecting" || socketStatus === "reconnecting"
                                        ? "tbc-pulse 1.4s ease-in-out infinite"
                                        : "none",
                                }} />
                                <style>{`
                                    @keyframes tbc-pulse {
                                        0%, 100% { opacity: 1; }
                                        50% { opacity: 0.35; }
                                    }
                                `}</style>
                                <span style={{
                                    fontFamily: SANS, fontWeight: 600, fontSize: "9px",
                                    textTransform: "uppercase", letterSpacing: "0.12em",
                                    color: C.tan,
                                }}>
                                    {statusDot.label}
                                </span>
                            </div>
                        )}

                        {readonly && (
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "3px 9px", borderRadius: "999px",
                                background: "rgba(165,147,123,0.12)",
                                border: `1px solid ${C.tanBorder}`,
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill={C.tan}>
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                </svg>
                                <span style={{
                                    fontFamily: SANS, fontWeight: 600, fontSize: "9px",
                                    textTransform: "uppercase", letterSpacing: "0.12em",
                                    color: C.tan,
                                }}>Read-only</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Message body ──────────────────────────────────────────────── */}
            <div style={{
                flex: 1, overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex", flexDirection: "column", gap: "6px",
                background: C.beigeLight,
                scrollBehavior: "smooth",
            }}>

                {/* Loading history */}
                {loadingHist && (
                    <div style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: "12px", padding: "40px 0",
                    }}>
                        <Spinner />
                        <p style={{
                            fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                            textTransform: "uppercase", letterSpacing: "0.18em",
                            color: C.tan, margin: 0,
                        }}>
                            Loading messages…
                        </p>
                    </div>
                )}

                {/* History error */}
                {!loadingHist && histError && (
                    <div style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: "12px", padding: "40px 24px", textAlign: "center",
                    }}>
                        <div style={{
                            width: "44px", height: "44px", borderRadius: "50%",
                            background: "rgba(186,26,26,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={C.error} style={{ opacity: 0.7 }}>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                        <p style={{
                            fontFamily: SANS, fontSize: "13px", color: C.tan,
                            lineHeight: 1.55, margin: 0, maxWidth: "260px",
                        }}>
                            {histError}
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!loadingHist && !histError && messages.length === 0 && (
                    <div style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: "12px", padding: "50px 24px", textAlign: "center",
                    }}>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "50%",
                            background: C.lavenderBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid rgba(175,154,201,0.30)`,
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={C.lavender} style={{ opacity: 0.75 }}>
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{
                                fontFamily: SERIF, fontSize: "17px", color: C.grayWarm,
                                margin: "0 0 5px", letterSpacing: "-0.01em",
                            }}>
                                No messages yet
                            </p>
                            <p style={{
                                fontFamily: SANS, fontSize: "12px", color: C.tan,
                                margin: 0, lineHeight: 1.6, maxWidth: "240px",
                            }}>
                                Start planning the trip together.
                            </p>
                        </div>
                    </div>
                )}

                {/* Message list */}
                {!loadingHist && !histError && groups.map(({ msg, isOwn, showAvatar, showName }, i) => (
                    <MessageBubble
                        key={msg.id ?? `msg-${i}`}
                        msg={msg}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        showName={showName}
                    />
                ))}

                {/* Scroll anchor */}
                <div ref={bottomRef} style={{ height: "1px" }} />
            </div>

            {/* ── Input area ────────────────────────────────────────────────── */}
            <div style={{
                flexShrink: 0,
                borderTop: `1px solid ${C.tanBorder}`,
                background: C.beigeMid,
                padding: "12px 14px 14px",
            }}>

                {/* Reconnecting notice */}
                {!readonly && (socketStatus === "reconnecting" || socketStatus === "connecting") && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        marginBottom: "10px", padding: "7px 12px",
                        borderRadius: "10px",
                        background: "rgba(227,196,155,0.22)",
                        border: `1px solid rgba(227,196,155,0.45)`,
                    }}>
                        <Spinner size={14} color={C.sand} accent={C.tan} />
                        <span style={{
                            fontFamily: SANS, fontWeight: 600, fontSize: "11px",
                            color: C.grayWarm, letterSpacing: "0.06em",
                        }}>
                            {socketStatus === "connecting" ? "Connecting to crew channel…" : "Reconnecting…"}
                        </span>
                    </div>
                )}

                {readonly && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        marginBottom: "10px", padding: "8px 14px",
                        borderRadius: "10px",
                        background: "rgba(165,147,123,0.10)",
                        border: `1px dashed ${C.tanBorder}`,
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={C.tan}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span style={{
                            fontFamily: SANS, fontWeight: 500, fontSize: "12px",
                            color: C.tan, letterSpacing: "0.04em",
                        }}>
                            This trip has ended. Chat is now read-only.
                        </span>
                    </div>
                )}

                {sendError && (
                    <p style={{
                        fontFamily: SANS, fontSize: "11px", color: C.error,
                        margin: "0 0 8px 4px",
                    }}>
                        {sendError}
                    </p>
                )}

                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                    {/* Textarea */}
                    <div style={{ flex: 1, position: "relative" }}>
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                setSendError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={readonly || socketStatus !== "connected"}
                            placeholder={
                                readonly
                                    ? "Chat is read-only"
                                    : socketStatus !== "connected"
                                        ? "Connecting to crew channel…"
                                        : "Message your crew… (Enter to send, Shift+Enter for newline)"
                            }
                            rows={1}
                            maxLength={MAX_CHARS + 20}  // slight buffer; enforced via canSend
                            style={{
                                width: "100%", resize: "none", boxSizing: "border-box",
                                padding: "11px 44px 11px 14px",
                                fontFamily: SANS, fontSize: "14px", lineHeight: "1.5",
                                color: C.dark,
                                background: readonly || socketStatus !== "connected"
                                    ? "rgba(165,147,123,0.07)"
                                    : C.white,
                                border: `1.5px solid ${charOver ? C.error : C.tanBorder}`,
                                borderRadius: "14px",
                                outline: "none",
                                transition: "border-color 0.15s, box-shadow 0.15s",
                                overflowY: "hidden",
                                cursor: readonly || socketStatus !== "connected" ? "not-allowed" : "text",
                            }}
                            onFocus={(e) => {
                                if (!readonly && socketStatus === "connected") {
                                    e.currentTarget.style.borderColor = C.lavender;
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)";
                                }
                                // Auto-grow
                                e.currentTarget.style.height = "auto";
                                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`;
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = charOver ? C.error : C.tanBorder;
                                e.currentTarget.style.boxShadow = "none";
                            }}
                            onInput={(e) => {
                                // Auto-grow textarea
                                e.currentTarget.style.height = "auto";
                                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`;
                            }}
                        />

                        {/* Char counter — shows when approaching limit */}
                        {charCount > MAX_CHARS * 0.75 && (
                            <span style={{
                                position: "absolute", bottom: "10px", right: "10px",
                                fontFamily: SANS, fontWeight: 600, fontSize: "9px",
                                color: charOver ? C.error : C.tan,
                                letterSpacing: "0.06em", pointerEvents: "none",
                                userSelect: "none",
                            }}>
                                {charCount}/{MAX_CHARS}
                            </span>
                        )}
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        title="Send message"
                        style={{
                            flexShrink: 0,
                            width: "42px", height: "42px",
                            borderRadius: "12px",
                            border: "none",
                            cursor: canSend ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: canSend
                                ? `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`
                                : "rgba(165,147,123,0.18)",
                            boxShadow: canSend ? `0 3px 0 #7d6a9e, 0 4px 10px rgba(175,154,201,0.25)` : "none",
                            transition: "all 0.15s ease",
                            opacity: canSend ? 1 : 0.55,
                        }}
                        onMouseEnter={(e) => {
                            if (canSend) {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = `0 5px 0 #7d6a9e, 0 6px 16px rgba(175,154,201,0.30)`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = canSend ? `0 3px 0 #7d6a9e, 0 4px 10px rgba(175,154,201,0.25)` : "none";
                        }}
                        onMouseDown={(e) => {
                            if (canSend) {
                                e.currentTarget.style.transform = "translateY(2px)";
                                e.currentTarget.style.boxShadow = `0 1px 0 #7d6a9e`;
                            }
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = canSend ? `0 3px 0 #7d6a9e, 0 4px 10px rgba(175,154,201,0.25)` : "none";
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canSend ? "#ffffff" : C.tan} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>

                {/* Footer hint */}
                {!readonly && socketStatus === "connected" && charCount === 0 && (
                    <p style={{
                        fontFamily: SANS, fontWeight: 500, fontSize: "10px",
                        color: C.tan, opacity: 0.70, margin: "7px 0 0 4px",
                        letterSpacing: "0.04em",
                    }}>
                        Enter to send · Shift+Enter for new line
                    </p>
                )}
            </div>
        </section>
    );
}