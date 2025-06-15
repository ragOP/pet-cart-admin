import { Toaster } from "sonner";
import Router from "./router";
import { ThemeProvider } from "./theme";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router />
      </ThemeProvider>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
