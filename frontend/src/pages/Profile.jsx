import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Camera,
  CalendarDays,
  CheckCircle2,
  Code2,
  Flame,
  Mail,
  Pencil,
  Settings,
  Shield,
  Target,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';

function Profile() {
  const { user } = useSelector(
    (state) => state.auth
  );

  const [dashboardData, setDashboardData] =
    useState(null);

  const [activityData, setActivityData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activityLoading, setActivityLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [activityError, setActivityError] =
    useState('');

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [profileImage, setProfileImage] =
    useState(() =>
      localStorage.getItem(
        'codenova-profile-image'
      )
    );

  const fullName = useMemo(() => {
    return (
      `${user?.firstName || ''} ${
        user?.lastName || ''
      }`.trim() ||
      'CodeNova User'
    );
  }, [user]);

  const initials = useMemo(() => {
    const first =
      user?.firstName
        ?.charAt(0)
        ?.toUpperCase() || '';

    const last =
      user?.lastName
        ?.charAt(0)
        ?.toUpperCase() || '';

    return (
      `${first}${last}` || 'U'
    );
  }, [user]);

  const totalProblems =
    dashboardData?.totalProblems || 0;

  const totalSolved =
    dashboardData?.totalSolved || 0;

  const completionPercentage =
    dashboardData?.completionPercentage || 0;

  const difficulty =
    dashboardData?.difficulty || {
      easy: {
        solved: 0,
        total: 0,
      },
      medium: {
        solved: 0,
        total: 0,
      },
      hard: {
        solved: 0,
        total: 0,
      },
    };

  const selectedDateLabel =
    formatLongDate(selectedDate);

  useEffect(() => {
    const fetchProfileStats =
      async () => {
        try {
          setLoading(true);
          setError('');

          const response =
            await axiosClient.get(
              '/problem/dashboardStats'
            );

          setDashboardData(
            response.data
          );
        } catch (err) {
          console.error(
            'Profile stats error:',
            err.response?.data ||
              err
          );

          setError(
            err.response?.data?.message ||
              'Unable to load profile data.'
          );
        } finally {
          setLoading(false);
        }
      };

    if (user) {
      fetchProfileStats();
    }
  }, [user]);

  useEffect(() => {
    const fetchActivity =
      async () => {
        try {
          setActivityLoading(true);
          setActivityError('');

          const now = new Date();

          const response =
            await axiosClient.get(
              '/problem/activity',
              {
                params: {
                  date: selectedDate,
                  offsetMinutes:
                    now.getTimezoneOffset(),
                },
              }
            );

          setActivityData(
            response.data
          );
        } catch (err) {
          console.error(
            'Activity error:',
            err.response?.data ||
              err
          );

          setActivityError(
            err.response?.data?.message ||
              'Unable to load activity.'
          );
        } finally {
          setActivityLoading(false);
        }
      };

    if (user) {
      fetchActivity();
    }
  }, [
    user,
    selectedDate,
  ]);

  const handlePreviousDay = () => {
    setSelectedDate(
      changeDate(
        selectedDate,
        -1
      )
    );
  };

  const handleNextDay = () => {
    const today =
      getTodayDate();

    if (
      selectedDate >= today
    ) {
      return;
    }

    const nextDate =
      changeDate(
        selectedDate,
        1
      );

    if (nextDate <= today) {
      setSelectedDate(
        nextDate
      );
    }
  };

  const handleToday = () => {
    setSelectedDate(
      getTodayDate()
    );
  };

  const handleDateChange = (
    event
  ) => {
    const date =
      event.target.value;

    if (!date) {
      return;
    }

    if (
      date <=
      getTodayDate()
    ) {
      setSelectedDate(date);
    }
  };

  const handleProfileImageChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        return;
      }

      if (
        file.size >
        2 * 1024 * 1024
      ) {
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        const image =
          reader.result;

        setProfileImage(image);

        localStorage.setItem(
          'codenova-profile-image',
          image
        );
      };

      reader.readAsDataURL(file);
    };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar sticky top-0 z-40 bg-base-100 border-b border-base-300 px-4">
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
            to="/dashboard"
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft size={17} />

            <span className="hidden sm:inline">
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/settings"
            className="btn btn-ghost btn-circle"
            title="Settings"
          >
            <Settings size={18} />
          </NavLink>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <section className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="h-32 bg-primary/10" />

          <div className="px-6 pb-6">
            <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={fullName}
                      className="h-28 w-28 rounded-full border-4 border-base-100 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-base-100 bg-primary text-3xl font-bold text-primary-content shadow-lg">
                      {initials}
                    </div>
                  )}

                  <label
                    htmlFor="profile-image"
                    className="btn btn-primary btn-circle btn-sm absolute bottom-1 right-1 cursor-pointer shadow-md"
                    title="Change profile photo"
                  >
                    <Camera size={16} />

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleProfileImageChange
                      }
                    />
                  </label>
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">
                      {fullName}
                    </h1>

                    {user.role && (
                      <span className="badge badge-primary capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-base-content/60">
                    CodeNova member profile
                  </p>
                </div>
              </div>

              <NavLink
                to="/settings"
                className="btn btn-outline gap-2"
              >
                <Pencil size={17} />
                Edit Profile
              </NavLink>
            </div>
          </div>
        </section>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="card-title">
                    Personal Information
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Account details
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <ProfileField
                  icon={<Mail size={18} />}
                  label="Email"
                  value={
                    user.emailId ||
                    'Not available'
                  }
                />

                <ProfileField
                  icon={<Shield size={18} />}
                  label="Role"
                  value={
                    user.role ||
                    'user'
                  }
                />

                <ProfileField
                  icon={<CalendarDays size={18} />}
                  label="Age"
                  value={
                    user.age ??
                    'Not set'
                  }
                />

                <ProfileField
                  icon={<Code2 size={18} />}
                  label="User ID"
                  value={
                    user.id ||
                    user._id ||
                    'Not available'
                  }
                  mono
                />

                <ProfileField
                  icon={<CalendarDays size={18} />}
                  label="Member Since"
                  value={
                    user.createdAt
                      ? formatLongDate(
                          user.createdAt
                        )
                      : 'Not available'
                  }
                />
              </div>

              <NavLink
                to="/settings"
                className="btn btn-outline mt-6 w-full gap-2"
              >
                <Settings size={17} />
                Account Settings
              </NavLink>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-100 shadow-sm lg:col-span-2">
            <div className="card-body">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Trophy size={20} />
                </div>

                <div>
                  <h2 className="card-title">
                    Problem Solving
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Overall lifetime progress
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center">
                  <div className="flex flex-col items-center">
                    <div
                      className="radial-progress text-primary"
                      style={{
                        '--value':
                          completionPercentage,
                        '--size':
                          '10rem',
                        '--thickness':
                          '0.8rem',
                      }}
                      role="progressbar"
                    >
                      <div className="text-center">
                        <p className="text-3xl font-bold">
                          {totalSolved}/
                          {totalProblems}
                        </p>

                        <p className="text-xs text-base-content/60">
                          solved
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 font-semibold">
                      {completionPercentage}%
                      {' '}
                      Complete
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-5">
                    <ProfileDifficulty
                      label="Easy"
                      solved={
                        difficulty.easy.solved
                      }
                      total={
                        difficulty.easy.total
                      }
                      badgeClass="badge-success"
                      progressClass="progress-success"
                    />

                    <ProfileDifficulty
                      label="Medium"
                      solved={
                        difficulty.medium.solved
                      }
                      total={
                        difficulty.medium.total
                      }
                      badgeClass="badge-warning"
                      progressClass="progress-warning"
                    />

                    <ProfileDifficulty
                      label="Hard"
                      solved={
                        difficulty.hard.solved
                      }
                      total={
                        difficulty.hard.total
                      }
                      badgeClass="badge-error"
                      progressClass="progress-error"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActivityCard
            icon={
              <Flame size={22} />
            }
            title="Active Days"
            value={
              activityLoading
                ? '...'
                : activityData?.activeDays ||
                  0
            }
            description="Days with accepted solutions"
            className="bg-warning/10 text-warning"
          />

          <ActivityCard
            icon={
              <CheckCircle2 size={22} />
            }
            title="Solved On Date"
            value={
              activityLoading
                ? '...'
                : activityData?.todaySolvedCount ||
                  0
            }
            description={selectedDateLabel}
            className="bg-success/10 text-success"
          />

          <ActivityCard
            icon={
              <CalendarDays size={22} />
            }
            title="Selected Day"
            value={selectedDateLabel}
            description="View daily coding activity"
            className="bg-primary/10 text-primary"
          />
        </section>

        <section className="mb-6 card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="card-title">
                  Coding Activity
                </h2>

                <p className="text-sm text-base-content/60">
                  Check which problems you solved on a specific day.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={
                    handlePreviousDay
                  }
                  className="btn btn-outline btn-sm btn-square"
                  title="Previous day"
                >
                  <ChevronLeft size={17} />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  max={getTodayDate()}
                  onChange={
                    handleDateChange
                  }
                  className="input input-bordered input-sm"
                />

                <button
                  type="button"
                  onClick={
                    handleNextDay
                  }
                  disabled={
                    selectedDate >=
                    getTodayDate()
                  }
                  className="btn btn-outline btn-sm btn-square"
                  title="Next day"
                >
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={
                    handleToday
                  }
                  className="btn btn-primary btn-sm"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="card-title">
                  Solved on {selectedDateLabel}
                </h2>

                <p className="text-sm text-base-content/60">
                  Only accepted problems from this day are shown.
                </p>
              </div>

              {!activityLoading && (
                <span className="badge badge-success badge-lg">
                  {activityData?.todaySolvedCount ||
                    0}{' '}
                  solved
                </span>
              )}
            </div>

            {activityError ? (
              <div className="alert alert-error">
                <span>
                  {activityError}
                </span>
              </div>
            ) : activityLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : activityData?.todaySolvedProblems
                ?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activityData.todaySolvedProblems.map(
                  (problem) => (
                    <NavLink
                      key={problem.id}
                      to={`/problem/${problem.id}`}
                      className="group rounded-xl border border-base-300 bg-base-200 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-base-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-success"
                            />

                            <p className="truncate font-semibold group-hover:text-primary">
                              {problem.title}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
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
                              ?.slice(0, 3)
                              .map(
                                ({
                                  tag,
                                }) => (
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

                          {problem.solvedAt && (
                            <p className="mt-3 text-xs text-base-content/50">
                              Solved at{' '}
                              {formatTime(
                                problem.solvedAt
                              )}
                            </p>
                          )}
                        </div>

                        <ArrowRightIcon />
                      </div>
                    </NavLink>
                  )
                )}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Code2 size={27} />
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  No problems solved
                </h3>

                <p className="mt-1 max-w-md text-sm text-base-content/60">
                  You didn't solve any problem on{' '}
                  {selectedDateLabel}.
                  Start practicing and make this day count.
                </p>

                <NavLink
                  to="/"
                  className="btn btn-primary mt-5 gap-2"
                >
                  Solve a Problem
                  <ArrowRightIcon />
                </NavLink>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy
                size={21}
                className="text-primary"
              />

              <div>
                <h3 className="font-semibold">
                  Keep your daily streak
                </h3>

                <p className="text-sm text-base-content/60">
                  Solve at least one problem every day to build your activity history.
                </p>
              </div>
            </div>

            <NavLink
              to="/dashboard"
              className="btn btn-outline btn-sm gap-2"
            >
              Full Dashboard
              <ArrowRightIcon />
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  );
}

function ActivityCard({
  icon,
  title,
  value,
  description,
  className,
}) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-3 ${className}`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm text-base-content/60">
              {title}
            </p>

            <p className="truncate text-2xl font-bold">
              {value}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-base-content/50">
          {description}
        </p>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-base-content/50">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-base-content/50">
          {label}
        </p>

        <p
          className={`mt-1 break-all text-sm font-medium ${
            mono
              ? 'font-mono text-xs'
              : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ProfileDifficulty({
  label,
  solved,
  total,
  badgeClass,
  progressClass,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (solved / total) * 100
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`badge ${badgeClass}`}
          >
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

function ArrowRightIcon() {
  return (
    <ArrowLeft
      size={18}
      className="rotate-180 shrink-0 text-base-content/40 transition group-hover:text-primary"
    />
  );
}

function getTodayDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function changeDate(
  dateString,
  amount
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  date.setDate(
    date.getDate() + amount
  );

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatLongDate(
  value
) {
  try {
    const date =
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
        ? new Date(
            `${value}T00:00:00`
          )
        : new Date(value);

    return date.toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  } catch {
    return 'Not available';
  }
}

function formatTime(value) {
  try {
    return new Date(
      value
    ).toLocaleTimeString(
      undefined,
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    );
  } catch {
    return '';
  }
}

export default Profile;