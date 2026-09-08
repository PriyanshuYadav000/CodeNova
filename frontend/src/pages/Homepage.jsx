import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NavLink } from 'react-router';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
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
  ShoppingBag,
  ChevronDown,
  Brain,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  User,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

const PROBLEMS_PER_PAGE = 5;

const DEFAULT_PAGINATION = {
  page: 1,
  limit: PROBLEMS_PER_PAGE,
  totalProblems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function Homepage() {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [problemsLoading, setProblemsLoading] =
    useState(false);

  const [solvedLoading, setSolvedLoading] =
    useState(false);

  const [problemsError, setProblemsError] =
    useState('');

  const [solvedError, setSolvedError] =
    useState('');

  const [pagination, setPagination] =
    useState(DEFAULT_PAGINATION);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  const [searchQuery, setSearchQuery] =
    useState('');

  const fetchProblems = useCallback(
    async (initialLoad = false) => {
      try {
        if (initialLoad) {
          setLoading(true);
        } else {
          setProblemsLoading(true);
        }

        setProblemsError('');

        const response =
          await axiosClient.get(
            '/problem/getAllProblem',
            {
              params: {
                page: currentPage,
                limit: PROBLEMS_PER_PAGE,
                search: searchQuery.trim(),
                difficulty:
                  filters.difficulty,
                tag: filters.tag,
              },
            }
          );

        setProblems(
          Array.isArray(
            response.data?.problems
          )
            ? response.data.problems
            : []
        );

        setPagination(
          response.data?.pagination ||
            DEFAULT_PAGINATION
        );
      } catch (error) {
        console.error(
          'Error loading problems:',
          error
        );

        setProblemsError(
          error.response?.data?.message ||
            'Unable to load problems. Please try again.'
        );
      } finally {
        if (initialLoad) {
          setLoading(false);
        } else {
          setProblemsLoading(false);
        }
      }
    },
    [
      currentPage,
      searchQuery,
      filters.difficulty,
      filters.tag,
    ]
  );

  const fetchSolvedProblems =
    useCallback(async () => {
      if (!user) {
        setSolvedProblems([]);
        setSolvedError('');
        return;
      }

      try {
        setSolvedLoading(true);
        setSolvedError('');

        const response =
          await axiosClient.get(
            '/problem/problemSolvedByUser'
          );

        setSolvedProblems(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          'Error loading solved problems:',
          error
        );

        setSolvedError(
          error.response?.data?.message ||
            'Unable to load your progress.'
        );
      } finally {
        setSolvedLoading(false);
      }
    }, [user]);

  useEffect(() => {
    fetchProblems(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems(false);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentPage,
    searchQuery,
    filters.difficulty,
    filters.tag,
    fetchProblems,
  ]);

  useEffect(() => {
    fetchSolvedProblems();
  }, [fetchSolvedProblems]);

  const solvedProblemIds = useMemo(
    () =>
      new Set(
        solvedProblems.map(
          (problem) =>
            problem.id || problem._id
        )
      ),
    [solvedProblems]
  );

  const availableTags = useMemo(() => {
    const tags = new Set();

    problems.forEach((problem) => {
      const problemTags = Array.isArray(
        problem.tags
      )
        ? problem.tags
        : Array.isArray(
              problem.problemTags
            )
          ? problem.problemTags.map(
              ({ tag }) =>
                tag?.name
            )
          : problem.tags
            ? [problem.tags]
            : [];

      problemTags.forEach((tag) => {
        if (tag) {
          tags.add(
            typeof tag === 'string'
              ? tag
              : tag.name
          );
        }
      });
    });

    return [...tags].sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const problemId =
        problem.id || problem._id;

      const statusMatch =
        filters.status === 'all' ||
        (filters.status === 'solved' &&
          solvedProblemIds.has(
            problemId
          )) ||
        (filters.status === 'unsolved' &&
          !solvedProblemIds.has(
            problemId
          ));

      return statusMatch;
    });
  }, [
    filters.status,
    problems,
    solvedProblemIds,
  ]);

  const totalProblems =
    pagination.totalProblems;

  const totalSolved =
    solvedProblems.length;

  const completionPercentage =
    totalProblems > 0
      ? Math.round(
          (totalSolved /
            totalProblems) *
            100
        )
      : 0;

  const handleLogout = async () => {
    try {
      await dispatch(
        logoutUser()
      ).unwrap();
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      );
    }
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === currentPage ||
      problemsLoading
    ) {
      return;
    }

    setCurrentPage(page);
  };

  const resetFilters = () => {
    setFilters({
      difficulty: 'all',
      tag: 'all',
      status: 'all',
    });

    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleDifficultyChange = (
    value
  ) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: value,
    }));

    setCurrentPage(1);
  };

  const handleTagChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      tag: value,
    }));

    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));

    setCurrentPage(1);
  };

  const pageNumbers = Array.from(
    {
      length: pagination.totalPages,
    },
    (_, index) => index + 1
  );

  const userInitials = `${user?.firstName
    ?.charAt(0)
    ?.toUpperCase() || ''}${
    user?.lastName
      ?.charAt(0)
      ?.toUpperCase() || ''
  }` || 'U';

  /*
   * CHANGED PROFILE IMAGE LOGIC
   *
   * Profile.jsx saves the uploaded image in:
   * localStorage -> "codenova-profile-image"
   *
   * So Homepage first checks localStorage.
   * If nothing exists there, it falls back
   * to user.profileImage.
   */
  const profileImage =
    typeof window !== 'undefined'
      ? localStorage.getItem(
          'codenova-profile-image'
        ) || user?.profileImage
      : user?.profileImage;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg" />

          <p className="text-base-content/60">
            Loading CodeNova...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-6 sticky top-0 z-50">
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
                <span>Sign Up</span>
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
                    <div className="rounded-full w-8 h-8 overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={`${user.firstName || 'User'} profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center">
                          <span className="font-bold">
                            {userInitials}
                          </span>
                        </div>
                      )}
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
                      to="/profile"
                      className="gap-2"
                    >
                      <User size={16} />
                      Profile
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard"
                      className="gap-2"
                    >
                      <LayoutDashboard
                        size={16}
                      />
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
                        <ShieldCheck
                          size={16}
                        />
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

                  <div className="flex flex-wrap gap-2">
                    <NavLink
                      to="/profile"
                      className="btn btn-outline gap-2 w-fit"
                    >
                      <User size={17} />
                      Profile
                    </NavLink>

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
            </div>
          </section>
        ) : (
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

                {solvedLoading && (
                  <p className="text-xs text-base-content/50 mt-2">
                    Updating progress...
                  </p>
                )}

                {solvedError && (
                  <button
                    type="button"
                    onClick={
                      fetchSolvedProblems
                    }
                    className="text-xs text-error mt-2 flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={12} />
                    Retry progress
                  </button>
                )}
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

                <progress
                  className="progress progress-warning w-full mt-3"
                  value={completionPercentage}
                  max="100"
                />
              </div>
            </div>
          </section>
        )}

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
              of {pagination.totalProblems}
            </div>
          </div>
        </section>

        {solvedError && user && (
          <div className="alert alert-warning mb-4">
            <AlertCircle size={18} />

            <div className="flex-1">
              <span>{solvedError}</span>
            </div>

            <button
              type="button"
              onClick={
                fetchSolvedProblems
              }
              disabled={solvedLoading}
              className="btn btn-sm"
            >
              <RefreshCw
                size={14}
                className={
                  solvedLoading
                    ? 'animate-spin'
                    : ''
                }
              />
              Retry
            </button>
          </div>
        )}

        <section className="card bg-base-100 border border-base-300 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
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
                  onChange={(event) =>
                    handleSearchChange(
                      event.target.value
                    )
                  }
                />
              </label>

              <select
                className="select select-bordered"
                value={filters.status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value
                  )
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
                onChange={(event) =>
                  handleDifficultyChange(
                    event.target.value
                  )
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
                onChange={(event) =>
                  handleTagChange(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Tags
                </option>

                {availableTags.map(
                  (tag) => (
                    <option
                      key={tag}
                      value={tag}
                    >
                      {tag}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetFilters}
                disabled={problemsLoading}
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="relative">
          {problemsLoading && (
            <div className="absolute inset-0 z-10 bg-base-200/60 backdrop-blur-[1px] flex items-start justify-center pt-8 pointer-events-none">
              <div className="bg-base-100 border border-base-300 shadow-lg rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="loading loading-spinner loading-sm" />

                <span className="text-sm font-medium">
                  Updating problems...
                </span>
              </div>
            </div>
          )}

          {problemsError ? (
            <div className="card bg-base-100 border border-error/30 shadow-sm">
              <div className="card-body items-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-2">
                  <AlertCircle size={24} />
                </div>

                <h2 className="card-title">
                  Unable to load problems
                </h2>

                <p className="text-base-content/60 max-w-md">
                  {problemsError}
                </p>

                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={() =>
                    fetchProblems(false)
                  }
                  disabled={problemsLoading}
                >
                  <RefreshCw
                    size={16}
                    className={
                      problemsLoading
                        ? 'animate-spin'
                        : ''
                    }
                  />
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredProblems.length === 0 ? (
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
              {filteredProblems.map(
                (problem) => {
                  const problemId =
                    problem.id ||
                    problem._id;

                  const problemTags =
                    Array.isArray(
                      problem.tags
                    )
                      ? problem.tags
                      : Array.isArray(
                            problem.problemTags
                          )
                        ? problem.problemTags.map(
                            ({ tag }) =>
                              tag?.name
                          )
                        : problem.tags
                          ? [problem.tags]
                          : [];

                  const isSolved =
                    solvedProblemIds.has(
                      problemId
                    );

                  return (
                    <div
                      key={problemId}
                      className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="card-body">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="card-title">
                            <NavLink
                              to={
                                user
                                  ? `/problem/${problemId}`
                                  : '/login'
                              }
                              className="hover:text-primary transition-colors"
                            >
                              {
                                problem.title
                              }
                            </NavLink>
                          </h3>

                          {user &&
                            isSolved && (
                              <div className="badge badge-success gap-2">
                                <CheckCircle2
                                  size={
                                    14
                                  }
                                />
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

                          {problemTags
                            .filter(Boolean)
                            .map(
                              (tag) => (
                                <div
                                  key={
                                    typeof tag ===
                                    'string'
                                      ? tag
                                      : tag.name
                                  }
                                  className="badge badge-info badge-outline"
                                >
                                  {typeof tag ===
                                  'string'
                                    ? tag
                                    : tag.name}
                                </div>
                              )
                            )}
                        </div>

                        {!user && (
                          <div className="mt-3 text-sm text-base-content/50">
                            Login to open and solve this problem.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {pagination.totalPages > 1 && (
          <section className="flex justify-center mt-8 mb-6">
            <div className="join">
              <button
                type="button"
                className="join-item btn btn-sm"
                disabled={
                  !pagination.hasPreviousPage ||
                  problemsLoading
                }
                onClick={() =>
                  handlePageChange(
                    currentPage - 1
                  )
                }
              >
                <ChevronLeft size={16} />

                <span className="hidden sm:inline">
                  Previous
                </span>
              </button>

              {pageNumbers.map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`join-item btn btn-sm ${
                      currentPage ===
                      page
                        ? 'btn-primary'
                        : ''
                    }`}
                    disabled={
                      problemsLoading
                    }
                    onClick={() =>
                      handlePageChange(
                        page
                      )
                    }
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="join-item btn btn-sm"
                disabled={
                  !pagination.hasNextPage ||
                  problemsLoading
                }
                onClick={() =>
                  handlePageChange(
                    currentPage + 1
                  )
                }
              >
                <span className="hidden sm:inline">
                  Next
                </span>

                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function CodeNovaLogo({
  size = 22,
}) {
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

const getDifficultyBadgeColor = (
  difficulty
) => {
  switch (
    difficulty?.toLowerCase()
  ) {
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