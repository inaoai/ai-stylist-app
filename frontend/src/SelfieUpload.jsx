// frontend/src/SelfieUpload.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function SelfieUpload({ userId: propUserId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(propUserId || null);

  const readToken = () =>
    localStorage.getItem("access_token") || localStorage.getItem("token") || "";

  const readUserIdFromStorage = () =>
    localStorage.getItem("user_id") || localStorage.getItem("userId") || null;

  useEffect(() => {
    let uid = propUserId ?? readUserIdFromStorage();
    setUserId(uid ? Number(uid) : null);

    const token = readToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [propUserId]);

  const handleUpload = async (e) => {
    e?.preventDefault?.();

    if (!file) {
      alert("Please choose a file first!");
      return;
    }
    if (!userId) {
      alert("No user id found. Please log in first.");
      return;
    }

    const token = readToken();
    if (!token) {
      alert("No auth token found. Please log in first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = `http://localhost:8000/api/selfie/${userId}`;
      console.log("[SelfieUpload] POST", url, file.name);

      const resp = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[SelfieUpload] resp:", resp.status, resp.data);
      alert("Selfie uploaded: " + JSON.stringify(resp.data));
    } catch (err) {
      console.error("[SelfieUpload] error:", err);
      const msg = err?.response?.data?.detail ?? err?.response?.data ?? err.message;
      alert("Failed to upload selfie: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <h3>Upload Your Selfie</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default SelfieUpload;
