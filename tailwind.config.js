/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/mainview/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#0a0a0f",
				secondary: "#12121a",
				card: "rgba(255, 255, 255, 0.04)",
				"card-hover": "rgba(255, 255, 255, 0.07)",
				accent: {
					DEFAULT: "#6366f1",
					hover: "#818cf8",
					glow: "rgba(99, 102, 241, 0.4)",
					subtle: "rgba(99, 102, 241, 0.12)",
				},
				success: {
					DEFAULT: "#22c55e",
					glow: "rgba(34, 197, 94, 0.3)",
				},
				danger: {
					DEFAULT: "#ef4444",
					hover: "#f87171",
				},
				"t-primary": "#f0f0f5",
				"t-secondary": "#8888a0",
				"t-muted": "#555570",
			},
			borderColor: {
				default: "rgba(255, 255, 255, 0.08)",
				"default-hover": "rgba(255, 255, 255, 0.15)",
			},
			borderRadius: {
				xl: "14px",
				lg: "10px",
			},
			fontFamily: {
				sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
			},
			transitionDuration: {
				DEFAULT: "200ms",
			},
			keyframes: {
				"fade-in": {
					from: { opacity: "0", transform: "translateY(8px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"check-pop": {
					"0%": { transform: "scale(0)", opacity: "0" },
					"50%": { transform: "scale(1.2)" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
				pulse: {
					"0%, 100%": { opacity: "0.4" },
					"50%": { opacity: "1" },
				},
			},
			animation: {
				"fade-in": "fade-in 0.35s ease",
				"check-pop": "check-pop 0.5s ease",
				pulse: "pulse 1.5s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};
