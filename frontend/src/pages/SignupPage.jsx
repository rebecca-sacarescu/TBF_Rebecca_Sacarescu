import { useState } from "react";
import BoardingPassLayout, { Barcode } from "../components/BoardingPassLayout";
import FormInput from "../components/FormInput";
import PasswordRules from "../components/PasswordRules";
import {
    MailIcon,
    LockIcon,
    PersonIcon,
    ArrowIcon,
    SpinnerIcon,
    TicketIcon,
    ExploreIcon,
} from "../components/Icons";
import { validators } from "../utils/validators";
import authApi, { parseBackendError } from "../services/authApi";
import TokenService from "../services/tokenService";

/* ── Right stub decoration for Signup ── */
function SignupStub() {
    return (
        <>
            <div className="w-full">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm text-blue-600">
                    <TicketIcon size={24} />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Flight Ref
                </p>
                <p className="text-base font-black text-slate-900 mb-3">
                    TB-SIGNUP-NEW
                </p>
                <div className="text-left border-b border-slate-200 pb-2 mb-2">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">
                                From
                            </p>
                            <p className="font-bold text-blue-600 text-sm">NEW</p>
                        </div>
                        <span className="text-slate-300 text-xs mb-0.5">✈</span>
                        <div className="text-right">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">
                                To
                            </p>
                            <p className="font-bold text-slate-900 text-sm">PRO</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-auto py-3">
        <span className="text-blue-600">
          <ExploreIcon size={32} />
        </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-0.5">
                    Status
                </p>
                <p className="text-xl font-black text-slate-900">Ready</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Your boarding pass awaits
                </p>
            </div>
            <Barcode code="TB-REG-FIRST-FLIGHT" />
        </>
    );
}

export default function SignupPage({ onNavigate }) {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    const setField = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        setErrors((p) => ({ ...p, [field]: "" }));
        setApiError("");
    };

    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Email is required";
        else if (!validators.email(form.email))
            e.email = "Enter a valid email address";

        if (!form.username) e.username = "Username is required";
        else if (!validators.username(form.username))
            e.username =
                "Only letters, numbers, dots, dashes, underscores (3–30 chars)";

        if (!form.password) e.password = "Password is required";
        else if (!validators.password.all(form.password))
            e.password = "Password doesn't meet all requirements";

        if (!form.confirmPassword)
            e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword)
            e.confirmPassword = "Passwords do not match";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setApiError("");
        if (!validate()) return;
        setLoading(true);
        try {
            // Only send the fields the backend expects — no confirmPassword
            const res = await authApi.signup({
                email: form.email,
                username: form.username,
                password: form.password,
            });
            TokenService.setToken(res.token);
            // Navigate to profile page (user can fill profile there)
            onNavigate("create-profile");
        } catch (err) {
            setApiError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <BoardingPassLayout
            stub={<SignupStub />}
            footerLinkText="Already have an account?"
            footerLink="Check-In"
            onFooterClick={() => onNavigate("login")}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
                <div>
          <span className="text-blue-600 font-bold text-[11px] uppercase tracking-widest">
            Boarding Pass
          </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-0.5">
                        New Journey
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Complete your passenger profile to get your boarding pass
                    </p>
                </div>
                <div className="text-right hidden lg:block">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">
                        Class
                    </p>
                    <p className="text-slate-900 font-bold text-sm">First Class</p>
                </div>
            </div>

            {/* API error */}
            {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                    {apiError}
                </div>
            )}

            {/* ── WIDE form: 2-column grid ── */}
            <div className="flex flex-col gap-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <FormInput
                        id="signup-email"
                        label="Contact Email"
                        icon={MailIcon}
                        type="email"
                        placeholder="passenger@skyhigh.com"
                        value={form.email}
                        onChange={setField("email")}
                        error={errors.email}
                    />
                    <FormInput
                        id="signup-username"
                        label="Passenger Name (username)"
                        icon={PersonIcon}
                        type="text"
                        placeholder="johndoe"
                        value={form.username}
                        onChange={setField("username")}
                        error={errors.username}
                        hint="Letters, numbers, dots, dashes, underscores"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                        <FormInput
                            id="signup-password"
                            label="Secure Access Pin"
                            icon={LockIcon}
                            type="password"
                            placeholder="••••••••••••"
                            value={form.password}
                            onChange={setField("password")}
                            error={errors.password}
                        />
                        <PasswordRules password={form.password} />
                    </div>
                    <FormInput
                        id="signup-confirm"
                        label="Confirm Access Pin"
                        icon={LockIcon}
                        type="password"
                        placeholder="••••••••••••"
                        value={form.confirmPassword}
                        onChange={setField("confirmPassword")}
                        error={errors.confirmPassword}
                    />
                </div>

                {/* Bottom bar: decorative info + submit */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Gate
                            </p>
                            <p className="text-lg font-bold text-slate-900">B24</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Seat
                            </p>
                            <p className="text-lg font-bold text-slate-900">01A</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Boarding
                            </p>
                            <p className="text-lg font-bold text-slate-900">Now</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <SpinnerIcon />
                        ) : (
                            <>
                                Book Flight
                                <ArrowIcon size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </BoardingPassLayout>
    );
}