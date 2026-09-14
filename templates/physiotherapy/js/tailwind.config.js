/* ============================================
   PhysioCare - Tailwind Configuration
   Design System: Clinical Serenity
   ============================================ */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                tertiary: "#505355",
                "outline-variant": "#bec8cd",
                "surface-bright": "#f8f9ff",
                "error-container": "#ffdad6",
                secondary: "#006877",
                "clinical-white": "#FFFFFF",
                "surface-container-lowest": "#ffffff",
                "on-secondary-fixed-variant": "#004e5a",
                "on-secondary-container": "#00616f",
                "on-secondary": "#ffffff",
                "on-primary-container": "#d3f1ff",
                "on-surface-variant": "#3f484c",
                "surface-container": "#e6eeff",
                "secondary-fixed": "#a2eeff",
                "primary-container": "#0e7490",
                "surface-muted": "#F1F5F9",
                "on-tertiary": "#ffffff",
                error: "#ba1a1a",
                "on-error-container": "#93000a",
                "primary-fixed": "#b9eaff",
                "warning-amber": "#F59E0B",
                "on-error": "#ffffff",
                "surface-container-highest": "#d5e3fc",
                "on-tertiary-container": "#eaecee",
                background: "#f8f9ff",
                "on-background": "#0d1c2e",
                "surface-container-low": "#eff4ff",
                "on-tertiary-fixed": "#191c1e",
                "secondary-container": "#3fe1fd",
                "surface-variant": "#d5e3fc",
                "primary-fixed-dim": "#81d1f0",
                outline: "#6f787d",
                "secondary-fixed-dim": "#2fd9f4",
                "tertiary-container": "#686b6d",
                "inverse-primary": "#81d1f0",
                primary: "#005a71",
                "on-primary": "#ffffff",
                "surface-dim": "#ccdbf3",
                "tertiary-fixed": "#e0e3e5",
                "on-surface": "#0d1c2e",
                "surface-tint": "#006781",
                "on-primary-fixed-variant": "#004d62",
                "emergency-red": "#EF4444",
                surface: "#f8f9ff",
                "on-primary-fixed": "#001f29",
                "success-green": "#10B981",
                "tertiary-fixed-dim": "#c4c7c9",
                "on-secondary-fixed": "#001f25",
                "inverse-surface": "#233144",
                "surface-container-high": "#dce9ff",
                "on-tertiary-fixed-variant": "#444749",
                "inverse-on-surface": "#eaf1ff"
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
            },
            spacing: {
                "section-padding-desktop": "5rem",
                "stack-sm": "0.5rem",
                gutter: "1.5rem",
                "stack-md": "1rem",
                "section-padding-mobile": "2.5rem",
                "stack-lg": "2rem"
            },
            maxWidth: {
                "container-max": "1200px",
            },
            fontFamily: {
                "body-md": ["Inter"],
                "label-sm": ["JetBrains Mono"],
                "headline-lg": ["Manrope"],
                "headline-md": ["Manrope"],
                "headline-lg-mobile": ["Manrope"],
                "button-text": ["Inter"],
                "body-lg": ["Inter"]
            },
            fontSize: {
                "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
                "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
                "headline-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
                "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
                "headline-lg-mobile": ["30px", { lineHeight: "36px", fontWeight: "700" }],
                "button-text": ["16px", { lineHeight: "20px", fontWeight: "600" }],
                "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }]
            }
        }
    }
};
