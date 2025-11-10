export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        elma: {
          purple: "#BA92FF",
          pink: "#FFBBD8",
          sky: "#90E0EF",
          white: "#FAFAFF",
          ink: "#0F1020",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
