import { useEffect, useState } from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  useDispatch,
  useSelector
} from 'react-redux';
import {
  useNavigate,
  NavLink
} from 'react-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Code2,
  Sparkles,
  LogIn,
} from 'lucide-react';

import { loginUser } from '../authSlice';

const loginSchema = z.object({
  emailId: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading,
    error,
  } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailId: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300">

        {/* Left Branding */}
        <div className="hidden lg:flex bg-primary text-primary-content p-12 flex-col justify-between">

          <div>
            <NavLink
              to="/"
              className="inline-flex items-center gap-3 text-2xl font-bold"
            >
              <div className="p-2 rounded-xl bg-primary-content/15">
                <Code2 size={28} />
              </div>

              CodeNova
            </NavLink>

            <div className="mt-16 max-w-md">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4 opacity-90">
                <Sparkles size={18} />
                AI-powered coding practice
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                Sharpen your skills.
                <br />
                Build better code.
              </h1>

              <p className="mt-6 text-primary-content/80 text-lg leading-relaxed">
                Practice coding problems, test your solutions,
                track your progress, and prepare for your next
                technical interview.
              </p>
            </div>
          </div>

          <p className="text-sm text-primary-content/70">
            Practice. Solve. Improve.
          </p>
        </div>

        {/* Right Login */}
        <div className="p-6 sm:p-10 lg:p-12">

          {/* Back */}
          <div className="mb-8">
            <NavLink
              to="/"
              className="btn btn-ghost btn-sm gap-2"
            >
              <ArrowLeft size={18} />
              Back to Problems
            </NavLink>
          </div>

          {/* Mobile Brand */}
          <div className="lg:hidden mb-8">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-2xl font-bold"
            >
              <Code2 size={26} className="text-primary" />
              CodeNova
            </NavLink>

            <p className="text-sm text-base-content/60 mt-2">
              AI-powered coding practice platform
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <LogIn
                size={24}
                className="text-primary"
              />
            </div>

            <h2 className="text-3xl font-bold">
              Welcome back
            </h2>

            <p className="text-base-content/60 mt-2">
              Sign in to continue your coding journey.
            </p>
          </div>

          {/* Server Error */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>
                {error}
              </span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Email
                </span>
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className={`input input-bordered w-full ${
                  errors.emailId
                    ? 'input-error'
                    : ''
                }`}
                {...register('emailId')}
              />

              {errors.emailId && (
                <p className="text-error text-sm mt-2">
                  {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Password
                </span>
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  className={`input input-bordered w-full pr-12 ${
                    errors.password
                      ? 'input-error'
                      : ''
                  }`}
                  {...register('password')}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-error text-sm mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </button>

          </form>

          {/* Signup */}
          <div className="divider my-8">
            OR
          </div>

          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Don't have an account?
            </p>

            <NavLink
              to="/signup"
              className="btn btn-outline btn-primary w-full mt-3"
            >
              Create your CodeNova account
            </NavLink>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;