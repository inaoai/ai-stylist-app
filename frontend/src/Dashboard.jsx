// Dashboard.jsx
import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import ProfileForm from "./ProfileForm.jsx";
import QuizForm from "./QuizForm.jsx";
import SelfieUpload from "./SelfieUpload.jsx";

/**
 * Simple base64url JWT decode helper. Returns payload object or null.
 */
function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url -> base64
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function Dashboard({ user_id: user_idProp }) {
  // If parent provided user_id use it. Otherwise try to read it from token.
  const token = localStorage.getItem("token");
  const payload = token ? decodeJwt(token) : null;

  // Possible key names in token: user_id
  const idFromToken = payload?.user_id ?? null;

  // final user_id (keeps as number when possible) — we intentionally name it `user_id`
  const user_id =
    user_idProp ??
    (typeof idFromToken === "string" && idFromToken.trim() !== "" ? Number(idFromToken) : idFromToken ?? null);

  console.log("[Dashboard] resolved user_id:", user_id);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Dashboard</h2>

      {/* Navigation Menu */}
      <nav style={{ marginBottom: "20px" }}>
        <Link to="profile" style={{ marginRight: "15px" }}>
          Profile
        </Link>
        <Link to="quiz" style={{ marginRight: "15px" }}>
          Quiz
        </Link>
        <Link to="selfie">Selfie</Link>
      </nav>

      {/* Routes for sub-pages */}
      <Routes>
        <Route path="profile" element={<ProfileForm user_id={user_id} />} />
        <Route path="quiz" element={<QuizForm user_id={user_id} />} />
        <Route path="selfie" element={<SelfieUpload user_id={user_id} />} />
        <Route path="/" element={<p>Welcome! Choose an option above.</p>} />
      </Routes>
    </div>
  );
}

export default Dashboard;
