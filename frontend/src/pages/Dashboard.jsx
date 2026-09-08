import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  ListChecks,
  LogOut,
  RefreshCw,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.auth
  );

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response =
          await axiosClient.get(
            '/problem/dashboardStats'
          );

        setDashboardData(response.data);
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
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((err) => {
        console.error(
          'Logout failed:',
          err
        );

        navigate('/login');
      });
  };

  const totalProblems =
    dashboardData?.totalProblems || 0;

  const totalSolved =
    dashboardData?.totalSolved || 0;

  const totalUnsolved =
    dashboardData?.totalUnsolved || 0;

  const completionPercentage =
    dashboardData?.completionPercentage || 0;

  const difficultyStats =
    dashboardData?.difficulty || {
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

  const recentProblems =
    dashboardData?.recentSolvedProblems || [];

  const difficultyItems = [
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
  ];

  const getDifficultyPercentage = (
    solved,
    total
  ) => {
    if (!total) {
      return 0;
    }

    return Math.round(
      (solved / total) * 100
    );
  };

  const getDifficultyBadge = (difficulty) => {
    if (difficulty === 'easy') {
      return 'badge-success';
    }

    if (difficulty === 'medium') {
      return 'badge-warning';
    }

    return 'badge-error';
  };

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
          <div className="alert alert-error shadow flex items-center justify-between gap-4">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                fetchDashboardData(true)
              }
              disabled={refreshing}
              className="btn btn-sm"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />

              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

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

        <div className="flex-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                fetchDashboardData(true)
              }
              disabled={refreshing}
              className="btn btn-ghost btn-circle"
              title="Refresh dashboard"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost"
              >
                {user?.firstName}
              </div>

              <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <NavLink to="/dashboard">
                    <Target size={16} />
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/">
                    <Code2 size={16} />
                    Problems
                  </NavLink>
                </li>

                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin">
                      <ListChecks size={16} />
                      Admin
                    </NavLink>
                  </li>
                )}

                <div className="divider my-1" />

                <li>
                  <NavLink to="/dashboard">
                    <User size={16} />
                    Profile
                  </NavLink>
                </li>

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
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wide">
                Dashboard
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                Welcome back,{' '}
                {user?.firstName} 👋
              </h1>

              <p className="text-base-content/60 mt-2">
                Track your coding progress and keep
                practicing.
              </p>
            </div>

            <NavLink
              to="/"
              className="btn btn-primary"
            >
              Solve Problems
              <ArrowRight size={16} />
            </NavLink>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
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

              <p className="text-xs text-base-content/50 mt-3">
                Available problems
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
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

              <p className="text-xs text-base-content/50 mt-3">
                Successfully completed
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
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

              <p className="text-xs text-base-content/50 mt-3">
                Problems left to solve
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
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

              <progress
                className="progress progress-info w-full mt-3"
                value={completionPercentage}
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
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

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    Your progress
                  </span>

                  <span className="font-semibold text-primary">
                    {completionPercentage}%
                  </span>
                </div>

                <progress
                  className="progress progress-primary w-full"
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

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-base-200 p-3 text-center">
                  <p className="text-lg font-bold">
                    {totalSolved}
                  </p>

                  <p className="text-xs text-base-content/60">
                    Solved
                  </p>
                </div>

                <div className="rounded-xl bg-base-200 p-3 text-center">
                  <p className="text-lg font-bold">
                    {totalUnsolved}
                  </p>

                  <p className="text-xs text-base-content/60">
                    Remaining
                  </p>
                </div>

                <div className="rounded-xl bg-base-200 p-3 text-center">
                  <p className="text-lg font-bold">
                    {completionPercentage}%
                  </p>

                  <p className="text-xs text-base-content/60">
                    Complete
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="card-title">
                    Difficulty Breakdown
                  </h2>

                  <p className="text-sm text-base-content/60 mt-1">
                    Your progress across different difficulty
                    levels.
                  </p>
                </div>

                <TrendingUp className="text-primary" />
              </div>

              <div className="space-y-5 mt-5">
                {difficultyItems.map((item) => {
                  const stat =
                    difficultyStats[item.key];

                  const percentage =
                    getDifficultyPercentage(
                      stat.solved,
                      stat.total
                    );

                  return (
                    <div
                      key={item.key}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`badge ${item.badge} min-w-20`}
                          >
                            {item.label}
                          </span>

                          <span className="text-sm text-base-content/60">
                            {stat.solved} solved
                          </span>
                        </div>

                        <span className="text-sm font-medium">
                          {stat.solved}/{stat.total}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <progress
                          className="progress w-full"
                          value={stat.solved}
                          max={stat.total || 1}
                        />

                        <span className="text-xs text-base-content/50 w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <section className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="card-title">
                  Solved Problems
                </h2>

                <p className="text-sm text-base-content/60">
                  Continue practicing problems you have solved.
                </p>
              </div>

              <NavLink
                to="/"
                className="btn btn-sm btn-outline"
              >
                View All ({totalSolved})
                <ArrowRight size={16} />
              </NavLink>
            </div>

            {recentProblems.length === 0 ? (
              <div className="text-center py-10">
                <Circle className="mx-auto mb-3 opacity-40" />

                <p className="text-base-content/60">
                  You haven't solved any problems yet.
                </p>

                <NavLink
                  to="/"
                  className="btn btn-primary btn-sm mt-4"
                >
                  Start Solving
                </NavLink>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {recentProblems.map((problem) => (
                      <tr
                        key={problem._id}
                        className="hover"
                      >
                        <td>
                          <div className="font-medium">
                            {problem.title}
                          </div>

                          {Array.isArray(
                            problem.tags
                          ) &&
                            problem.tags.length >
                              0 && (
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
                            className={`badge ${getDifficultyBadge(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-success gap-1">
                            <CheckCircle2 size={14} />
                            Solved
                          </span>
                        </td>

                        <td className="text-right">
                          <NavLink
                            to={`/problem/${problem._id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </NavLink>
                        </td>
                      </tr>
                    ))}
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