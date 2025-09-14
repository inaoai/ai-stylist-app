// App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import Auth from "./Auth.jsx"; // optional if you have an Auth component

// ensure axios will use token from localStorage on initial load
const initAxiosAuth = () => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initAxiosAuth();

    // prefer canonical stored user_id, fallback to other keys or decode token
    const storedId = localStorage.getItem("user_id") || localStorage.getItem("userId") || localStorage.getItem("userID");
    if (storedId) {
      setUser({ user_id: Number(storedId) });
      return;
    }

    // try decode token if present (token may be plain or JWT)
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const uid = payload?.user_id ?? payload?.sub ?? null;
          if (uid !== null && uid !== undefined) {
            setUser({ user_id: Number(uid) });
            return;
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }
    setUser(null);
  }, []);

  // Registration helper (example)
  const register = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/register", { email, password });
      const token = res?.data?.access_token ?? res?.data?.token;
      const userId = res?.data?.user_id ?? res?.data?.userId ?? null;
      if (token) {
        // store canonical + compatibility keys
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      if (userId !== null && userId !== undefined) {
        localStorage.setItem("user_id", String(userId));
        localStorage.setItem("userId", String(userId));
        setUser({ user_id: Number(userId) });
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed: " + (err.response?.data?.detail ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  // Login helper
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/login", { email, password });
      // backend usually returns { access_token, token_type, user_id }
      const token = res?.data?.access_token ?? res?.data?.token ?? null;
      const userId = res?.data?.user_id ?? res?.data?.userId ?? null;

      if (!token) {
        console.error("Login response missing token:", res?.data);
        alert("Login succeeded but server did not return a token.");
        return;
      }

      // store both canonical and compatibility keys
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (userId !== null && userId !== undefined) {
        localStorage.setItem("user_id", String(userId));
        localStorage.setItem("userId", String(userId));
        setUser({ user_id: Number(userId) });
      } else {
        // try token decode to get id
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const uid = payload?.user_id ?? payload?.sub ?? null;
            if (uid !== null && uid !== undefined) {
              localStorage.setItem("user_id", String(uid));
              localStorage.setItem("userId", String(uid));
              setUser({ user_id: Number(uid) });
            }
          }
        } catch (e) {
          // ignore
        }
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + (err.response?.data?.detail ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard user_id={user?.user_id} />} />
      <Route path="/auth" element={<Auth onLogin={login} onRegister={register} loading={loading} />} />
      {/* Optionally route root to Auth */}
      <Route path="*" element={<Auth onLogin={login} onRegister={register} loading={loading} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
