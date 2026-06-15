
export default function DnaSelector({ label, options, selected, editing, onChange }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                    {label}
                </h3>
                {selected && (
                    <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight">
            {editing ? "Current" : "Selected"}: {selected.replace(/_/g, " ")}
          </span>
                )}
            </div>

            {editing ? (
                <div className="grid grid-cols-3 gap-3">
                    {options.map((opt) => {
                        const isActive = selected === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onChange(opt.value)}
                                className={`py-4 px-3 rounded-xl text-xs font-label uppercase font-bold transition-all flex flex-col items-center gap-2 ${
                                    isActive
                                        ? "border-2 border-secondary bg-secondary-fixed text-primary shadow-sm ring-4 ring-secondary/10"
                                        : "border border-outline-variant hover:border-secondary hover:bg-secondary/5 text-outline"
                                }`}
                            >
                                {opt.icon && <span className="text-lg">{opt.icon}</span>}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
                    {options.map((opt) => {
                        const isActive = selected === opt.value;
                        return (
                            <div
                                key={opt.value}
                                className={`py-3 text-xs font-label uppercase font-bold text-center transition-all ${
                                    isActive
                                        ? "bg-white text-primary shadow-sm rounded-lg border border-outline-variant/20"
                                        : "text-outline"
                                }`}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}