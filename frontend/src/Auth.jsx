import React, { useState } from "react";

export default function Auth({ onLogin = async () => {}, onRegister = async () => {}, loading = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    await onLogin(email, password);
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    await onRegister(email, password);
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 640, margin: "0 auto" }}>
      <h1>User Authentication</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <button onClick={handleRegister} disabled={loading} style={{ marginRight: 8 }}>
            Register
          </button>
          <button type="submit" disabled={loading}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
