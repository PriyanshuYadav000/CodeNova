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
} from 'lucide-react';

import {
  updateProfile,
  changePassword,
  deleteProfile,
} from '../authSlice';

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'system'
  );

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age || '',
      });
    }
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

      localStorage.setItem('theme', 'system');
      return;
    }

    root.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
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

    setMessage('');
    setError('');

    const result = await dispatch(updateProfile(profileForm));

    if (updateProfile.fulfilled.match(result)) {
      setMessage('Profile updated successfully.');
    } else {
      setError(
        result.payload?.message ||
          'Unable to update profile.'
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    const result = await dispatch(changePassword(passwordForm));

    if (changePassword.fulfilled.match(result)) {
      setMessage('Password changed successfully.');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      });
    } else {
      setError(
        result.payload?.message ||
          'Unable to change password.'
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setMessage('');
    setError('');

    const result = await dispatch(deleteProfile());

    if (deleteProfile.fulfilled.match(result)) {
      navigate('/signup');
    } else {
      setError(
        result.payload?.message ||
          'Unable to delete profile.'
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
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
          className="btn btn-ghost"
        >
          <ArrowLeft size={18} />
          Problems
        </NavLink>
      </nav>

      {/* Main */}
      <main className="container mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon size={28} />
            <h1 className="text-3xl font-bold">
              Settings
            </h1>
          </div>

          <p className="text-base-content/60">
            Manage your account, security, and appearance.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success mb-6">
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">

          {/* Account Settings */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">

              <h2 className="card-title">
                Account Settings
              </h2>

              <p className="text-sm text-base-content/60 mb-4">
                Update your personal information.
              </p>

              <form
                onSubmit={handleProfileSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >

                {/* First Name */}
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
                    required
                  />
                </div>

                {/* Last Name */}
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
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      Email
                    </span>
                  </label>

                  <input
                    type="email"
                    value={user.emailId}
                    className="input input-bordered w-full"
                    disabled
                  />
                </div>

                {/* Age */}
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
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <Save size={18} />

                    {loading
                      ? 'Saving...'
                      : 'Save Changes'}
                  </button>
                </div>

              </form>

            </div>
          </section>

          {/* Change Password */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">

              <h2 className="card-title">
                Security
              </h2>

              <p className="text-sm text-base-content/60 mb-4">
                Change your account password.
              </p>

              <form
                onSubmit={handlePasswordSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >

                {/* Current Password */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      Current Password
                    </span>
                  </label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      New Password
                    </span>
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <Lock size={18} />

                    {loading
                      ? 'Changing...'
                      : 'Change Password'}
                  </button>
                </div>

              </form>

            </div>
          </section>

          {/* Appearance */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">

              <h2 className="card-title">
                Appearance
              </h2>

              <p className="text-sm text-base-content/60 mb-4">
                Choose how CodeNova looks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* System */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`btn h-auto py-4 flex flex-col gap-2 ${
                    theme === 'system'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Monitor size={22} />
                  <span>System</span>
                </button>

                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`btn h-auto py-4 flex flex-col gap-2 ${
                    theme === 'light'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Sun size={22} />
                  <span>Light</span>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`btn h-auto py-4 flex flex-col gap-2 ${
                    theme === 'dark'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  <Moon size={22} />
                  <span>Dark</span>
                </button>

              </div>

            </div>
          </section>

          {/* Danger Zone */}
          <section className="card bg-base-100 border border-error shadow-sm">
            <div className="card-body">

              <h2 className="card-title text-error">
                Danger Zone
              </h2>

              <p className="text-base-content/60">
                Permanently delete your CodeNova account.
                This action cannot be undone.
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn btn-error btn-outline"
                  disabled={loading}
                >
                  <Trash2 size={18} />
                  Delete Account
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