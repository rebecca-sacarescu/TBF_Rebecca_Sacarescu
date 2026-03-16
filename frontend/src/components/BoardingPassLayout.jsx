import { FlightIcon } from "./Icons";

/* Decorative barcode strip */
function Barcode({ code }) {
    const widths = [1, 2.5, 0.5, 3, 1, 1.5, 0.5, 2, 4, 1, 0.5, 2, 1, 3, 0.5];
    return (
        <div className="opacity-15">
            <div className="flex gap-[2px] h-7 justify-center items-center overflow-hidden">
                {widths.map((w, i) => (
                    <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 3.5}px` }} />
                ))}
            </div>
            <p className="text-center text-[7px] font-mono tracking-[0.4em] text-slate-900 mt-0.5">
                {code}
            </p>
        </div>
    );
}

export { Barcode };

export default function BoardingPassLayout({
                                               children,
                                               stub,
                                               footerLink,
                                               footerLinkText,
                                               onFooterClick,
                                           }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 md:p-6"
            style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: `
          radial-gradient(circle at 15% 25%, rgba(0,108,224,0.06) 0%, transparent 30%),
          radial-gradient(circle at 85% 75%, rgba(245,158,79,0.06) 0%, transparent 30%),
          linear-gradient(135deg, #e8f0fe 0%, #f5f7f8 40%, #fef3e2 100%)
        `,
            }}
        >
            <div className="relative w-full max-w-6xl">
                {/* Header */}
                <header className="flex items-center gap-3 mb-5 px-1">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
                        <FlightIcon size={22} />
                    </div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                        Travel Buddy
                    </h2>
                </header>

                {/* ── Boarding pass card — LANDSCAPE layout ── */}
                <div
                    className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/60"
                    style={{
                        boxShadow:
                            "0 20px 60px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.03)",
                    }}
                >
                    {/* Main form area — takes ~75% width */}
                    <div className="flex-[3] p-6 md:p-8 lg:p-10 flex flex-col relative">
                        {/* Accent strip */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-amber-400" />
                        {children}
                        {/* Decorative dots */}
                        <div className="absolute bottom-5 left-8 flex gap-1.5">
                            <div className="h-1 w-6 bg-blue-600 rounded-full" />
                            <div className="h-1 w-1.5 bg-blue-400 rounded-full" />
                            <div className="h-1 w-1.5 bg-amber-400 rounded-full" />
                        </div>
                    </div>

                    {/* Stub / right panel — narrower, decorative */}
                    <div
                        className="hidden md:flex flex-1 max-w-[220px] bg-slate-50 p-6 relative flex-col justify-between items-center text-center"
                        style={{ borderLeft: "2px dashed #e2e8f0" }}
                    >
                        {/* Perforation circle */}
                        <div
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(135deg, #e8f0fe, #f5f7f8)",
                            }}
                        />
                        {stub}
                    </div>
                </div>

                {/* Footer link */}
                {footerLinkText && (
                    <div className="mt-5 text-center">
                        <p className="text-slate-500 text-sm">
                            {footerLinkText}{" "}
                            <button
                                onClick={onFooterClick}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                {footerLink}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}