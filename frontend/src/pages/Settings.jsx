import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Lock,
  Save,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  Palette,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

import {
  updateProfile,
  changePassword,
  deleteProfile,
} from '../authSlice';

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    profileLoading,
    passwordLoading,
    deleteLoading,
  } = useSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [toast, setToast] = useState({
    type: '',
    message: '',
  });

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'system'
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      age: user.age ?? '',
    });
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: '',
        message: '',
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, message) => {
    setToast({
      type,
      message,
    });
  };

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;

    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      root.setAttribute(
        'data-theme',
        prefersDark ? 'dark' : 'light'
      );

      return;
    }

    root.setAttribute('data-theme', selectedTheme);
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);

    showToast(
      'success',
      `${
        selectedTheme.charAt(0).toUpperCase() +
        selectedTheme.slice(1)
      } theme applied.`
    );
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (profileLoading) {
      return;
    }

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const age = Number(profileForm.age);

    if (!firstName) {
      showToast(
        'error',
        'First name is required.'
      );
      return;
    }

    if (!lastName) {
      showToast(
        'error',
        'Last name is required.'
      );
      return;
    }

    if (!Number.isInteger(age) || age < 13 || age > 120) {
      showToast(
        'error',
        'Age must be between 13 and 120.'
      );
      return;
    }

    try {
      const result = await dispatch(
        updateProfile({
          firstName,
          lastName,
          age,
        })
      );

      if (updateProfile.fulfilled.match(result)) {
        showToast(
          'success',
          'Account settings applied successfully.'
        );
        return;
      }

      showToast(
        'error',
        result.payload?.message ||
          'Unable to update profile.'
      );
    } catch (err) {
      showToast(
        'error',
        'Something went wrong while saving your profile.'
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordLoading) {
      return;
    }

    const currentPassword =
      passwordForm.currentPassword.trim();

    const newPassword =
      passwordForm.newPassword.trim();

    if (!currentPassword) {
      showToast(
        'error',
        'Current password is required.'
      );
      return;
    }

    if (!newPassword) {
      showToast(
        'error',
        'New password is required.'
      );
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        'error',
        'New password must be at least 6 characters.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      showToast(
        'error',
        'New password must be different from the current password.'
      );
      return;
    }

    try {
      const result = await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        })
      );

      if (changePassword.fulfilled.match(result)) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
        });

        setShowCurrentPassword(false);
        setShowNewPassword(false);

        showToast(
          'success',
          'Password changed successfully.'
        );

        return;
      }

      showToast(
        'error',
        result.payload?.message ||
          'Unable to change password.'
      );
    } catch (err) {
      showToast(
        'error',
        'Something went wrong while changing your password.'
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteLoading) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteProfile());

    if (deleteProfile.fulfilled.match(result)) {
      navigate('/signup', {
        replace: true,
      });
      return;
    }

    showToast(
      'error',
      result.payload?.message ||
        'Unable to delete profile.'
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {toast.message && (
        <div className="toast toast-top toast-end z-50 p-4">
          <div
            className={`alert ${
              toast.type === 'success'
                ? 'alert-success'
                : 'alert-error'
            } shadow-lg`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}

            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <nav className="navbar bg-base-100 border-b border-base-300 px-4 sticky top-0 z-40">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl font-bold"
          >
            CodeNova
          </NavLink>
        </div>

        <NavLink
          to="/"
          className="btn btn-ghost gap-2"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">
            Problems
          </span>
        </NavLink>
      </nav>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <SettingsIcon size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Settings
              </h1>

              <p className="text-sm text-base-content/60 mt-1">
                Manage your account, security, and appearance.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="card-title">
                    Account Settings
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Update your personal information.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="label">
                    <span className="label-text">
                      First Name
                    </span>
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="input input-bordered w-full"
                    autoComplete="given-name"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">
                      Last Name
                    </span>
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="input input-bordered w-full"
                    autoComplete="family-name"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">
                      Email
                    </span>
                  </label>

                  <input
                    type="email"
                    value={user.emailId || ''}
                    className="input input-bordered w-full"
                    autoComplete="email"
                    disabled
                  />

                  <p className="text-xs text-base-content/50 mt-2">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">
                      Age
                    </span>
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={profileForm.age}
                    onChange={handleProfileChange}
                    min="13"
                    max="120"
                    className="input input-bordered w-full"
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    {profileLoading
                      ? 'Saving...'
                      : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10 text-warning">
                  <Shield size={20} />
                </div>

                <div>
                  <h2 className="card-title">
                    Security
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Keep your CodeNova account secure.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="label">
                    <span className="label-text">
                      Current Password
                    </span>
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showCurrentPassword
                          ? 'text'
                          : 'password'
                      }
                      name="currentPassword"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={handlePasswordChange}
                      className="input input-bordered w-full pr-12"
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (prev) => !prev
                        )
                      }
                      className="btn btn-ghost btn-sm btn-square absolute right-1 top-1/2 -translate-y-1/2"
                      aria-label={
                        showCurrentPassword
                          ? 'Hide current password'
                          : 'Show current password'
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">
                      New Password
                    </span>
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewPassword
                          ? 'text'
                          : 'password'
                      }
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      className="input input-bordered w-full pr-12"
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (prev) => !prev
                        )
                      }
                      className="btn btn-ghost btn-sm btn-square absolute right-1 top-1/2 -translate-y-1/2"
                      aria-label={
                        showNewPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <p className="text-xs text-base-content/50">
                    Use at least 6 characters and avoid reusing
                    your current password.
                  </p>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Lock size={18} />
                      )}

                      {passwordLoading
                        ? 'Changing...'
                        : 'Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10 text-info">
                  <Palette size={20} />
                </div>

                <div>
                  <h2 className="card-title">
                    Appearance
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Choose how CodeNova looks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handleThemeChange('system')
                  }
                  className={`btn h-auto min-h-28 py-5 flex flex-col gap-3 ${
                    theme === 'system'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Monitor size={24} />
                  <span>System</span>

                  <span className="text-xs opacity-70">
                    Follow device theme
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleThemeChange('light')
                  }
                  className={`btn h-auto min-h-28 py-5 flex flex-col gap-3 ${
                    theme === 'light'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Sun size={24} />
                  <span>Light</span>

                  <span className="text-xs opacity-70">
                    Bright appearance
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleThemeChange('dark')
                  }
                  className={`btn h-auto min-h-28 py-5 flex flex-col gap-3 ${
                    theme === 'dark'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Moon size={24} />
                  <span>Dark</span>

                  <span className="text-xs opacity-70">
                    Dark appearance
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="card bg-base-100 border border-error shadow-sm">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-error/10 text-error">
                  <Trash2 size={20} />
                </div>

                <div>
                  <h2 className="card-title text-error">
                    Danger Zone
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Permanently delete your CodeNova account.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-base-content/60 max-w-2xl">
                  This will permanently remove your account
                  and cannot be undone.
                </p>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn btn-error btn-outline"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={18} />
                  )}

                  {deleteLoading
                    ? 'Deleting...'
                    : 'Delete Account'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;