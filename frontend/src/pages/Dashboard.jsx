import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle2,
  Circle,
  Code2,
  ListChecks,
  LogOut,
  Target,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  User,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';
// NOTE: adjust this import path / action name if your logout
// thunk lives somewhere else or is named differently in your
// authSlice. This assumes a standard Redux Toolkit async thunk
// called `logoutUser` that hits your logout API endpoint.
import { logoutUser } from '../authSlice';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================================
  // LOGOUT (new)
  // ============================================================

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((err) => {
        console.error('Logout failed:', err);
        // Even if the API call fails, send the user to login so
        // they aren't stuck on a stale "authenticated" screen.
        navigate('/login');
      });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [problemsResponse, solvedResponse] =
        await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser'),
        ]);

      setProblems(
        Array.isArray(problemsResponse.data)
          ? problemsResponse.data
          : []
      );

      setSolvedProblems(
        Array.isArray(solvedResponse.data)
          ? solvedResponse.data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load dashboard:',
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const solvedProblemIds = useMemo(
    () =>
      new Set(
        solvedProblems.map(
          (problem) => problem._id
        )
      ),
    [solvedProblems]
  );

  const totalProblems = problems.length;
  const totalSolved = solvedProblems.length;

  const totalUnsolved = Math.max(
    totalProblems - totalSolved,
    0
  );

  const completionPercentage =
    totalProblems > 0
      ? Math.round(
          (totalSolved / totalProblems) * 100
        )
      : 0;

  const difficultyStats = useMemo(() => {
    const stats = {
      easy: {
        total: 0,
        solved: 0,
      },
      medium: {
        total: 0,
        solved: 0,
      },
      hard: {
        total: 0,
        solved: 0,
      },
    };

    problems.forEach((problem) => {
      const difficulty =
        problem.difficulty?.toLowerCase();

      if (!stats[difficulty]) {
        return;
      }

      stats[difficulty].total += 1;

      if (solvedProblemIds.has(problem._id)) {
        stats[difficulty].solved += 1;
      }
    });

    return stats;
  }, [problems, solvedProblemIds]);

  const recentProblems = useMemo(() => {
    return [...problems].slice(0, 6);
  }, [problems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg" />

          <p className="text-base-content/60">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <nav className="navbar bg-base-100 shadow-lg px-4">
          <div className="flex-1">
            <NavLink
              to="/"
              className="btn btn-ghost text-xl"
            >
              CodeNova
            </NavLink>
          </div>
        </nav>

        <main className="container mx-auto max-w-5xl p-4 pt-10">
          <div className="alert alert-error shadow">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="btn btn-sm"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl"
          >
            CodeNova
          </NavLink>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost"
            >
              {user?.firstName}
            </div>

            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              {/* Dashboard */}
              <li>
                <NavLink to="/dashboard">
                  Dashboard
                </NavLink>
              </li>

              {/* Problems */}
              <li>
                <NavLink to="/">
                  Problems
                </NavLink>
              </li>

              {/* Admin */}
              {user?.role === 'admin' && (
                <li>
                  <NavLink to="/admin">
                    Admin
                  </NavLink>
                </li>
              )}

              <div className="divider my-1" />

              {/* Profile (new) — this Dashboard page IS the
                  user's profile view, so it links back here */}
              <li>
                <NavLink to="/dashboard">
                  <User size={16} />
                  Profile
                </NavLink>
              </li>

              {/* Logout (new) */}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-error"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-primary font-semibold uppercase tracking-wide">
            Dashboard
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Welcome back, {user?.firstName} 👋
          </h1>

          <p className="text-base-content/60 mt-2">
            Track your coding progress and keep
            practicing.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* Total Problems */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">
                    Total Problems
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {totalProblems}
                  </h2>
                </div>

                <div className="p-3 rounded-xl bg-primary/10">
                  <Code2 className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Problems Solved */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">
                    Problems Solved
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {totalSolved}
                  </h2>
                </div>

                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Remaining */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">
                    Remaining
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {totalUnsolved}
                  </h2>
                </div>

                <div className="p-3 rounded-xl bg-warning/10">
                  <Target className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Completion */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">
                    Completion
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {completionPercentage}%
                  </h2>
                </div>

                <div className="p-3 rounded-xl bg-info/10">
                  <TrendingUp className="text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress + Difficulty */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Overall Progress */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="card-title">
                    Overall Progress
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Keep solving to improve your completion
                    rate.
                  </p>
                </div>

                <ListChecks className="text-primary" />
              </div>

              <progress
                className="progress progress-primary w-full mt-4"
                value={completionPercentage}
                max="100"
              />

              <div className="flex justify-between text-sm mt-2 text-base-content/60">
                <span>
                  {totalSolved} solved
                </span>

                <span>
                  {totalProblems} total
                </span>
              </div>
            </div>
          </section>

          {/* Difficulty */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">
                Difficulty Breakdown
              </h2>

              <div className="space-y-4 mt-2">
                {[
                  {
                    key: 'easy',
                    label: 'Easy',
                    badge: 'badge-success',
                  },
                  {
                    key: 'medium',
                    label: 'Medium',
                    badge: 'badge-warning',
                  },
                  {
                    key: 'hard',
                    label: 'Hard',
                    badge: 'badge-error',
                  },
                ].map((item) => {
                  const stat =
                    difficultyStats[item.key];

                  return (
                    <div
                      key={item.key}
                      className="flex items-center gap-4"
                    >
                      <span
                        className={`badge ${item.badge} min-w-20`}
                      >
                        {item.label}
                      </span>

                      <div className="flex-1">
                        <progress
                          className="progress w-full"
                          value={stat.solved}
                          max={stat.total || 1}
                        />
                      </div>

                      <span className="text-sm font-medium">
                        {stat.solved}/{stat.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Recent Problems */}
        <section className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="card-title">
                  Practice Problems
                </h2>

                <p className="text-sm text-base-content/60">
                  Continue solving coding problems.
                </p>
              </div>

              <NavLink
                to="/"
                className="btn btn-sm btn-outline"
              >
                View All
                <ArrowRight size={16} />
              </NavLink>
            </div>

            {recentProblems.length === 0 ? (
              <div className="text-center py-10">
                <Circle className="mx-auto mb-3 opacity-40" />

                <p className="text-base-content/60">
                  No problems available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentProblems.map((problem) => {
                      const solved =
                        solvedProblemIds.has(
                          problem._id
                        );

                      return (
                        <tr key={problem._id}>
                          <td>
                            <div className="font-medium">
                              {problem.title}
                            </div>

                            {Array.isArray(problem.tags) &&
                              problem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {problem.tags
                                    .slice(0, 3)
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="badge badge-ghost badge-sm"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              )}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                problem.difficulty ===
                                'easy'
                                  ? 'badge-success'
                                  : problem.difficulty ===
                                      'medium'
                                    ? 'badge-warning'
                                    : 'badge-error'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          </td>

                          <td>
                            {solved ? (
                              <span className="badge badge-success gap-1">
                                <CheckCircle2
                                  size={14}
                                />
                                Solved
                              </span>
                            ) : (
                              <span className="badge badge-ghost gap-1">
                                <Circle size={14} />
                                Unsolved
                              </span>
                            )}
                          </td>

                          <td className="text-right">
                            <NavLink
                              to={`/problem/${problem._id}`}
                              className="btn btn-sm btn-primary"
                            >
                              Solve
                            </NavLink>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;