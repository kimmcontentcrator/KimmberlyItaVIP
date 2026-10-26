import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import AdminRequests from "./pages/AdminRequests";
import { FanProvider } from "./context/FanContext";
import { ContentProvider } from "./context/ContentContext";
import AdminContent from "./pages/AdminContent";
import { EditMode } from "./components/EditMode";

function App() {
  return (
    <div className="App">
      <ContentProvider>
      <FanProvider>
        <BrowserRouter>
          <EditMode />
          <Routes>
            <Route path="/" element={<Landing />} />
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
            style: { background: "#141418", border: "1px solid rgba(214,178,94,0.3)", color: "#f5f2ee", fontFamily: "Space Grotesk, sans-serif" },
          }}
        />
      </FanProvider>
      </ContentProvider>
    </div>
  );
}

export default App;
