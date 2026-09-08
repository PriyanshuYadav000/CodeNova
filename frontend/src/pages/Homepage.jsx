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
  Sparkles,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Bot,
  Code2,
  Target,
  MessageSquare,
  Users,
  ShoppingBag,
  ChevronDown,
  Brain,
  Search,
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

  const [searchQuery, setSearchQuery] = useState('');

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
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

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

      const searchMatch =
        !normalizedSearch ||
        problem.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        problemTags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      return (
        difficultyMatch &&
        tagMatch &&
        statusMatch &&
        searchMatch
      );
    });
  }, [
    filters,
    problems,
    solvedProblemIds,
    searchQuery,
  ]);

  const totalProblems = problems.length;
  const totalSolved = solvedProblems.length;

  const completionPercentage =
    totalProblems > 0
      ? Math.round(
          (totalSolved / totalProblems) * 100
        )
      : 0;

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

    setSearchQuery('');
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

        <nav className="navbar bg-base-100 border-b border-base-300 px-4 sticky top-0 z-50">

          <div className="navbar-start">
            <NavLink
              to="/"
              className="flex items-center gap-2"
            >
              <CodeNovaLogo />

              <div className="hidden sm:block">
                <div className="font-bold text-lg leading-none">
                  CodeNova
                </div>

                <div className="text-[10px] text-base-content/50">
                  AI-powered coding
                </div>
              </div>
            </NavLink>
          </div>

          <div className="navbar-end flex items-center gap-2">

            <NavLink
              to="/login"
              className="btn btn-ghost btn-sm gap-2"
            >
              <LogIn size={17} />
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className="btn btn-primary btn-sm gap-2"
            >
              <UserPlus size={17} />
              Sign Up
            </NavLink>

          </div>

        </nav>

        <main className="container mx-auto max-w-7xl p-4 sm:p-6 pt-8">

          <div className="alert alert-error shadow-sm">
            <span>{error}</span>
          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-6 sticky top-0 z-50">

        {/* Logo */}
        <div className="navbar-start">

          <NavLink
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >

            <CodeNovaLogo />

            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-none">
                CodeNova
              </div>

              <div className="text-[10px] text-base-content/50">
                AI-powered coding
              </div>
            </div>

          </NavLink>

        </div>

        {/* Main Navigation */}
        <div className="navbar-center hidden lg:flex">

          <div className="flex items-center gap-1">

            <NavLink
              to="/"
              className={({ isActive }) =>
                `btn btn-ghost btn-sm gap-2 ${
                  isActive
                    ? 'text-primary bg-primary/5'
                    : ''
                }`
              }
            >
              <Code2 size={16} />
              Problems
            </NavLink>

            <NavLink
              to="/contest"
              className="btn btn-ghost btn-sm gap-2"
            >
              <Trophy size={16} />
              Contest
            </NavLink>

            <NavLink
              to="/discuss"
              className="btn btn-ghost btn-sm gap-2"
            >
              <MessageSquare size={16} />
              Discuss
            </NavLink>

            <NavLink
              to="/interview"
              className="btn btn-ghost btn-sm gap-2"
            >
              <Brain size={16} />
              Interview
            </NavLink>

            <NavLink
              to="/store"
              className="btn btn-ghost btn-sm gap-2"
            >
              <ShoppingBag size={16} />
              Store
            </NavLink>

            <NavLink
              to="/ai-chat"
              className="btn btn-ghost btn-sm gap-2 text-primary"
            >
              <Bot size={16} />
              AI Chat

              <span className="badge badge-warning badge-xs">
                Soon
              </span>
            </NavLink>

          </div>

        </div>

        {/* User Area */}
        <div className="navbar-end">

          {!user ? (

            <div className="flex items-center gap-2">

              <NavLink
                to="/login"
                className="btn btn-ghost btn-sm gap-2"
              >
                <LogIn size={17} />
                <span className="hidden sm:inline">
                  Login
                </span>
              </NavLink>

              <NavLink
                to="/signup"
                className="btn btn-primary btn-sm gap-2"
              >
                <UserPlus size={17} />
                <span>
                  Sign Up
                </span>
              </NavLink>

            </div>

          ) : (

            <div className="flex items-center gap-2">

              <NavLink
                to="/settings"
                className="btn btn-ghost btn-circle hover:text-primary transition"
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={19} />
              </NavLink>

              <div className="dropdown dropdown-end">

                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost gap-2"
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

                  <ChevronDown size={15} />

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

            </div>

          )}

        </div>

      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-base-100 border-b border-base-300 px-3 py-2 overflow-x-auto">

        <div className="flex items-center gap-1 min-w-max">

          <NavLink
            to="/"
            className="btn btn-ghost btn-sm gap-2"
          >
            <Code2 size={15} />
            Problems
          </NavLink>

          <NavLink
            to="/contest"
            className="btn btn-ghost btn-sm gap-2"
          >
            <Trophy size={15} />
            Contest
          </NavLink>

          <NavLink
            to="/discuss"
            className="btn btn-ghost btn-sm gap-2"
          >
            <MessageSquare size={15} />
            Discuss
          </NavLink>

          <NavLink
            to="/interview"
            className="btn btn-ghost btn-sm gap-2"
          >
            <Brain size={15} />
            Interview
          </NavLink>

          <NavLink
            to="/store"
            className="btn btn-ghost btn-sm gap-2"
          >
            <ShoppingBag size={15} />
            Store
          </NavLink>

          <NavLink
            to="/ai-chat"
            className="btn btn-ghost btn-sm gap-2 text-primary"
          >
            <Bot size={15} />
            AI Chat

            <span className="badge badge-warning badge-xs">
              Soon
            </span>
          </NavLink>

        </div>

      </div>

      <main className="container mx-auto max-w-7xl p-4 sm:p-6">

        {/* Logged In Welcome */}
        {user ? (

          <section className="mb-8">

            <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">

              <div className="card-body">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
                      <Sparkles size={16} />
                      Your coding workspace
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold">
                      Welcome back,{' '}
                      {user.firstName} 👋
                    </h1>

                    <p className="text-base-content/60 mt-2 max-w-2xl">
                      Ready to sharpen your skills?
                      Pick a problem and keep your
                      coding journey moving.
                    </p>

                  </div>

                  <NavLink
                    to="/dashboard"
                    className="btn btn-primary gap-2 w-fit"
                  >
                    View Progress
                    <ArrowRight size={17} />
                  </NavLink>

                </div>

              </div>

            </div>

          </section>

        ) : (

          /* Logged Out Greeting */
          <section className="mb-7">

            <div className="card bg-base-100 border border-base-300 shadow-sm">

              <div className="card-body py-7 sm:py-8">

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  <div className="shrink-0">

                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <CodeNovaLogo size={30} />
                    </div>

                  </div>

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2 mb-1">

                      <h1 className="text-2xl sm:text-3xl font-bold">
                        Welcome to CodeNova 👋
                      </h1>

                      <span className="badge badge-primary badge-sm">
                        Developer Practice
                      </span>

                    </div>

                    <p className="text-base-content/60 text-sm sm:text-base max-w-3xl">
                      Master coding. One problem at a time.
                      Practice coding problems, test your
                      solutions, track your progress, and
                      prepare for technical interviews with
                      CodeNova.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">

                      <NavLink
                        to="/signup"
                        className="btn btn-primary btn-sm gap-2"
                      >
                        Start Practicing
                        <ArrowRight size={16} />
                      </NavLink>

                      <NavLink
                        to="/login"
                        className="btn btn-ghost btn-sm"
                      >
                        Already a member? Login
                      </NavLink>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* Progress Summary */}
        {user && (

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">

              <div className="card-body">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-base-content/60">
                      Total Problems
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {totalProblems}
                    </p>

                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Code2 size={21} />
                  </div>

                </div>

              </div>

            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">

              <div className="card-body">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-base-content/60">
                      Problems Solved
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {totalSolved}
                    </p>

                  </div>

                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <CheckCircle2 size={21} />
                  </div>

                </div>

              </div>

            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">

              <div className="card-body">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-base-content/60">
                      Completion
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {completionPercentage}%
                    </p>

                  </div>

                  <div className="p-3 rounded-xl bg-warning/10 text-warning">
                    <Target size={21} />
                  </div>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* Problems Header */}
        <section className="mb-5">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <Trophy
                  size={19}
                  className="text-primary"
                />

                <h2 className="text-2xl font-bold">
                  Problems
                </h2>

              </div>

              <p className="text-base-content/60 text-sm">
                Practice coding problems and track your progress.
              </p>

            </div>

            <div className="text-sm text-base-content/50">

              Showing{' '}

              <span className="font-semibold text-base-content">
                {filteredProblems.length}
              </span>{' '}

              of {problems.length}

            </div>

          </div>

        </section>

        {/* Filters */}
        <section className="card bg-base-100 border border-base-300 shadow-sm mb-6">

          <div className="card-body">

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">

              {/* Search */}
              <label className="input input-bordered flex items-center gap-2 w-full sm:w-72">

                <Search
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="text"
                  className="grow"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                />

              </label>

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

        </section>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (

          <div className="card bg-base-100 shadow-xl">

            <div className="card-body items-center text-center py-12">

              <h2 className="card-title">
                No problems found
              </h2>

              <p className="text-base-content/60">
                Try changing your filters or search.
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

              const problemTags = Array.isArray(
                problem.tags
              )
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
                  className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >

                  <div className="card-body">

                    <div className="flex items-center justify-between gap-4">

                      <h3 className="card-title">

                        <NavLink
                          to={
                            user
                              ? `/problem/${problem._id}`
                              : '/login'
                          }
                          className="hover:text-primary transition-colors"
                        >
                          {problem.title}
                        </NavLink>

                      </h3>

                      {user && isSolved && (

                        <div className="badge badge-success gap-2">

                          <CheckCircle2 size={14} />

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

                    {!user && (

                      <div className="mt-3 text-sm text-base-content/50">
                        Login to open and solve this problem.
                      </div>

                    )}

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

function CodeNovaLogo({ size = 22 }) {
  return (
    <div
      className="rounded-xl bg-primary/10 text-primary flex items-center justify-center"
      style={{
        width: size + 14,
        height: size + 14,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.5 5.5L3.5 12L8.5 18.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M15.5 5.5L20.5 12L15.5 18.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M13.5 4L10.5 20"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

const capitalize = (value) => {
  if (!value) {
    return '';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
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