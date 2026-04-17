"use client";
import { useState, useEffect } from "react";
import { useTrip } from "../../../hooks/useTrip";
import { deleteExpense, updateExpense } from "../../../api";
import { saveRecentTrip, formatCurrency, formatDate } from "../../../utils";
import { ShareButton, Avatar, AddExpenseModal } from "@/components";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";

export default function TripPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { trip, expenses = [], balance, loading, error, refetch } = useTrip(id);
  const [tab, setTab] = useState("expenses");
  const [editingExp, setEditingExp] = useState(null);
  const [modal, setModal] = useState(false);

  // Save trip ID so user can return from home
  useEffect(() => {
    if (id) saveRecentTrip(id);
  }, [id]);

  if (loading) return <div className={styles.centered}>Loading trip...</div>;
  if (error)
    return (
      <div className={styles.centered}>
        <p style={{ color: "#A32D2D" }}>{error}</p>
        <button className={styles.link} onClick={() => router.push("/")}>
          ← Home
        </button>
      </div>
    );
  if (!trip) return null;

  const members = trip.members;

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(expId);
      refetch();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ← trips
        </button>

        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{trip.name}</h1>
            <ShareButton tripId={id} />
          </div>
          <p className={styles.meta}>
            {members.length} members · {expenses.length} expenses ·{" "}
            {formatCurrency(balance?.totalSpend || 0)} total
          </p>
        </div>

        <button
          className={styles.addBtn}
          onClick={() => setModal(true)}
          title="Add expense"
        >
          + Add expense
        </button>
      </div>

      {/* chips */}
      <div className={styles.chipRow}>
        {members.map((m, i) => (
          <div key={m._id} className={styles.chip}>
            <Avatar name={m.name} index={i} size={20} />
            <span className={styles.chipText}>{m.name}</span>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className={styles.tabs}>
        {[
          { key: "expenses", label: "Expenses" },
          { key: "balances", label: "Balances" },
          { key: "settle", label: "Settle up" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {/* expenses */}
        {tab === "expenses" &&
          (expenses.length === 0 ? (
            <div className={styles.empty}>
              No expenses yet.
              <br />
              Tap "Add expense".
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp._id}
                className={styles.expenseRow}
                onClick={() => setEditingExp(exp)}
                title="Edit expense"
              >
                <div className={styles.expenseLeft}>
                  <Avatar
                    name={exp.paidBy}
                    index={members.findIndex((m) => m.name === exp.paidBy)}
                    size={30}
                  />

                  <div className={styles.expenseInfo}>
                    <div className={styles.expDesc}>
                      {exp.description || "Expense"}
                    </div>

                    <div className={styles.expMeta}>
                      <span className={styles.pill}>{exp.paidBy}</span>
                      <span>
                        ÷ {exp.participants.length} · {formatDate(exp.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.expenseRight}>
                  <span className={styles.amount}>
                    {formatCurrency(exp.amount)}
                  </span>
                  {/*delete expense */}
                  <button
                    className={styles.delBtn}
                    onClick={() => handleDeleteExpense(exp._id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ))}

        {/* balances */}
        {tab === "balances" &&
          balance?.balances.map((b, i) => (
            <div key={b.name} className={styles.balanceRow}>
              <div className={styles.balanceLeft}>
                <Avatar name={b.name} index={i} size={32} />
                <div>
                  <div className={styles.balanceName}>{b.name}</div>
                  <div className={styles.balanceMeta}>
                    paid {formatCurrency(b.paid)} · owes/total spent{" "}
                    {formatCurrency(b.owed)}
                  </div>
                </div>
              </div>

              <span
                className={`${styles.net} ${
                  b.net > 0.01
                    ? styles.positive
                    : b.net < -0.01
                      ? styles.negative
                      : styles.neutral
                }`}
              >
                {b.net > 0.01 ? "+" : ""}
                {formatCurrency(b.net)}
              </span>
            </div>
          ))}

        {/* settle */}
        {tab === "settle" &&
          (balance?.settlements.length === 0 ? (
            <div className={styles.even}>Everyone's even!</div>
          ) : (
            balance?.settlements.map((t, i) => (
              <div key={i} className={styles.settleRow}>
                <Avatar
                  name={t.from}
                  size={28}
                  index={members.findIndex((m) => m.name === t.from)}
                />
                <span className={styles.personText}>{t.from}</span>

                <span className={styles.arrow}>→</span>

                <Avatar
                  name={t.to}
                  size={28}
                  index={members.findIndex((m) => m.name === t.to)}
                />
                <span className={styles.personText}>{t.to}</span>

                <span className={styles.settleAmt}>
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))
          ))}
      </div>

      <div className={styles.shareBox}>
        <span className={styles.shareText}>Share trip ID with your group:</span>
        <code className={styles.codeBox}>{id}</code>
      </div>
      {modal && (
        <AddExpenseModal
          trip={trip}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            refetch();
          }}
          initialValues={null}
        />
      )}

      {editingExp && (
        <AddExpenseModal
          trip={trip}
          onClose={() => setEditingExp(null)}
          onSaved={() => {
            setEditingExp(null);
            refetch();
          }}
          editingExp={editingExp}
          initialValues={editingExp}
        />
      )}
    </div>
  );
}

function netStyle(net) {
  const base = { fontFamily: "monospace", fontWeight: 600, fontSize: 14 };
  if (net > 0.01) return { ...base, color: "#0F6E56" };
  if (net < -0.01) return { ...base, color: "#A32D2D" };
  return { ...base, color: "#888" };
}
