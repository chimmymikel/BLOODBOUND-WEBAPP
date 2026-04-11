import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Welcome";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard"; 
import Profile from "./Profile";
import MyCommitments from "./MyCommitments";
import ActiveRequests from "./ActiveRequests";
import RequestHistory from "./RequestHistory"; // 👈 1. Import the new history page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/commitments" element={<MyCommitments />} /> 
        <Route path="/requests" element={<ActiveRequests />} />

        {/* 👈 2. Add the Request History Route */}
        <Route path="/history" element={<RequestHistory />} />
      </Routes>
    </Router>
  );
}

export default App;