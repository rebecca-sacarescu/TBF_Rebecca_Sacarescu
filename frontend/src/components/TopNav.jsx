import TokenService from "../services/tokenService";

export default function TopNav({ activeTab, onNavigate }) {
    const tabs = [
        { key: "feed", label: "Feed" },
        { key: "profile", label: "My Profile" },
        { key: "matches", label: "Matches" },
    ];

    const handleLogout = () => {
        TokenService.logout();
        onNavigate("login");
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-primary shadow-[0_24px_48px_rgba(0,29,69,0.06)]">
            <nav className="flex justify-between items-center w-full px-6 md:px-12 h-16 md:h-20">
                {/* Logo */}
                <div className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase font-headline">
                    Travel Buddy
                </div>

                {/* Nav tabs */}
                <div className="hidden md:flex items-center space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onNavigate(tab.key)}
                            className={`font-headline tracking-tight transition-colors pb-1 ${
                                activeTab === tab.key
                                    ? "text-tertiary-fixed-dim border-b-2 border-tertiary-fixed-dim font-bold"
                                    : "text-slate-300 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile tabs */}
                    <div className="flex md:hidden items-center space-x-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onNavigate(tab.key)}
                                className={`text-xs font-headline px-2 py-1 rounded-lg transition-colors ${
                                    activeTab === tab.key
                                        ? "bg-white/10 text-tertiary-fixed-dim font-bold"
                                        : "text-slate-400"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-slate-300 hover:bg-white/10 p-2 rounded-lg transition-all"
                        title="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </nav>
        </header>
    );
}