import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./features/landing/Welcome";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import Profile from "./features/profile/Profile";
import MyCommitments from "./features/commitments/MyCommitments";
import ActiveRequests from "./features/requests/ActiveRequests";
import RequestHistory from "./features/requests/RequestHistory";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/commitments" element={<MyCommitments />} />
            <Route path="/requests" element={<ActiveRequests />} />
            <Route path="/history" element={<RequestHistory />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;