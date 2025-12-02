
import { motion } from 'framer-motion';
import { Compass, Users, MapPin, Heart } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import {useState} from "react";

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center lg:text-left space-y-8"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                            <div className="bg-blue-600 p-3 rounded-2xl">
                                <Compass className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900">Travel Buddy Finder</h1>
                        </div>
                        <p className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
                            Connect with like-minded travelers and discover your perfect travel companions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto lg:mx-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <Users className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
                            <p className="text-sm text-gray-600">AI-powered compatibility based on interests and travel style</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <MapPin className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Location-Based</h3>
                            <p className="text-sm text-gray-600">Find travel buddies near you or at your destination</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <Heart className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Personality Match</h3>
                            <p className="text-sm text-gray-600">Connect based on personality traits and travel preferences</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                                <span className="text-white font-bold text-sm">💬</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Chat & Connect</h3>
                            <p className="text-sm text-gray-600">Message potential travel buddies and plan together</p>
                        </motion.div>
                    </div>

                    <div className="hidden lg:block">
                        <img
                            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop&crop=center"
                            alt="Travelers exploring together"
                            className="rounded-2xl shadow-lg w-full max-w-md"
                        />
                    </div>
                </motion.div>

                {/* Right Side - Auth Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md mx-auto"
                >
                    <AuthForm isLogin={isLogin} onToggle={toggleAuthMode} />
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;