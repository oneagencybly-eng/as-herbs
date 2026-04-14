import { HashRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import TelecallerLogin from "./pages/TelecallerLogin.tsx";
import TelecallerDashboard from "./pages/TelecallerDashboard.tsx";

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/telecaller" element={<TelecallerLogin />} />
      <Route path="/telecaller/dashboard" element={<TelecallerDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </HashRouter>
);

export default App;
