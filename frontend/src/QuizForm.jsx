// frontend/src/QuizForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function QuizForm({ userId: propUserId }) {
  const [answers, setAnswers] = useState({ color: "Blue", fit: "regular" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(propUserId || null);

  const readToken = () =>
    localStorage.getItem("access_token") || localStorage.getItem("token") || "";

  const readUserIdFromStorage = () =>
    localStorage.getItem("user_id") || localStorage.getItem("userId") || null;

  const decodeUserIdFromJwt = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return payload?.user_id ?? payload?.sub ?? null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    // determine user id (prop -> storage -> token decode)
    let uid = propUserId ?? readUserIdFromStorage();
    if (!uid) {
      uid = decodeUserIdFromJwt(readToken());
    }
    setUserId(uid ? Number(uid) : null);

    // ensure axios has auth header if token exists
    const token = readToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    console.log(
      "[QuizForm] init:",
      "propUserId=",
      propUserId,
      "stored=",
      readUserIdFromStorage(),
      "decoded=",
      decodeUserIdFromJwt(readToken())
    );
  }, [propUserId]);

  const submitQuiz = async (e) => {
    e?.preventDefault?.();
    const uid = userId || readUserIdFromStorage() || decodeUserIdFromJwt(readToken());
    const token = readToken();

    console.log("[QuizForm] submit: uid=", uid, "tokenPresent=", !!token, "answers=", answers);

    if (!uid) {
      alert("No user id found. Please log in first.");
      return;
    }
    if (!token) {
      alert("No auth token found. Please log in first.");
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:8000/api/quiz/${uid}`;   // <--- updated path with /api prefix
      const payload = { answers };
      console.log("[QuizForm] POST", url, payload);

      const resp = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("[QuizForm] resp:", resp.status, resp.data);
      alert("Quiz submitted: " + JSON.stringify(resp.data));
    } catch (err) {
      console.error("[QuizForm] submit error:", err);
      const msg = err?.response?.data?.detail ?? err?.response?.data ?? err.message;
      alert("Failed to submit quiz: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitQuiz}>
      <h3>Style Quiz</h3>

      <div style={{ marginBottom: 8 }}>
        <label>
          Favorite Color:
          <select
            value={answers.color}
            onChange={(e) => setAnswers({ ...answers, color: e.target.value })}
            style={{ marginLeft: 8 }}
          >
            <option>Blue</option>
            <option>Red</option>
            <option>Green</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          Preferred Fit:
          <select
            value={answers.fit}
            onChange={(e) => setAnswers({ ...answers, fit: e.target.value })}
            style={{ marginLeft: 8 }}
          >
            <option value="regular">Regular</option>
            <option value="slim">Slim</option>
            <option value="loose">Loose</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default QuizForm;
