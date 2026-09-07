import { useEffect, useState } from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useDispatch,useSelector} from 'react-redux';
import {useNavigate,NavLink} from 'react-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Code2,
  Sparkles,
  UserPlus,
} from 'lucide-react';

import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z
    .string()
    .min(3, 'First name must be at least 3 characters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters'),

  emailId: z
    .string()
    .email('Please enter a valid email address'),

  age: z
    .coerce
    .number()
    .int('Age must be a whole number')
    .min(13, 'Age must be at least 13')
    .max(120, 'Please enter a valid age'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

function Signup() {
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
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailId: '',
      age: '',
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
      await dispatch(registerUser(data)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300">

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
                Your coding journey
                <br />
                starts here.
              </h1>

              <p className="mt-6 text-primary-content/80 text-lg leading-relaxed">
                Solve real coding problems, learn from your
                mistakes, track your progress, and get ready
                for technical interviews.
              </p>

            </div>
          </div>

          <p className="text-sm text-primary-content/70">
            Practice. Solve. Improve.
          </p>

        </div>

        <div className="p-6 sm:p-10 lg:p-12">

          <div className="mb-8">
            <NavLink
              to="/"
              className="btn btn-ghost btn-sm gap-2"
            >
              <ArrowLeft size={18} />
              Back to Problems
            </NavLink>
          </div>

          <div className="lg:hidden mb-8">

            <NavLink
              to="/"
              className="flex items-center gap-2 text-2xl font-bold"
            >
              <Code2
                size={26}
                className="text-primary"
              />

              CodeNova
            </NavLink>

            <p className="text-sm text-base-content/60 mt-2">
              AI-powered coding practice platform
            </p>

          </div>

          <div className="mb-8">

            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <UserPlus
                size={24}
                className="text-primary"
              />
            </div>

            <h2 className="text-3xl font-bold">
              Create your account
            </h2>

            <p className="text-base-content/60 mt-2">
              Start solving problems with CodeNova.
            </p>

          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    First Name
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Priyanshu"
                  className={`input input-bordered w-full ${
                    errors.firstName
                      ? 'input-error'
                      : ''
                  }`}
                  {...register('firstName')}
                />

                {errors.firstName && (
                  <p className="text-error text-sm mt-2">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Last Name
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Yadav"
                  className={`input input-bordered w-full ${
                    errors.lastName
                      ? 'input-error'
                      : ''
                  }`}
                  {...register('lastName')}
                />

                {errors.lastName && (
                  <p className="text-error text-sm mt-2">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

            </div>

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

            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Age
                </span>
              </label>

              <input
                type="number"
                placeholder="21"
                min="13"
                max="120"
                className={`input input-bordered w-full ${
                  errors.age
                    ? 'input-error'
                    : ''
                }`}
                {...register('age')}
              />

              {errors.age && (
                <p className="text-error text-sm mt-2">
                  {errors.age.message}
                </p>
              )}
            </div>

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
                  placeholder="Minimum 8 characters"
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

          </form>

          <div className="divider my-8">
            OR
          </div>

          <div className="text-center">

            <p className="text-sm text-base-content/60">
              Already have an account?
            </p>

            <NavLink
              to="/login"
              className="btn btn-outline btn-primary w-full mt-3"
            >
              Login to CodeNova
            </NavLink>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;