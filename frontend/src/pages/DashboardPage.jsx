import TokenService from "../services/tokenService";
import { FlightIcon } from "../components/Icons";

export default function DashboardPage({ onNavigate }) {
    const handleLogout = () => {
        TokenService.logout();
        onNavigate("login");
    };

    const token = TokenService.getToken();

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background:
                    "linear-gradient(135deg, #e8f0fe 0%, #f5f7f8 40%, #fef3e2 100%)",
            }}
        >
            <div className="bg-white rounded-2xl p-10 shadow-xl max-w-md w-full text-center border border-slate-200/60">
                <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                    <FlightIcon />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Dashboard</h1>
                <p className="text-slate-500 text-sm mb-6">
                    You're authenticated! JWT is stored and ready for API calls.
                </p>
                {token && (
                    <code className="block bg-slate-50 p-3 rounded-lg text-xs text-slate-600 break-all mb-6 border">
                        {token.substring(0, 50)}...
                    </code>
                )}
                <button
                    onClick={handleLogout}
                    className="text-red-500 font-bold text-sm hover:underline"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}