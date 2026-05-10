import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Welcome";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import MyCommitments from "./MyCommitments";
import ActiveRequests from "./ActiveRequests";
import RequestHistory from "./RequestHistory";
import Footer from "./Footer";

function App() {
  return (
    <Router>
      {/*
        min-height: 100vh + flex column ensures the footer is always
        pushed to the bottom even on short-content pages.
      */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Main content grows to fill available space ── */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"           element={<Welcome />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/commitments" element={<MyCommitments />} />
            <Route path="/requests"   element={<ActiveRequests />} />
            <Route path="/history"    element={<RequestHistory />} />
          </Routes>
        </main>

        {/*
          Footer handles its own visibility internally —
          it returns null on /, /login, /register automatically.
        */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;