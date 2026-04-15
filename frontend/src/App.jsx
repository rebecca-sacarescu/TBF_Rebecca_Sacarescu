import { useState, useCallback, useEffect } from "react";
import TokenService from "./services/tokenService";
import profileApi from "./services/profileApi";

// Auth pages (boarding pass layout)
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Onboarding
import CreateProfilePage from "./pages/CreateProfilePage";

// Dashboard pages (new layout)
import MyProfilePage from "./pages/MyProfilePage";
import FeedPage from "./pages/FeedPage";
import MatchesPage from "./pages/MatchesPage";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

export default function App() {
    const [page, setPage] = useState(() =>
        TokenService.isAuthenticated() ? "check-profile" : "login"
    );
    const [checking, setChecking] = useState(false);

    // Global navigate handler
    const handleNavigate = useCallback((target) => {
        if (target === "logout" || target === "force-login") {
            TokenService.logout();
            setPage("login");
            return;
        }
        setPage(target);
    }, []);

    // When page is "check-profile", determine if profile exists
    useEffect(() => {
        if (page !== "check-profile") return;

        let cancelled = false;
        setChecking(true);

        profileApi
            .getMyProfile()
            .then(() => {
                if (!cancelled) setPage("profile");
            })
            .catch((err) => {
                if (cancelled) return;
                if (err?.status === 401 || err?.status === 403) {
                    TokenService.logout();
                    setPage("login");
                } else {
                    // 404 or any other error = profile doesn't exist yet
                    setPage("create-profile");
                }
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page]);

    // Loading state while checking profile
    if (page === "check-profile" || checking) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="animate-spin h-8 w-8 text-secondary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="font-label text-sm text-outline uppercase tracking-widest">
                        Preparing your journey...
                    </p>
                </div>
            </div>
        );
    }

    // Auth pages — boarding pass layout
    if (page === "login") return <LoginPage onNavigate={handleNavigate} />;
    if (page === "signup") return <SignupPage onNavigate={handleNavigate} />;

    // Onboarding — create profile
    if (page === "create-profile") {
        return <CreateProfilePage onNavigate={handleNavigate} />;
    }

    // Safety: no token → login
    if (!TokenService.isAuthenticated()) {
        return <LoginPage onNavigate={handleNavigate} />;
    }

    // Dashboard pages — TopNav + Footer layout
    const renderDashboardContent = () => {
        switch (page) {
            case "feed":
                return <FeedPage onNavigate={handleNavigate} />;
            case "matches":
                return <MatchesPage />;
            case "profile":
            default:
                return (
                    <MyProfilePage onAuthError={() => handleNavigate("force-login")} />
                );
        }
    };

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
            <TopNav activeTab={page} onNavigate={handleNavigate} />
            <main className="mt-24 md:mt-28 mb-12 flex-grow max-w-7xl mx-auto px-4 md:px-12 w-full">
                {renderDashboardContent()}
            </main>
            <Footer />
        </div>
    );
}