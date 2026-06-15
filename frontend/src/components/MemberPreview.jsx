
const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
};
const SANS  = "'DM Sans', sans-serif";
const SERIF = "'DM Serif Display', serif";

function getInitials(name = "") {
    return name.trim().split(/\s+/).filter(Boolean)
        .slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Avatar({ member, size, isOwner, zIndex }) {
    const { fullName = "", profilePictureUrl } = member;
    const inits  = getInitials(fullName);
    const hasImg = !!profilePictureUrl;

    return (
        <div
            title={`${fullName}${isOwner ? " (Owner)" : ""}`}
            style={{
                width: `${size}px`, height: `${size}px`, borderRadius: "50%",
                flexShrink: 0,
                border: isOwner ? `2px solid ${C.lavender}` : `2px solid ${C.beigeLight}`,
                boxShadow: isOwner
                    ? `0 0 0 1px rgba(175,154,201,0.45), 0 2px 6px rgba(58,55,55,0.18)`
                    : `0 2px 6px rgba(58,55,55,0.14)`,
                background: `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                overflow: "hidden",
                position: "relative",
                zIndex,
                transition: "transform 0.18s ease",
                cursor: "default",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12) translateY(-2px)"; e.currentTarget.style.zIndex = "20"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = String(zIndex); }}
        >
            {hasImg ? (
                <img src={profilePictureUrl} alt={fullName} draggable={false}
                     style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                     onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: `${size * 0.34}px`, color: C.beigeLight, opacity: 0.80 }}>
                        {inits}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function MemberPreview({ members = [], maxVisible = 3, size = 28 }) {
    if (members.length === 0) return null;

    const visible  = members.slice(0, maxVisible);
    const overflow = members.length - maxVisible;

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {visible.map((m, i) => (
                <div key={m.userId ?? i} style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: maxVisible - i, position: "relative" }}>
                    <Avatar member={m} size={size} isOwner={m.role === "OWNER"} zIndex={maxVisible - i} />
                </div>
            ))}
            {overflow > 0 && (
                <div style={{
                    marginLeft: "-8px",
                    width: `${size}px`, height: `${size}px`, borderRadius: "50%",
                    border: `2px solid ${C.beigeLight}`,
                    background: `linear-gradient(135deg, #b8ac9e 0%, ${C.tan} 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 6px rgba(58,55,55,0.14)`,
                    zIndex: 0, position: "relative",
                }}>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: `${size * 0.30}px`, color: C.beigeLight }}>
                        +{overflow}
                    </span>
                </div>
            )}
        </div>
    );
}