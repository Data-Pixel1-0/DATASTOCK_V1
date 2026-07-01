import AppRoutes from "./routes/AppRoutes";
import { LanguageProvider } from "./context/LanguageProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
