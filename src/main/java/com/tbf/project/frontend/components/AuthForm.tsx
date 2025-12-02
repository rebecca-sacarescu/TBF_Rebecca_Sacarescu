
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Calendar, Languages } from 'lucide-react';
import { toast } from 'react-toastify';
import {useState} from "react";

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    bio: z.string().min(50, 'Bio must be at least 50 characters'),
    location: z.string().min(2, 'Please enter your location'),
    languages: z.string().min(2, 'Please enter languages you speak'),
    travelPeriod: z.string().min(1, 'Please select your travel period'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
    isLogin: boolean;
    onToggle: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const signupForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Welcome back to Travel Buddy Finder!');
            console.log('Login data:', data);
        } catch (error) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSignupSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Account created successfully! Welcome to Travel Buddy Finder!');
            console.log('Signup data:', data);
        } catch (error) {
            toast.error('Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className="relative w-full max-w-md mx-auto overflow-hidden">
            <AnimatePresence mode="wait" custom={isLogin ? -1 : 1}>
                {isLogin ? (
                    <motion.div
                        key="login"
                        custom={-1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                <p className="text-gray-500">Sign in to find your travel buddies</p>
                            </div>

                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="login-email"
                                            type="email"
                                            {...loginForm.register('email')}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {loginForm.formState.errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            {...loginForm.register('password')}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={onToggle}
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="signup"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Travel Buddy Finder</h2>
                                <p className="text-gray-500">Create your profile and start connecting</p>
                            </div>

                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="signup-name"
                                            type="text"
                                            {...signupForm.register('name')}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    {signupForm.formState.errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="signup-email"
                                            type="email"
                                            {...signupForm.register('email')}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {signupForm.formState.errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                id="signup-password"
                                                type={showPassword ? 'text' : 'password'}
                                                {...signupForm.register('password')}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {signupForm.formState.errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                id="signup-confirm-password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                {...signupForm.register('confirmPassword')}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Confirm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {signupForm.formState.errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="signup-bio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio & Travel Preferences
                                    </label>
                                    <textarea
                                        id="signup-bio"
                                        {...signupForm.register('bio')}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Tell us about yourself, your travel style, interests, and what kind of travel buddy you're looking for..."
                                    />
                                    {signupForm.formState.errors.bio && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.bio.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="signup-location" className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                id="signup-location"
                                                type="text"
                                                {...signupForm.register('location')}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        {signupForm.formState.errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.location.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="signup-travel-period" className="block text-sm font-medium text-gray-700 mb-2">
                                            Travel Period
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <select
                                                id="signup-travel-period"
                                                {...signupForm.register('travelPeriod')}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                            >
                                                <option value="">Select period</option>
                                                <option value="flexible">Flexible</option>
                                                <option value="next-month">Next Month</option>
                                                <option value="next-3-months">Next 3 Months</option>
                                                <option value="next-6-months">Next 6 Months</option>
                                                <option value="specific-dates">Specific Dates</option>
                                            </select>
                                        </div>
                                        {signupForm.formState.errors.travelPeriod && (
                                            <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.travelPeriod.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="signup-languages" className="block text-sm font-medium text-gray-700 mb-2">
                                        Languages Spoken
                                    </label>
                                    <div className="relative">
                                        <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="signup-languages"
                                            type="text"
                                            {...signupForm.register('languages')}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="e.g., English, Spanish, French"
                                        />
                                    </div>
                                    {signupForm.formState.errors.languages && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.languages.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={onToggle}
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthForm;