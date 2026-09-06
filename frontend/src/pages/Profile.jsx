import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import {
  User,
  Lock,
  Trash2,
  Save,
  ArrowLeft
} from "lucide-react";

import {
  updateProfile,
  changePassword,
  deleteProfile
} from "../authSlice";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    age: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || ""
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const result = await dispatch(updateProfile(profileForm));

    if (updateProfile.fulfilled.match(result)) {
      setMessage("Profile updated successfully.");
    } else {
      setError(
        result.payload?.message ||
        "Unable to update profile."
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const result = await dispatch(changePassword(passwordForm));

    if (changePassword.fulfilled.match(result)) {
      setMessage("Password changed successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: ""
      });
    } else {
      setError(
        result.payload?.message ||
        "Unable to change password."
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const result = await dispatch(deleteProfile());

    if (deleteProfile.fulfilled.match(result)) {
      navigate("/signup");
    } else {
      setError(
        result.payload?.message ||
        "Unable to delete profile."
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">

      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl font-bold"
          >
            CodeNova
          </NavLink>
        </div>

        <NavLink
          to="/dashboard"
          className="btn btn-ghost"
        >
          <ArrowLeft size={18} />
          Dashboard
        </NavLink>
      </div>

      <main className="max-w-5xl mx-auto p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Profile & Settings
          </h1>

          <p className="text-base-content/60 mt-2">
            Manage your account information and security.
          </p>
        </div>

        {message && (
          <div className="alert alert-success mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Profile */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">

              <div className="flex items-center gap-3 mb-4">
                <User size={22} />
                <h2 className="card-title">
                  Profile Information
                </h2>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="space-y-4"
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
                    value={user.emailId}
                    className="input input-bordered w-full"
                    disabled
                  />
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
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  <Save size={18} />

                  {loading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </form>
            </div>
          </div>

          {/* Password */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">

              <div className="flex items-center gap-3 mb-4">
                <Lock size={22} />

                <h2 className="card-title">
                  Change Password
                </h2>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >

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
                    className="input input-bordered w-full"
                    minLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  <Lock size={18} />

                  {loading
                    ? "Changing..."
                    : "Change Password"}
                </button>

              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="card bg-base-100 shadow lg:col-span-2">
            <div className="card-body">

              <h2 className="card-title">
                Account Information
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">
                    Role
                  </div>

                  <div className="stat-value text-lg capitalize">
                    {user.role}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">
                    Email
                  </div>

                  <div className="stat-value text-lg break-all">
                    {user.emailId}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">
                    User ID
                  </div>

                  <div className="stat-value text-sm break-all">
                    {user._id}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Danger Zone */}
          <div className="card bg-base-100 shadow border border-error lg:col-span-2">
            <div className="card-body">

              <h2 className="card-title text-error">
                Danger Zone
              </h2>

              <p className="text-base-content/70">
                Permanently delete your CodeNova account.
                This action cannot be undone.
              </p>

              <button
                type="button"
                className="btn btn-error btn-outline mt-4 w-fit"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                <Trash2 size={18} />
                Delete Account
              </button>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Profile;