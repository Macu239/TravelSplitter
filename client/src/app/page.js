"use client";
import { useState } from "react";
import { createTrip } from "../api";
import { saveRecentTrip, getRecentTrip } from "../utils";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const recentTripId = getRecentTrip();

  const [tripName, setTripName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);
  const [joinId, setJoinId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("create"); // 'create' | 'join'

  function addMember() {
    const name = memberInput.trim();
    if (!name) return;
    if (members.includes(name)) {
      setMemberInput("");
      return;
    }
    setMembers((prev) => [...prev, name]);
    setMemberInput("");
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    if (!tripName.trim()) return setError("Enter a trip name");
    if (members.length < 1) return setError("Add at least one member");

    setCreating(true);
    try {
      const trip = await createTrip(tripName.trim(), members);
      saveRecentTrip(trip._id);
      router.push(`/tripPage/${trip._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function handleJoin(e) {
    e.preventDefault();
    const id = joinId.trim();
    if (!id) return setError("Enter a trip ID");
    router.push(`/tripPage/${id}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.icon}>✈️</div>
        <h1 className={styles.title}>SplitTrip</h1>
        <p className={styles.sub}>
          Log expenses in seconds. Settle up at the end.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          {["create", "join"].map((t) => (
            <button
              key={t}
              className={
                styles.tabBtn + (tab === t ? " " + styles.tabActive : "")
              }
              onClick={() => {
                setTab(t);
                setError(null);
              }}
            >
              {t === "create" ? "Create trip" : "Join by ID"}
            </button>
          ))}
        </div>

        {tab === "create" && (
          <form onSubmit={handleCreate}>
            <div className={styles.field}>
              <label className={styles.label}>Trip name</label>
              <input
                className={styles.input}
                placeholder="e.g. Vegas 2024 🎲"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Add members</label>
              <div className={styles.memberInput}>
                <input
                  className={styles.input}
                  placeholder="Name"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addMember())
                  }
                />
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={addMember}
                >
                  Add
                </button>
              </div>
            </div>

            {members.length > 0 && (
              <div className={styles.memberList}>
                {members.map((m, i) => (
                  <div key={i} className={styles.chip}>
                    <span className={styles.avatar} style={avatar(i)}>
                      {m[0]?.toUpperCase()}
                    </span>
                    {m}
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() =>
                        setMembers((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className={styles.errorStyle}>{error}</p>}

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={creating}
            >
              {creating ? "Creating..." : "Start trip →"}
            </button>
          </form>
        )}

        {tab === "join" && (
          <form onSubmit={handleJoin}>
            <div className={styles.field}>
              <label className={styles.label}>Trip ID</label>
              <input
                className={styles.input}
                placeholder="Paste trip ID here..."
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
              />
            </div>
            {error && <p className={styles.errorStyle}>{error}</p>}
            <button type="submit" className={styles.btnPrimary}>
              Open trip →
            </button>
          </form>
        )}
      </div>

      {recentTripId && (
        <div className={styles.recentBox}>
          <span className={styles.sub}>Continue where you left off</span>
          <button
            className={styles.btnOutline}
            onClick={() => router.push(`/tripPage/${recentTripId}`)}
          >
            Open recent trip
          </button>
        </div>
      )}
    </div>
  );
}

const COLORS = ["#EEEDFE", "#E1F5EE", "#FAECE7", "#EAF3DE", "#FAEEDA"];
const TEXT = ["#3C3489", "#085041", "#712B13", "#27500A", "#633806"];

const avatar = (i) => ({
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: COLORS[i % 5],
  color: TEXT[i % 5],
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 700,
  flexShrink: 0,
});

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h2>Page not found</h2>
      <a href="/" className={styles.link}>
        ← Go home
      </a>
    </div>
  );
}
