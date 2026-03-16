import { useState } from "react";
import BoardingPassLayout, { Barcode } from "../components/BoardingPassLayout";
import FormInput from "../components/FormInput";
import {
    MailIcon,
    LockIcon,
    ArrowIcon,
    SpinnerIcon,
    ExploreIcon,
    CheckCircleIcon,
} from "../components/Icons";
import { validators } from "../utils/validators";
import authApi, { parseBackendError } from "../services/authApi";
import TokenService from "../services/tokenService";

/* ── Right stub decoration for Login ── */
function LoginStub() {
    return (
        <>
            <Barcode code="TB-992-LOGIN" />
            <div className="my-auto py-4">
        <span className="text-blue-600">
          <ExploreIcon size={36} />
        </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-1">
                    Destination
                </p>
                <p className="text-2xl font-black text-slate-900 leading-tight">
                    Adventure
                </p>
            </div>
            <div className="w-full border-t border-slate-200 pt-4">
                <div className="flex justify-between text-left mb-3">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Boarding
                        </p>
                        <p className="font-bold text-slate-900 text-sm">Now</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Zone
                        </p>
                        <p className="font-bold text-slate-900 text-sm">Priority</p>
                    </div>
                </div>
                <p className="text-[9px] text-slate-400 italic leading-snug">
                    "The journey of a thousand miles begins with a single click."
                </p>
            </div>
        </>
    );
}

export default function LoginPage({ onNavigate }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const e = {};
        if (!email) e.email = "Email is required";
        else if (!validators.email(email)) e.email = "Enter a valid email address";
        if (!password) e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setApiError("");
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            // ASSUMPTION: response has { token: "..." }
            TokenService.setToken(res.token);
            setSuccess(true);
            // In production with react-router: navigate("/dashboard")
        } catch (err) {
            setApiError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    /* ── Success state ── */
    if (success) {
        return (
            <BoardingPassLayout stub={<LoginStub />}>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        Check-in Complete!
                    </h2>
                    <p className="text-slate-500 text-sm mb-4">
                        Welcome back, traveler. Redirecting to your dashboard...
                    </p>
                    <p className="text-[11px] text-slate-400">
                        (In production, this redirects to{" "}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            /dashboard
                        </code>
                        )
                    </p>
                </div>
            </BoardingPassLayout>
        );
    }

    return (
        <BoardingPassLayout
            stub={<LoginStub />}
            footerLinkText="Don't have an account?"
            footerLink="Sign Up"
            onFooterClick={() => onNavigate("signup")}
        >
            {/* Header row */}
            <div className="flex justify-between items-start mb-6">
                <div>
          <span className="text-blue-600 font-bold text-[11px] uppercase tracking-widest">
            Boarding Pass
          </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-0.5">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Check-in to your account to continue your journey
                    </p>
                </div>
                <div className="text-right hidden lg:block">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">
                        Class
                    </p>
                    <p className="text-slate-900 font-bold text-sm">Economy</p>
                </div>
            </div>

            {/* API error banner */}
            {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                    {apiError}
                </div>
            )}

            {/* ── WIDE form layout: fields side-by-side ── */}
            <div className="flex flex-col gap-4">
                {/* Decorative info row */}
                <div className="flex gap-6 mb-1">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Gate
                        </p>
                        <p className="text-xl font-black text-slate-900">01</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Seat
                        </p>
                        <p className="text-xl font-black text-slate-900">1A</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Boarding
                        </p>
                        <p className="text-xl font-black text-slate-900">Now</p>
                    </div>
                </div>

                {/* Fields in a row on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="login-email"
                        label="Email Address"
                        icon={MailIcon}
                        type="email"
                        placeholder="passenger@travelbuddy.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((p) => ({ ...p, email: "" }));
                        }}
                        error={errors.email}
                    />
                    <FormInput
                        id="login-password"
                        label="Password"
                        icon={LockIcon}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((p) => ({ ...p, password: "" }));
                        }}
                        error={errors.password}
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <SpinnerIcon />
                        ) : (
                            <>
                                Check-In
                                <ArrowIcon size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </BoardingPassLayout>
    );
}