// App.jsx
import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard.jsx"; 

/**
 * formatError - extract readable message(s) from axios / FastAPI error shapes
 */
function formatError(err) {
  const data = err?.response?.data ?? null;

  if (!data) return err?.message || "Network error or server not reachable";

  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(" | ");
  if (typeof data.detail === "object" && Object.keys(data.detail).length) {
    return Object.entries(data.detail)
      .flatMap(([k, v]) =>
        Array.isArray(v) ? v.map(m => `${k}: ${m}`) : `${k}: ${JSON.stringify(v)}`
      )
      .join(" | ");
  }

  if (typeof data === "object") {
    const msgs = Object.entries(data).flatMap(([k, v]) => {
      if (Array.isArray(v)) return v.map(m => `${k}: ${m}`);
      if (typeof v === "string") return `${k}: ${v}`;
      return `${k}: ${JSON.stringify(v)}`;
    });
    if (msgs.length) return msgs.join(" | ");
  }

  if (Array.isArray(data)) return data.join(" | ");
  if (typeof data === "string") return data;

  return JSON.stringify(data);
}

// -------------------------
// Login/Register Component
// -------------------------
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email?.trim() || !password) {
      alert("Please provide both email and password.");
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const register = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/register", { email, password });

      const userId = res?.data?.user_id;
      const token = res?.data?.access_token;

      if (userId && token) {
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);
        navigate("/dashboard");
      } else {
        alert(res?.data?.message ?? "Registered, but missing login details.");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed: " + formatError(err));
    } finally {
      setLoading(false);
    }
  };

// replace existing login() in App.jsx
const login = async () => {
  if (!email?.trim() || !password) {
    alert("Please provide email and password.");
    return;
  }
  setLoading(true);
  try {
    const res = await axios.post("http://localhost:8000/login", { email, password });

    // debug: log the full response to see exactly what backend returned
    console.log("Login response:", res);
    const data = res?.data ?? {};

    // common shapes:
    // { access_token: "....", token_type: "bearer", user_id: 1 }
    // { token: "..." }
    // { accessToken: "...", id: 1 }
    const token =
      data.access_token ??
      data.token ??
      data.accessToken ??
      data?.data?.access_token; // some wrappers

    const userId = data.user_id ?? data.id ?? data.user?.id;

    if (!token) {
      // show entire response body so you can inspect it in the UI quickly
      alert("Login succeeded but missing token or userId.\n\nResponse: " + JSON.stringify(data));
      return;
    }

    // persist token and user id if present
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", String(userId));
    navigate("/dashboard");
  } catch (err) {
    console.error("Login error (full):", err);
    const message = formatError(err);
    alert("Login failed: " + message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2>User Authentication</h2>

      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        style={{ width: "100%", marginBottom: 10, padding: 8, boxSizing: "border-box" }}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        style={{ width: "100%", marginBottom: 10, padding: 8, boxSizing: "border-box" }}
      />

      <div>
        <button onClick={register} disabled={loading} style={{ marginRight: 10 }}>
          {loading ? "Please wait..." : "Register"}
        </button>
        <button onClick={login} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </div>
    </div>
  );
}

// -------------------------
// App Root
// -------------------------
function App() {
  // get user from login flow, or decode token, etc.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: payload.user_id ?? payload.id ?? payload.sub });
      } catch (e) { /* ignore */ }
    }
  }, []);

  return (
    <BrowserRouter>
      {/* pass user_id into Dashboard */}
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard user_id={user?.id} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

