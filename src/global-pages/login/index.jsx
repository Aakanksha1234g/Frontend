import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@validations/loginSchema';
import { useNavigate } from 'react-router';
import { useUser } from '@shared/context/user-context';
import { setCookie, getDecodedCookie } from '@shared/utils/cookie-store';
import CloseEye from '@assets/icons/CloseEye.svg';
import OpenEye from '@assets/icons/OpenEye.svg';
import logo from '/logo.svg';
import { useMutation } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';
import { Link } from 'react-router';
import { useToast } from '@shared/Toast/ToastContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useUser();
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // TanStack Query mutation for login
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ email, password }) =>
      await sendData({
        endpoint: '/auth/login',
        method: 'POST',
        body: {
          user_email: email,
          user_password: password,
        },
        responseMessage: 'Login Successful',
      }),
    onSuccess: response => {
      // Store token in cookies
      const accessToken = response?.data?.response?.access_token;
      setCookie('auth_token', accessToken);

      // Decode JWT Token
      const decoded = getDecodedCookie(accessToken);

      // Extract user details
      const userData = {
        username: decoded?.user_name,
        email: decoded?.user_email,
        profileImage: response?.data?.response?.user_image,
      };

      // Store user in context
      dispatch({ type: 'SET_USER', payload: userData });
      setTimeout(() => {
        navigate('/home');
      }, 100);
    },
  });

  async function onSubmit(data) {
    loginMutation.mutate({ email: data.email, password: data.password });
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-primary-indigo-50">
      
      {/* {showAlert && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-50">
    <div className="flex justify-between items-center gap-4">
      <span>{alertMessage}</span>
      <button
        onClick={() => setShowAlert(false)}
        className="text-sm font-bold hover:text-red-900"
      >
        &times;
      </button>
    </div>
  </div>
)} */}

      <img
        src={logo}
        className="w-[auto] h-10 object-cover absolute top-10 right-10 md:h-8"
        alt="logo"
      />
      <div className="mx-auto w-full max-w-sm bg-white p-4 rounded-lg shadow-shadow-pop-up shadow-pop-up space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold ">Welcome back</h1>
          <p className="text-sm text-gray-500">Enter your email to sign in</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          role="form"
          aria-label="Login Form"
          className="flex flex-col space-y-4 p-4"
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 "
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter email address"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-red-500 text-sm" aria-live="assertive">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* Password Field */}
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
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <img
                    src={OpenEye}
                    className="h-4 w-4 text-gray-500 "
                    alt="Hide password"
                  />
                ) : (
                  <img
                    src={CloseEye}
                    className="h-4 w-4 text-gray-500"
                    alt="Show password"
                  />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm" aria-live="assertive">
                {errors.password.message}
              </p>
            )}
          </div>
          {loginMutation.isError && (
            <p className="text-red-500 text-sm" aria-live="assertive">
              {loginMutation.error.response.data.detail ||
                'Login failed. Please try again.'}
            </p>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            className="button-primary"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className=" hover:underline">
            <span className="text-gray-500">Create one</span>{' '}
          </Link>
          <br />
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>

        {/* Forgot Password */}
        {/* <div className="text-center">
                    <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Forgot your password?
                    </a>
                </div> */}
      </div>
    </div>
  );
}
