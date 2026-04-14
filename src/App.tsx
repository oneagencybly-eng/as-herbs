import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import ThankYou from "./pages/ThankYou.tsx";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
