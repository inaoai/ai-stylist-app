// ProfileForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * base64url JWT decode helper. Returns payload object or null.
 */
function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function ProfileForm({ user_id: prop_user_id  }) {
  // token and token-derived id (fallback)
  const token = localStorage.getItem("token") || "";
  const tokenPayload = token ? decodeJwt(token) : null;
  const userIdFromToken = tokenPayload?.user_id ?? null;

  // prefer explicit prop, else token-derived id
  // ensure we don't pass "null"/"undefined" strings — coerce string numeric IDs to Number
  const normalizeId = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const s = val.trim();
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  
  const user_id = normalizeId(prop_user_id ?? userIdFromToken);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    preferences: {}
  });

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!user_id) return;
    (async () => {
      try {
        console.log("[ProfileForm] loading profile for user:", user_id);
        const resp = await axios.get(`http://localhost:8000/api/profile/${user_id}`, {
          headers: authHeader
        });
        const data = resp.data || {};
        setForm({
          name: data.name || "",
          age: data.age ?? "",
          gender: data.gender || "",
          preferences: data.preferences || {}
        });
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          console.error("Failed to load profile", err);
        } else {
          console.log("No existing profile (404) or not found");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);
  
  
  // inside ProfileForm.jsx


  const saveProfile = async () => {
    console.log("saveProfile clicked. user_id:", user_id, "form:", form);

    if (!user_id) {
      return alert(
        "Missing user id. Make sure a user id is provided (prop or token). You cannot save until an id is available."
      );
    }

    // normalize age -> number
    const ageNumber = form.age === "" || form.age === null ? null : Number(form.age);
    if (ageNumber === null || Number.isNaN(ageNumber) || !Number.isFinite(ageNumber)) {
      return alert("Please enter a valid numeric age.");
    }

    const payload = {
      name: (form.name || "").trim(),
      age: ageNumber,
      gender: form.gender || "",
      preferences: form.preferences || {}
    };

    console.log("Posting to:", `http://localhost:8000/api/profile/${user_id}`, "payload:", payload);

    try {
      const resp = await axios.post(`http://localhost:8000/api/profile/${user_id}`, payload, {
        headers: {
          ...authHeader,
          "Content-Type": "application/json"
        },
        timeout: 10000
      });
      console.log("POST response:", resp.status, resp.data);
      if (resp.data) {
        setForm({
          name: resp.data.name || "",
          age: resp.data.age ?? "",
          gender: resp.data.gender || "",
          preferences: resp.data.preferences || {}
        });
      }
      alert("Profile saved!");
    } catch (err) {
      console.error("saveProfile error:", err);
      if (err.response) {
        const detail = err.response.data?.detail ?? err.response.data;
        alert("Profile save error: " + JSON.stringify(detail));
      } else if (err.request) {
        alert("No response from server. Check backend or CORS. See console Network tab.");
      } else {
        alert("Profile save error: " + err.message);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          style={{ width: 80, marginRight: 8 }}
        />
        <input
          placeholder="Gender"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <button onClick={saveProfile} disabled={!user_id}>
          Save Profile
        </button>
      </div>

      {!user_id && (
        <div style={{ color: "red", marginTop: 6 }}>
          No user id available. Make sure the parent passes <code>user_id</code> prop or you are logged
          in (token must contain an id).
        </div>
      )}
    </div>
  );
}

export default ProfileForm;
