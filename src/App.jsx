import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./context/ThemeProvider.jsx";

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
