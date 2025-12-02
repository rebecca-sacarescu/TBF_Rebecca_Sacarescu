
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Users, MapPin, Heart, Shield } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <Compass className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Travel Buddy Finder</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
                            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
                            <Link
                                to="/auth"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Get Started
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                            Find Your Perfect
                            <span className="text-blue-600 block">Travel Companion</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Connect with like-minded travelers, discover compatible personalities, and create unforgettable adventures together. Our AI-powered matching helps you find the ideal travel buddy based on interests, location, and travel style.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/auth"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center space-x-2"
                            >
                                <span>Start Your Journey</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="text-blue-600 hover:text-blue-700 px-8 py-4 font-semibold text-lg transition-colors">
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop&crop=center"
                            alt="Beautiful travel destination"
                            className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Travel Buddy Finder?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our intelligent platform uses advanced algorithms to match you with compatible travel companions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <Users className="w-12 h-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart AI Matching</h3>
                            <p className="text-gray-600">
                                Our LLM-powered system analyzes your bio and preferences to find travelers with compatible personalities and interests.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <MapPin className="w-12 h-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Location-Based Discovery</h3>
                            <p className="text-gray-600">
                                Find travel buddies near you or at your destination using our advanced PostGIS geographic matching system.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <Heart className="w-12 h-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality Compatibility</h3>
                            <p className="text-gray-600">
                                Match based on travel style, personality traits, and shared interests for meaningful connections.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-white text-2xl">💬</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Messaging</h3>
                            <p className="text-gray-600">
                                Chat with potential travel buddies, share itineraries, and plan your adventures together in real-time.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-white text-2xl">👆</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Swipe to Match</h3>
                            <p className="text-gray-600">
                                Intuitive swipe interface to quickly browse and connect with potential travel companions.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
                        >
                            <Shield className="w-12 h-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Safe</h3>
                            <p className="text-gray-600">
                                Built with Spring Security and JWT authentication to ensure your data and conversations are protected.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl font-bold text-white">Ready to Find Your Travel Buddy?</h2>
                        <p className="text-xl text-blue-100">
                            Join thousands of travelers who have found their perfect companions through our platform
                        </p>
                        <Link
                            to="/auth"
                            className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                        >
                            <span>Get Started Today</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-xl">
                                    <Compass className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">Travel Buddy Finder</span>
                            </div>
                            <p className="text-gray-400">
                                Connecting travelers worldwide through intelligent matching and shared adventures.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Travel Buddy Finder. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;