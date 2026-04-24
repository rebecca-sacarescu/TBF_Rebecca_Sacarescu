import { useState, useCallback, useEffect } from "react";
import TokenService from "./services/tokenService";
import profileApi from "./services/profileApi";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import FeedPage from "./pages/FeedPage";
import MatchesPage from "./pages/MatchesPage";
import SavedProfilesPage from "./pages/SavedProfilesPage";
import DiscoverProfilePage from "./pages/DiscoverProfilePage";
import OpenTripsPage from "./pages/OpenTripsPage";
import MyTripsPage from "./pages/MyTripsPage";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

export default function App() {
    const [page, setPage] = useState(() =>
        TokenService.isAuthenticated() ? "check-profile" : "login"
    );
    const [checking, setChecking] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [discoverFromPage, setDiscoverFromPage] = useState("feed");

    const handleNavigate = useCallback((target) => {
        if (target === "logout" || target === "force-login") {
            TokenService.logout();
            setPage("login");
            return;
        }
        setPage(target);
    }, []);

    const handleViewProfile = useCallback((userId, fromPage = "feed") => {
        setSelectedProfileId(userId);
        setDiscoverFromPage(fromPage);
        setPage("discover");
    }, []);

    useEffect(() => {
        if (page !== "check-profile") return;
        let cancelled = false;
        setChecking(true);
        profileApi
            .getMyProfile()
            .then(() => { if (!cancelled) setPage("feed"); })
            .catch((err) => {
                if (cancelled) return;
                if (err?.status === 401 || err?.status === 403) {
                    TokenService.logout(); setPage("login");
                } else {
                    setPage("create-profile");
                }
            })
            .finally(() => { if (!cancelled) setChecking(false); });
        return () => { cancelled = true; };
    }, [page]);

    if (page === "check-profile" || checking) {
        return (
            <div style={{ minHeight: "100vh", background: "#E9E3DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#666161", borderRightColor: "#AF9AC9",
                        animation: "spin 0.9s linear infinite",
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
                        fontWeight: 600, color: "#A5937B",
                        letterSpacing: "0.18em", textTransform: "uppercase", margin: 0,
                    }}>
                        Preparing your journey...
                    </p>
                </div>
            </div>
        );
    }

    if (page === "login")          return <LoginPage  onNavigate={handleNavigate} />;
    if (page === "signup")         return <SignupPage onNavigate={handleNavigate} />;
    if (page === "create-profile") return <CreateProfilePage onNavigate={handleNavigate} />;
    if (!TokenService.isAuthenticated()) return <LoginPage onNavigate={handleNavigate} />;

    const renderDashboardContent = () => {
        switch (page) {
            case "feed":
                return <FeedPage onNavigate={handleNavigate} onViewProfile={(userId) => handleViewProfile(userId, "feed")} />;
            case "saved":
                return <SavedProfilesPage onNavigate={handleNavigate} onViewProfile={(userId) => handleViewProfile(userId, "saved")} />;
            case "matches":
                return <MatchesPage onNavigate={handleNavigate} />;
            case "discover":
                return <DiscoverProfilePage profileId={selectedProfileId} fromPage={discoverFromPage} onNavigate={handleNavigate} />;
            case "open-trips":
                return <OpenTripsPage onNavigate={handleNavigate} />;
            case "my-trips":
                return <MyTripsPage onNavigate={handleNavigate} />;
            case "profile":
            default:
                return <MyProfilePage onAuthError={() => handleNavigate("force-login")} />;
        }
    };

    return (
        // Global background — warm beige across entire app
        <div style={{ background: "#E9E3DE", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <TopNav activeTab={page} onNavigate={handleNavigate} />
            {/*
                mt-[72px] matches the new navbar height (72px).
                Horizontal padding kept identical to original.
            */}
            <main
                className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-12"
                style={{ marginTop: "72px", marginBottom: "48px" }}
            >
                {renderDashboardContent()}
            </main>
            <Footer />
        </div>
    );
}