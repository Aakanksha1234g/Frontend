import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../validations/signupSchema';
import { useNavigate, Link } from 'react-router';
import { useUser } from '@shared/context/user-context';
import { setCookie, getDecodedCookie } from '@shared/utils/cookie-store';
import { useMutation } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';
import CloseEye from '@assets/icons/CloseEye.svg';
import OpenEye from '@assets/icons/OpenEye.svg';

function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  error,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  const navigate = useNavigate();
  const { dispatch } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const signUpMutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: async ({ username, email, password }) =>
      await sendData({
        endpoint: '/auth/signup',
        method: 'POST',
        body: {
          user_name: username,
          user_email: email.toLowerCase(),
          user_password: password,
        },
        responseMessage: 'Signup Successful',
      }),
    onSuccess: response => {
      setMutationError(null);
      const accessToken = response?.data?.response?.access_token;
      setCookie('auth_token', accessToken);
      const decoded = getDecodedCookie(accessToken);
      const userData = {
        username: decoded?.user_name,
        email: decoded?.user_email,
        profileImage: response?.data?.response?.user_image,
      };
      dispatch({ type: 'SET_USER', payload: userData });
      navigate('/home', { replace: true, state: { fromSignup: true } });
    },
    onError: error => {
      setMutationError(
        error?.response?.data?.detail ||
          error?.message ||
          'An error occurred during signup.'
      );
    },
  });

  async function onSubmit(data) {
    setMutationError(null);
    signUpMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-primary-indigo-50">
      <div className="mx-auto w-full max-w-sm bg-white p-4 rounded-lg shadow-shadow-pop-up shadow-pop-up space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Register</h1>
          <p className="text-sm text-primary-gray-500">
            with Lorven Ai and start your journey
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-4 p-4"
          role="form"
        >
          <InputField
            id="username"
            label="Username"
            placeholder="Enter username"
            register={register('username')}
            error={errors.username}
            autoComplete="username"
          />

          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter email address"
            register={register('email')}
            error={errors.email}
            autoComplete="email"
          />

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <img
                  src={showPassword ? OpenEye : CloseEye}
                  className="h-5 w-5 text-gray-500"
                  alt="Toggle password visibility"
                  role="img"
                  aria-hidden="true"
                />
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Confirm password"
                aria-label="Confirm Password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? 'confirmPassword-error' : undefined
                }
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                <img
                  src={showConfirmPassword ? OpenEye : CloseEye}
                  className="h-5 w-5 text-gray-500"
                  alt="Toggle confirm password visibility"
                  role="img"
                  aria-hidden="true"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {mutationError && Object.keys(errors).length === 0 && (
            <p className="text-red-500 text-sm">{mutationError}</p>
          )}

          <button
            type="submit"
            className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={signUpMutation.isLoading}
          >
            {signUpMutation.isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm">
          Already have an account? <br />
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
