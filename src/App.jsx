import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Welcome";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard"; // <--- Double check this import!

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Landing Page */}
        <Route path="/" element={<Welcome />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Success Page */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
