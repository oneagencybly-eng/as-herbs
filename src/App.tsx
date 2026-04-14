import { HashRouter, Routes, Route } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ padding: "40px", fontSize: "24px" }}>
      Router is working
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
