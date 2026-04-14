import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";

const ThankYouTest = () => {
  return (
    <div style={{ padding: "40px", fontSize: "24px" }}>
      Thank You route is working
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/thank-you" element={<ThankYouTest />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
