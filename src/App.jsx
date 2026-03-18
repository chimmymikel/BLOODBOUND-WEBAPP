import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Welcome";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard"; 
import Profile from "./Profile"; // 👈 Ensure this path matches your folder structure

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Landing Page */}
        <Route path="/" element={<Welcome />} />

        {/* Auth Pages (SDD Requirement 1.3) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Core User Dashboards (SDD Requirement 2.3) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Profile & Eligibility Tracker (SDD Requirement 2.4) */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;