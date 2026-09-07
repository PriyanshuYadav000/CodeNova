import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  useEffect(() => {
  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const problemsResponse = await axiosClient.get(
        '/problem/getAllProblem'
      );

      setProblems(
        Array.isArray(problemsResponse.data)
          ? problemsResponse.data
          : []
      );

      if (user) {
        const solvedResponse = await axiosClient.get(
          '/problem/problemSolvedByUser'
        );

        setSolvedProblems(
          Array.isArray(solvedResponse.data)
            ? solvedResponse.data
            : []
        );
      } else {
        setSolvedProblems([]);
      }
    } catch (error) {
      console.error('Error loading homepage:', error);

      setError(
        error.response?.data?.message ||
          'Unable to load problems. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  fetchHomepageData();
}, [user]);

  const solvedProblemIds = useMemo(
    () =>
      new Set(
        solvedProblems.map((problem) => problem._id)
      ),
    [solvedProblems]
  );

  const availableTags = useMemo(() => {
    const tags = new Set();

    problems.forEach((problem) => {
      const problemTags = Array.isArray(problem.tags)
        ? problem.tags
        : problem.tags
          ? [problem.tags]
          : [];

      problemTags.forEach((tag) => tags.add(tag));
    });

    return [...tags].sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const difficultyMatch =
        filters.difficulty === 'all' ||
        problem.difficulty === filters.difficulty;

      const problemTags = Array.isArray(problem.tags)
        ? problem.tags
        : problem.tags
          ? [problem.tags]
          : [];

      const tagMatch =
        filters.tag === 'all' ||
        problemTags.includes(filters.tag);

      const statusMatch =
        filters.status === 'all' ||
        (filters.status === 'solved' &&
          solvedProblemIds.has(problem._id)) ||
        (filters.status === 'unsolved' &&
          !solvedProblemIds.has(problem._id));

      return (
        difficultyMatch &&
        tagMatch &&
        statusMatch
      );
    });
  }, [filters, problems, solvedProblemIds]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const resetFilters = () => {
    setFilters({
      difficulty: 'all',
      tag: 'all',
      status: 'all',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
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
              className="btn btn-ghost text-xl font-bold"
            >
              CodeNova
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="btn btn-ghost"
            >
              <LogIn size={18} />
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className="btn btn-primary"
            >
              <UserPlus size={18} />
              Sign Up
            </NavLink>
          </div>
        </nav>

        <main className="container mx-auto p-4 pt-8">
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
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
            className="btn btn-ghost text-xl font-bold hover:text-primary transition-colors"
          >
            CodeNova
          </NavLink>
        </div>

        <div className="flex-none flex items-center gap-2">

          {!user ? (
            <>
              <NavLink
                to="/login"
                className="btn btn-ghost gap-2 hover:bg-base-200 transition-all"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">
                  Login
                </span>
              </NavLink>

              <NavLink
                to="/signup"
                className="btn btn-primary gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <UserPlus size={18} />
                <span>
                  Sign Up
                </span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/settings"
                className="btn btn-ghost btn-circle hover:rotate-12 hover:text-primary transition-all"
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={20} />
              </NavLink>

              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost gap-2 hover:bg-base-200 transition-all"
                >
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-8">
                      <span className="font-bold">
                        {user?.firstName
                          ?.charAt(0)
                          ?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>

                  <span className="hidden sm:inline font-medium">
                    {user?.firstName}
                  </span>
                </div>

                <ul className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-56 z-50 border border-base-300">

                  <li>
                    <NavLink
                      to="/dashboard"
                      className="gap-2"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/settings"
                      className="gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </NavLink>
                  </li>

                  {user?.role === 'admin' && (
                    <li>
                      <NavLink
                        to="/admin"
                        className="gap-2"
                      >
                        <ShieldCheck size={16} />
                        Admin
                      </NavLink>
                    </li>
                  )}

                  <div className="divider my-1" />

                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-error gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>

                </ul>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="container mx-auto p-4">

        <div className="flex flex-col gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold">
              Problems
            </h1>

            <p className="text-base-content/60">
              Practice coding problems and track your progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">

            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="all">
                All Problems
              </option>

              <option value="solved">
                Solved
              </option>

              <option value="unsolved">
                Unsolved
              </option>
            </select>

            <select
              className="select select-bordered"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
            >
              <option value="all">
                All Difficulties
              </option>

              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
                Hard
              </option>
            </select>

            <select
              className="select select-bordered"
              value={filters.tag}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  tag: e.target.value,
                }))
              }
            >
              <option value="all">
                All Tags
              </option>

              {availableTags.map((tag) => (
                <option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={resetFilters}
            >
              Reset
            </button>

          </div>
        </div>

        <div className="mb-4 text-sm text-base-content/60">
          Showing {filteredProblems.length} of {problems.length} problems
        </div>

        {filteredProblems.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">

              <h2 className="card-title">
                No problems found
              </h2>

              <p className="text-base-content/60">
                Try changing your filters.
              </p>

              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={resetFilters}
              >
                Clear Filters
              </button>

            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.map((problem) => {

              const problemTags = Array.isArray(problem.tags)
                ? problem.tags
                : problem.tags
                  ? [problem.tags]
                  : [];

              const isSolved =
                solvedProblemIds.has(
                  problem._id
                );

              return (
                <div
                  key={problem._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="card-body">

                    <div className="flex items-center justify-between gap-4">

                      <h2 className="card-title">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {problem.title}
                        </NavLink>
                      </h2>

                      {user && isSolved && (
                        <div className="badge badge-success gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>

                          Solved
                        </div>
                      )}

                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">

                      <div
                        className={`badge ${getDifficultyBadgeColor(
                          problem.difficulty
                        )}`}
                      >
                        {capitalize(
                          problem.difficulty
                        )}
                      </div>

                      {problemTags.map((tag) => (
                        <div
                          key={tag}
                          className="badge badge-info badge-outline"
                        >
                          {tag}
                        </div>
                      ))}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

const capitalize = (value) => {
  if (!value) return '';

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'badge-success';

    case 'medium':
      return 'badge-warning';

    case 'hard':
      return 'badge-error';

    default:
      return 'badge-neutral';
  }
};

export default Homepage;