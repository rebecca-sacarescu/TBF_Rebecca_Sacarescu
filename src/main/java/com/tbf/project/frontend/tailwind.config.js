/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    500: '#3b82f6',
                    600: '#2563eb',
                },
                accent: {
                    400: '#60a5fa',
                    500: '#3b82f6',
                },
                support: {
                    400: '#9ca3af',
                    500: '#6b7280',
                },
                surface: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                },
                border: {
                    200: '#e5e7eb',
                    300: '#d1d5db',
                },
                content: {
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
            },
        },
    },
    plugins: [],
};