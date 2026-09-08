import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Flame,
  RefreshCw,
  Settings,
  Target,
  Trophy,
  User,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';

function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosClient.get(
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
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const totalProblems =
    dashboardData?.totalProblems || 0;

  const totalSolved =
    dashboardData?.totalSolved || 0;

  const totalUnsolved =
    dashboardData?.totalUnsolved || 0;

  const completionPercentage =
    dashboardData?.completionPercentage || 0;

  const difficulty = useMemo(
    () =>
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
      },
    [dashboardData]
  );

  const recentSolvedProblems = useMemo(
    () =>
      Array.isArray(
        dashboardData?.recentSolvedProblems
      )
        ? dashboardData.recentSolvedProblems
        : [],
    [dashboardData]
  );

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />

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
        <nav className="navbar bg-base-100 border-b border-base-300 px-4">
          <div className="flex-1">
            <NavLink
              to="/"
              className="btn btn-ghost text-xl font-bold"
            >
              CodeNova
            </NavLink>
          </div>
        </nav>

        <main className="container mx-auto max-w-5xl px-4 py-10">
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
      <nav className="navbar sticky top-0 z-50 bg-base-100 border-b border-base-300 px-4">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl font-bold"
          >
            CodeNova
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/profile"
            className="btn btn-ghost btn-sm gap-2"
          >
            <User size={17} />
            <span className="hidden sm:inline">
              Profile
            </span>
          </NavLink>

          <NavLink
            to="/settings"
            className="btn btn-ghost btn-circle"
            aria-label="Settings"
          >
            <Settings size={18} />
          </NavLink>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    Dashboard
                  </p>

                  <h1 className="mt-1 text-3xl font-bold md:text-4xl">
                    Welcome back, {user.firstName} 👋
                  </h1>

                  <p className="mt-2 max-w-2xl text-base-content/60">
                    Your complete coding progress, lifetime
                    statistics, and solved-problem history.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <NavLink
                    to="/profile"
                    className="btn btn-outline gap-2"
                  >
                    <User size={17} />
                    Profile
                  </NavLink>

                  <NavLink
                    to="/"
                    className="btn btn-primary gap-2"
                  >
                    Practice Problems
                    <ArrowRight size={17} />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Problems"
            value={totalProblems}
            icon={<Code2 size={23} />}
            iconClass="bg-primary/10 text-primary"
          />

          <StatCard
            title="Problems Solved"
            value={totalSolved}
            icon={<CheckCircle2 size={23} />}
            iconClass="bg-success/10 text-success"
          />

          <StatCard
            title="Remaining"
            value={totalUnsolved}
            icon={<Target size={23} />}
            iconClass="bg-warning/10 text-warning"
          />

          <StatCard
            title="Completion"
            value={`${completionPercentage}%`}
            icon={<Trophy size={23} />}
            iconClass="bg-info/10 text-info"
          />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Trophy size={22} />
                </div>

                <div>
                  <h2 className="card-title">
                    Overall Progress
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Lifetime completion
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-7">
                <div
                  className="radial-progress text-primary"
                  style={{
                    '--value': completionPercentage,
                    '--size': '11rem',
                    '--thickness': '0.8rem',
                  }}
                  role="progressbar"
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {totalSolved}/{totalProblems}
                    </p>

                    <p className="text-xs text-base-content/60">
                      solved
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="font-semibold">
                  {completionPercentage}% complete
                </p>

                <p className="mt-1 text-sm text-base-content/60">
                  Keep solving to improve your progress.
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm lg:col-span-2">
            <div className="card-body">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="card-title">
                    Difficulty Breakdown
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Lifetime progress by difficulty
                  </p>
                </div>

                <Target
                  size={20}
                  className="text-primary"
                />
              </div>

              <div className="space-y-7">
                <DifficultyRow
                  label="Easy"
                  solved={difficulty.easy.solved}
                  total={difficulty.easy.total}
                  badgeClass="badge-success"
                  progressClass="progress-success"
                />

                <DifficultyRow
                  label="Medium"
                  solved={difficulty.medium.solved}
                  total={difficulty.medium.total}
                  badgeClass="badge-warning"
                  progressClass="progress-warning"
                />

                <DifficultyRow
                  label="Hard"
                  solved={difficulty.hard.solved}
                  total={difficulty.hard.total}
                  badgeClass="badge-error"
                  progressClass="progress-error"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-success/10 p-3 text-success">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">
                    Lifetime Solved
                  </p>

                  <p className="text-2xl font-bold">
                    {totalSolved}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-warning/10 p-3 text-warning">
                  <Flame size={21} />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">
                    Remaining
                  </p>

                  <p className="text-2xl font-bold">
                    {totalUnsolved}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-info/10 p-3 text-info">
                  <Code2 size={21} />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">
                    Problems Available
                  </p>

                  <p className="text-2xl font-bold">
                    {totalProblems}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="card-title">
                  Recently Solved
                </h2>

                <p className="text-sm text-base-content/60">
                  Your latest accepted problems across all time.
                </p>
              </div>

              <NavLink
                to="/profile"
                className="btn btn-outline btn-sm gap-2"
              >
                View Profile
                <ArrowRight size={15} />
              </NavLink>
            </div>

            {recentSolvedProblems.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <Target
                  size={40}
                  className="text-base-content/30"
                />

                <p className="mt-3 font-semibold">
                  No solved problems yet
                </p>

                <p className="mt-1 text-sm text-base-content/60">
                  Solve your first problem to start building
                  your dashboard.
                </p>

                <NavLink
                  to="/"
                  className="btn btn-primary btn-sm mt-4"
                >
                  Start Practicing
                </NavLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {recentSolvedProblems.map(
                  (problem) => {
                    const problemId =
                      problem.id || problem._id;

                    return (
                      <NavLink
                        key={problemId}
                        to={`/problem/${problemId}`}
                        className="group rounded-xl border border-base-300 bg-base-200 p-4 transition hover:border-primary/40 hover:bg-base-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold group-hover:text-primary">
                              {problem.title}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={`badge badge-sm capitalize ${
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

                              {problem.problemTags
                                ?.slice(0, 2)
                                .map(
                                  ({ tag }) => (
                                    <span
                                      key={
                                        tag.id
                                      }
                                      className="badge badge-outline badge-sm"
                                    >
                                      {
                                        tag.name
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          </div>

                          <CheckCircle2
                            size={19}
                            className="shrink-0 text-success"
                          />
                        </div>
                      </NavLink>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-base-content/60">
              {title}
            </p>

            <p className="mt-1 text-3xl font-bold">
              {value}
            </p>
          </div>

          <div className={`rounded-xl p-3 ${iconClass}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyRow({
  label,
  solved,
  total,
  badgeClass,
  progressClass,
}) {
  const percentage =
    total > 0
      ? Math.round((solved / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`badge ${badgeClass}`}>
            {label}
          </span>

          <span className="text-sm text-base-content/60">
            {solved}/{total}
          </span>
        </div>

        <span className="text-sm font-semibold">
          {percentage}%
        </span>
      </div>

      <progress
        className={`progress w-full ${progressClass}`}
        value={percentage}
        max="100"
      />
    </div>
  );
}

export default Dashboard;