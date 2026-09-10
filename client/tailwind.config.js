export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:          "#0F0F14",
        surface:     "#16161F",
        surfaceHigh: "#1E1E2A",
        border:      "#2A2A3A",
        accent:      "#818CF8",
        accentDim:   "#3D3F6E",
        green:       "#34D399",
        yellow:      "#FBBF24",
        red:         "#F87171",
        blue:        "#60A5FA",
        pink:        "#F472B6",
        orange:      "#FB923C",
        purple:      "#C084FC",
        text:        "#E8E8F0",
        muted:       "#6B6B8A",
        mutedLight:  "#9999B8",
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};