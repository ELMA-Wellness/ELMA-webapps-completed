import React, { useEffect, useMemo, useState } from "react";
import "../styles/analytics.css";
import { getUserAnalytics, filterRows } from "../services/user-analytics";
import LoaderModal from "../components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

/* ── Small presentational helpers ───────────────────────────── */

function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value ?? "—"}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

function MiniTable({ headers, rows, empty = "No data yet." }) {
  return (
    <div className="table-container" style={{ marginTop: 10 }}>
      <table className="analytics-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((cells, i) => (
              <tr key={i}>
                {cells.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function UserAnalyticsTable() {
  const location = useLocation();
  const filter = location?.state?.filter || "Total Users";

  const [rows, setRows] = useState([]);
  const [segments, setSegments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const limit = 20;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getUserAnalytics();
        setRows(res.rows);
        setSegments(res.segments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // client-side filter + pagination
  const filtered = useMemo(() => filterRows(rows, filter), [rows, filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRows = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => setPage(1), [filter]);

  if (loading) return <LoaderModal visible={loading} />;

  const s = segments;
  const consistencyRows = (dist) =>
    [1, 2, 3, 4, 5, 6, 7].map((d) => [`${d} / 7 days`, dist?.[d] ?? 0]);

  return (
    <div className="analytics-wrapper" style={{ padding: "24px 20px" }}>
      <h2 style={{ textAlign: "center", color: "#3A116D" }}>
        User Analytics &amp; Cohorts
      </h2>

      {error ? <div className="note">⚠️ {error}</div> : null}

      {s ? (
        <>
          {/* ── Onboarding funnel ─────────────────────────── */}
          <div className="section-title">🎮 Onboarding Funnel</div>
          <div className="cards-grid">
            <StatCard label="Total Users" value={s.totalUsers} />
            <StatCard
              label="Completed Onboarding"
              value={s.onboarding.completed}
            />
            <StatCard label="Finished Game 1" value={s.onboarding.game1} />
            <StatCard label="Finished Game 2" value={s.onboarding.game2} />
            <StatCard label="Finished Game 3" value={s.onboarding.game3} />
            <StatCard
              label="Till Game 4"
              value={s.onboarding.till_game4}
              hint="finished game 4"
            />
            <StatCard
              label="Till Game 5"
              value={s.onboarding.till_game5}
              hint="finished game 5"
            />
            <StatCard
              label="Till Game 6"
              value={s.onboarding.till_game6}
              hint="finished game 6"
            />
          </div>

          {/* ── Signup methods ────────────────────────────── */}
          {/* <div className="section-title">🔐 Signup Methods</div>
          <div className="cards-grid">
            <StatCard label="Phone" value={s.signup.Phone} />
            <StatCard label="Email" value={s.signup.Email} />
            <StatCard label="Google" value={s.signup.Google} />
            <StatCard label="Apple" value={s.signup.Apple} />
            <StatCard label="Unknown" value={s.signup.Unknown} />
          </div> */}
         

          {/* ── Games (replayable) ────────────────────────── */}
          <div className="section-title">🕹️ Games — Cumulative Plays</div>
          <MiniTable
            headers={["Game", "Users Played", "Total Plays", "Avg / Player"]}
            rows={s.games.map((g) => [
              g.label,
              g.players,
              g.totalPlays,
              g.avgPerPlayer,
            ])}
          />

          {/* ── Mood cohorts ──────────────────────────────── */}
          <div className="section-title">😊 Mood Tagging</div>
          <div className="cards-grid">
            <StatCard label="Users Tagging Mood" value={s.mood.taggers} />
            <StatCard
              label="Daily (7/7 days)"
              value={s.mood.daily}
              hint="last 7 days"
            />
            <StatCard label="More Than Once / Day" value={s.mood.multiPerDay} />
            <StatCard label="Total Mood Logs" value={s.mood.totalLogs} />
          </div>
          <MiniTable
            headers={["Weekly Consistency (Mood)", "# Users"]}
            rows={consistencyRows(s.consistency.mood)}
          />

          {/* ── Energy cohorts ────────────────────────────── */}
          <div className="section-title">⚡ Energy Levels</div>
          <div className="cards-grid">
            <StatCard label="Users Logging Energy" value={s.energy.taggers} />
            <StatCard
              label="Daily (7/7 days)"
              value={s.energy.daily}
              hint="last 7 days"
            />
            <StatCard
              label="More Than Once / Day"
              value={s.energy.multiPerDay}
            />
            <StatCard label="Total Energy Logs" value={s.energy.totalLogs} />
          </div>
          <MiniTable
            headers={["Weekly Consistency (Energy)", "# Users"]}
            rows={consistencyRows(s.consistency.energy)}
          />

          {/* ── Journal ───────────────────────────────────── */}
          <div className="section-title">📓 Gratitude Journal</div>
          <div className="cards-grid">
            <StatCard label="Users Writing" value={s.journal.writers} />
            <StatCard label="Total Entries" value={s.journal.totalEntries} />
            <StatCard label="Morning" value={s.journal.timeOfDay.morning} />
            <StatCard label="Afternoon" value={s.journal.timeOfDay.afternoon} />
            <StatCard label="Evening" value={s.journal.timeOfDay.evening} />
            <StatCard label="Night" value={s.journal.timeOfDay.night} />
          </div>

          {/* ── AI usage ──────────────────────────────────── */}
          <div className="section-title">🤖 AI — Chat vs Handsfree</div>
          <div className="cards-grid">
            <StatCard label="Chat Users (text)" value={s.ai.chatUsers} />
            <StatCard label="Handsfree Users (voice)" value={s.ai.voiceUsers} />
            <StatCard label="Chat Only" value={s.ai.chatOnly} />
            <StatCard label="Handsfree Only" value={s.ai.voiceOnly} />
            <StatCard label="Both" value={s.ai.both} />
            <StatCard label="Total Chat Msgs" value={s.ai.totalChatMsgs} />
            <StatCard label="Total Voice Msgs" value={s.ai.totalVoiceMsgs} />
            <StatCard
              label="Avg Handsfree / Session"
              value={`${s.ai.avgVoiceMinutesPerSession} min`}
            />
            <StatCard
              label="Avg Handsfree / User"
              value={`${s.ai.avgVoiceMinutesPerUser} min`}
            />
            <StatCard
              label="Avg Sessions / Voice User"
              value={s.ai.avgVoiceSessionsPerUser}
            />
          </div>
          <div className="note">
            Handsfree duration is estimated from the first→last voice message
            timestamp per session. For exact talk-time, have the app store a{" "}
            <code>durationSec</code> on each voice conversation.
          </div>

          {/* ── Experts / Psychologists ───────────────────── */}
          <div className="section-title">🧑‍⚕️ Experts &amp; Psychologists</div>
          <div className="cards-grid">
            <StatCard
              label="Total Profile Views"
              value={s.therapist.totalProfileViews}
            />
            <StatCard
              label="Users Who Viewed"
              value={s.therapist.usersViewedProfiles}
            />
          </div>
         
        </>
      ) : null}

      {/* ── Per-user table ────────────────────────────────── */}
      <div className="section-title">
        👤 Per-User Detail{" "}
        <span style={{ fontWeight: 400, fontSize: 14, color: "#666" }}>
          ({filter} — {filtered.length} users)
        </span>
      </div>

      <div className="table-container">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Signup</th>
              <th>App Opens</th>
              <th>Onboarded</th>
              <th>Onboard Games</th>
              <th>Assess. S/C</th>
              <th>Mood (logs / days)</th>
              <th>Mood ×/day</th>
              <th>Energy (logs / days)</th>
              <th>Energy ×/day</th>
              <th>Journal (entries / days)</th>
              <th>Calm 60</th>
              <th>Insight</th>
              <th>Strength</th>
              <th>AI Type</th>
              <th>Chat Msgs</th>
              <th>Handsfree Msgs</th>
              <th>Handsfree Min</th>
              <th>Therapist Views</th>
              <th>Bookings (init/comp/sess)</th>
              <th>Profile %</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => (
              <tr key={u.userId}>
                <td className="event">{u.name}</td>
                <td>{u.signup_method}</td>
                <td>{u.app_open}</td>
                <td>{u.onboarding_completed}</td>
                <td>{u.onboarding_games_completed} / 6</td>
                <td>
                  {u.assessment_started} / {u.assessment_completed}
                </td>
                <td>
                  {u.mood_logged} / {u.mood_days}
                </td>
                <td>{u.mood_multi_per_day}</td>
                <td>
                  {u.energy_logged} / {u.energy_days}
                </td>
                <td>{u.energy_multi_per_day}</td>
                <td>
                  {u.journal_entries} / {u.journal_days}
                </td>
                <td className="count">{u.calm_in_60}</td>
                <td className="count">{u.insight_sicker}</td>
                <td className="count">{u.strength_builder}</td>
                <td>{u.ai_usage_type}</td>
                <td>{u.ai_chat_msgs}</td>
                <td>{u.handsfree_msgs}</td>
                <td>{u.handsfree_minutes}</td>
                <td>{u.therapist_profile_viewed}</td>
                <td>
                  {u.booking_initiated}/{u.booking_completed}/
                  {u.session_completed}
                </td>
                <td className="count">{u.profile_percent}%</td>
              </tr>
            ))}
            {!pageRows.length ? (
              <tr>
                <td colSpan={21}>No users match this filter.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="pagination-btn"
        >
          <ChevronLeft />
        </button>
        <span className="page-info">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="pagination-btn"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
