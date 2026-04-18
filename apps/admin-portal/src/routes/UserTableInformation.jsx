import React, { useEffect, useState } from "react";
import "../styles/analytics.css";
import { getAllUserAnalytics } from "../services/user-analytics";
import LoaderModal from "../components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function UserAnalyticsTable() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const filter = location?.state?.filter || "Total Users";

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 20;

  const onGoPrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const onGoNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const setUserAnalyticsByFetching = async () => {
    setLoading(true);

    try {
      const res = await getAllUserAnalytics(limit, page, filter);

      setData(res.data);
      setTotalPages(res.totalPages);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserAnalyticsByFetching();
  }, [page]);

  if (loading) {
    return <LoaderModal visible={loading} />;
  }

  return (
    <div className="analytics-wrapper">
      <h2 style={{textAlign:"center"}}>User Analytics</h2>

      <div className="table-container">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>User</th>
              <th>App Opens</th>
              <th>Onboarding Started</th>
              <th>Onboarding Completed</th>
              <th>Assessment Started</th>
              <th>Assessment Completed</th>
              <th>Mood Logs</th>
              <th>AI Chat Opened</th>
              <th>AI Messages</th>
              <th>Therapist Views</th>
              <th>Booking Initiated</th>
              <th>Booking Completed</th>
              <th>Session Completed</th>
              <th>Profile %</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((user, index) => (
              <tr key={index}>
                <td className="user">{user.name}</td>
                <td>{user.app_open}</td>
                <td>{user.onboarding_started}</td>
                <td>{user.onboarding_completed}</td>
                <td>{user.assessment_started}</td>
                <td>{user.assessment_completed}</td>
                <td>{user.mood_logged}</td>
                <td>{user.ai_chat_opened}</td>
                <td className="highlight">{user.ai_message_sent}</td>
                <td>{user.therapist_profile_viewed}</td>
                <td>{user.booking_initiated}</td>
                <td>{user.booking_completed}</td>
                <td>{user.session_completed}</td>
                <td>{user?.profile_percent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          onClick={onGoPrevPage}
          disabled={page === 1}
          className="pagination-btn"
        >
          <ChevronLeft />
        </button>

        <span className="page-info">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={onGoNextPage}
          disabled={page === totalPages}
          className="pagination-btn"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}