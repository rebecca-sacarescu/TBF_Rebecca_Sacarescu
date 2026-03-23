import { useState } from "react";

/**
 * TagList — renders chips with optional add/remove.
 * @param {Object} props
 * @param {string} props.label - Section header
 * @param {string[]} props.items - Current list
 * @param {boolean} props.editing - Enable add/remove
 * @param {function} props.onChange - Called with updated list
 * @param {"default"|"secondary"|"tertiary"|"primary"} props.variant
 */
export default function TagList({
                                    label,
                                    items = [],
                                    editing = false,
                                    onChange,
                                    variant = "default",
                                }) {
    const [adding, setAdding] = useState(false);
    const [newItem, setNewItem] = useState("");

    const variantClasses = {
        default:
            "bg-surface-container-low text-primary border border-outline-variant/30",
        secondary:
            "bg-secondary-container text-on-secondary-container border border-secondary/20",
        tertiary:
            "bg-tertiary-fixed text-on-tertiary-fixed",
        primary:
            "bg-primary-fixed text-on-primary-fixed",
        neutral:
            "bg-surface-container-high text-primary",
    };

    const chipClass = variantClasses[variant] || variantClasses.default;

    const handleRemove = (idx) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    const handleAdd = () => {
        const val = newItem.trim();
        if (val && !items.includes(val)) {
            onChange([...items, val]);
        }
        setNewItem("");
        setAdding(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
        if (e.key === "Escape") {
            setNewItem("");
            setAdding(false);
        }
    };

    return (
        <div>
            <h4 className="font-label text-[10px] font-extrabold uppercase tracking-widest text-outline mb-3">
                {label}
            </h4>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span
                        key={`${item}-${idx}`}
                        className={`px-3 py-1.5 rounded-full font-body text-sm font-medium flex items-center gap-1.5 ${chipClass} ${
                            editing ? "cursor-pointer hover:opacity-80" : ""
                        }`}
                        onClick={editing ? () => handleRemove(idx) : undefined}
                    >
            {item}
                        {editing && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-50 hover:opacity-100"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        )}
          </span>
                ))}

                {editing && !adding && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="px-3 py-1.5 rounded-full border border-dashed border-outline text-outline font-body text-sm font-medium flex items-center gap-1 hover:border-secondary hover:text-secondary transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add
                    </button>
                )}

                {editing && adding && (
                    <div className="flex items-center gap-1">
                        <input
                            autoFocus
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleAdd}
                            placeholder="Type & Enter"
                            className="px-3 py-1.5 rounded-full border border-secondary bg-transparent text-sm font-body text-primary w-32 outline-none focus:ring-2 focus:ring-secondary/30"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}