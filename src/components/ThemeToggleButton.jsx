import { useTheme } from "../context/useTheme.js";

function ThemeToggleButton({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      title={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      className={`group inline-flex h-11 w-16 shrink-0 items-center rounded-full border border-[#d8e8f7] bg-white p-1 shadow-sm shadow-[#082758]/10 transition hover:-translate-y-0.5 hover:border-[#69b523] focus:outline-none focus:ring-4 focus:ring-[#69b523]/20 ${className}`}
    >
      <span
        className={`block h-8 w-8 rounded-full shadow-md transition duration-300 ${
          isDark
            ? "translate-x-6 bg-[#69b523]"
            : "translate-x-0 bg-[#082758]"
        }`}
      />
    </button>
  );
}

export default ThemeToggleButton;
