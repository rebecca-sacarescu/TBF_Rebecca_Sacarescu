export const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),

    username: (v) => /^[a-zA-Z0-9._-]{3,30}$/.test(v),

    password: {
        minLength: (v) => v.length >= 8,
        uppercase: (v) => /[A-Z]/.test(v),
        lowercase: (v) => /[a-z]/.test(v),
        digit: (v) => /\d/.test(v),
        special: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
        all: (v) =>
            v.length >= 8 &&
            /[A-Z]/.test(v) &&
            /[a-z]/.test(v) &&
            /\d/.test(v) &&
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
    },
};

export const passwordRules = [
    { key: "minLength", label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "lowercase", label: "One lowercase letter" },
    { key: "digit", label: "One digit" },
    { key: "special", label: "One special character (!@#$...)" },
];