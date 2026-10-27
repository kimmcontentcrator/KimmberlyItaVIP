import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import SectionPage from "./pages/SectionPage";
import AdminLogin from "./pages/AdminLogin";
import AdminRequests from "./pages/AdminRequests";
import AdminContent from "./pages/AdminContent";
import { FanProvider } from "./context/FanContext";
import { ContentProvider } from "./context/ContentContext";
import { RequestPrefillProvider } from "./context/RequestPrefill";
import { EditMode } from "./components/EditMode";
import { NavBridge } from "./components/NavBridge";

function App() {
  return (
    <div className="App">
      <ContentProvider>
      <FanProvider>
      <RequestPrefillProvider>
        <BrowserRouter>
          <NavBridge />
          <EditMode />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/vault" element={<SectionPage which="vault" />} />
            <Route path="/richiesta" element={<SectionPage which="richiesta" />} />
            <Route path="/come-funziona" element={<SectionPage which="come-funziona" />} />
            <Route path="/chi-sono" element={<SectionPage which="chi-sono" />} />
            <Route path="/regole" element={<SectionPage which="regole" />} />
            <Route path="/domande" element={<SectionPage which="domande" />} />
            <Route path="/contatti" element={<SectionPage which="contatti" />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/contenuti" element={<AdminContent />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: { background: "#141418", border: "1px solid rgba(0,175,240,0.3)", color: "#f5f2ee", fontFamily: "Space Grotesk, sans-serif" },
          }}
        />
      </RequestPrefillProvider>
      </FanProvider>
      </ContentProvider>
    </div>
  );
}

export default App;
