import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TokenService from "./services/tokenService";

export default function App() {
    const [page, setPage] = useState(() =>
        TokenService.isAuthenticated() ? "dashboard" : "login"
    );

    switch (page) {
        case "signup":
            return <SignupPage onNavigate={setPage} />;
        case "dashboard":
            return <DashboardPage onNavigate={setPage} />;
        default:
            return <LoginPage onNavigate={setPage} />;
    }
}