import { useState } from "react";

/**
 * ChipSelector — pick from predefined options + add custom ones.
 * @param {Object} props
 * @param {string} props.label - Section header
 * @param {string[]} props.options - Predefined options to show
 * @param {string[]} props.selected - Currently selected values
 * @param {function} props.onChange - Called with updated selected array
 * @param {string} props.icon - Emoji icon for the section header
 * @param {boolean} props.allowCustom - Allow adding custom values (default true)
 */
export default function ChipSelector({
                                         label,
                                         options = [],
                                         selected = [],
                                         onChange,
                                         icon = "",
                                         allowCustom = true,
                                     }) {
    const [adding, setAdding] = useState(false);
    const [customValue, setCustomValue] = useState("");

    const toggle = (value) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const handleAddCustom = () => {
        const val = customValue.trim();
        if (val && !selected.includes(val)) {
            onChange([...selected, val]);
        }
        setCustomValue("");
        setAdding(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddCustom();
        }
        if (e.key === "Escape") {
            setCustomValue("");
            setAdding(false);
        }
    };

    // Merge predefined + any custom selections not in options
    const allOptions = [...new Set([...options, ...selected])];

    return (
        <div>
            <h3 className="font-headline text-sm font-bold text-primary mb-3 flex items-center gap-2">
                {icon && <span className="text-base">{icon}</span>}
                {label}
            </h3>
            <div className="flex flex-wrap gap-2">
                {allOptions.map((opt) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                flex items-center gap-1.5
                ${
                                isSelected
                                    ? "bg-primary text-on-primary shadow-sm"
                                    : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40 hover:border-secondary hover:text-secondary"
                            }
              `}
                        >
                            {opt}
                            {isSelected && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            )}
                            {!isSelected && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                        </button>
                    );
                })}

                {/* Add custom */}
                {allowCustom && !adding && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="px-4 py-2 rounded-full border border-dashed border-outline text-outline text-sm font-medium flex items-center gap-1 hover:border-secondary hover:text-secondary transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Custom
                    </button>
                )}

                {allowCustom && adding && (
                    <input
                        autoFocus
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleAddCustom}
                        placeholder="Type & Enter"
                        className="px-4 py-2 rounded-full border border-secondary bg-transparent text-sm font-body text-primary w-36 outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                )}
            </div>
        </div>
    );
}