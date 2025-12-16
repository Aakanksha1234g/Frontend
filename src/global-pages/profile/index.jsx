import React, { useState } from 'react';
import { useUser } from '@shared/context/user-context';
import Input from '@shared/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema } from '../../validations/editProfileSchema';
import { setCookie, getDecodedCookie } from '@shared/utils/cookie-store';
import Eye from '@assets/icons/EyeScan.svg';
import LeftIcon from '@assets/icons/left.svg';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { useNavigate } from 'react-router';
import profile from '/profile.jpg';
import { useMutation } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ProfilePage = () => {
  const { state, dispatch } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [imageError, setImageError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isChanged, setIsChanged] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors,
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: state?.username || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchedUsername = watch('username');
  const { oldPassword, newPassword, confirmPassword } = watch();

  const [formData, setFormData] = useState({
    email: state?.email || '',
    image: state?.profileImage
      ? `data:image/*;base64,${state.profileImage}`
      : profile,
  });

  const [initialData, setInitialData] = useState({
    username: state?.username || '',
    email: state?.email || '',
    image: state?.profileImage
      ? `data:image/*;base64,${state.profileImage}`
      : profile,
  });

  const handleFormChange = (field, value) => {
    if (field === 'username') {
      setValue('username', value, { shouldValidate: true, shouldDirty: true });
      setIsChanged(value !== initialData.username);
    } else {
      const updatedForm = { ...formData, [field]: value };
      setFormData(updatedForm);
      setIsChanged(updatedForm.image !== initialData.image);
    }
  };

  const handleImageUpload = file => {
    setImageError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => handleFormChange('image', reader.result);
    reader.readAsDataURL(file);
  };

  const updateMutation = useMutation({
    mutationKey: ['edit-profile'],
    mutationFn: async payload => {
      return await sendData({
        endpoint: '/edit_profile',
        method: 'PUT',
        body: payload,
        responseMessage: 'Profile updated successfully',
      });
    },
    onSuccess: (response, variables) => {
    
      const accessToken = response?.data?.access_token;

      if (!accessToken) {
        console.error('No access token received. Response data:', response?.data);
        return;
      }

      setCookie('auth_token', accessToken);
      const decoded = getDecodedCookie(accessToken);
 

      if (!decoded || !decoded.user_name) {
        console.error('Failed to decode token or missing user_name:', decoded);
        return;
      }

      const updatedImage = response?.data?.user_image || formData.image;

      dispatch({
        type: 'SET_USER',
        payload: {
          username: decoded.user_name,
          email: decoded.user_email,
          profileImage: updatedImage,
        },
      });

      setFormData(prev => ({
        ...prev,
        image: `data:image/*;base64,${updatedImage}`,
      }));
      setInitialData({
        username: decoded.user_name,
        email: decoded.user_email,
        image: `data:image/*;base64,${updatedImage}`,
      });
      setIsChanged(false);
      setIsEditing(false);
      setImageError('');

      if (variables.is_password_changed) {
        reset({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          username: decoded.user_name,
        });
        setShowPasswordForm(false);
        setPasswordError('');
      }
    },
    onError: (error, variables) => {
      const message = error.message || 'Update failed';
      if (variables.is_password_changed) {
        setPasswordError(message);
      } else {
        alert(message);
      }
    },
  });

  const updateProfile = async (isPasswordChange = false) => {
    let imageData = formData.image;
    if (!imageData.startsWith('data:image')) {
      const res = await fetch(imageData);
      const blob = await res.blob();
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const base64String = imageData.split(',')[1];
    const base64SizeInKB = (base64String.length * 3) / 4 / 1024;
    if (base64SizeInKB > 1024) {
      setImageError('Image is too large. Please upload a smaller image.');
      return;
    }

    const payload = {
      user_name: watchedUsername,
      user_email: formData.email,
      user_image: base64String,
      is_password_changed: isPasswordChange,
      old_password: oldPassword,
      new_password: newPassword,
    };

    updateMutation.mutate(payload);
  };

  const handleRemovePicture = () => {
    setFormData(prev => ({ ...prev, image: profile }));
    setIsChanged(true);
  };
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButtonWithTooltip
            tooltipText="Back to Home"
            imageUrl={LeftIcon}
            onClick={() => navigate('/home')}
          />
          <h2 className="text-2xl font-semibold">Profile</h2>
        </div>
        {!isEditing ? (
          <button
            className="button-primary"
            disabled={showPasswordForm}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="button-primary"
              onClick={handleSubmit(() => updateProfile(false))}
              disabled={!isChanged || !!imageError}
            >
              Save
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                setFormData(initialData);
                setValue('username', initialData.username);
                setIsEditing(false);
                setIsChanged(false);
                setImageError('');
                clearErrors();
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex flex-col items-center md:w-1/3 gap-4 p-4 border-r-2 border-gray-200">
          <img
            src={formData.image}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border border-gray-300 shadow"
          />
          {isEditing && (
            <div className="w-full text-center">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => handleImageUpload(e.target.files?.[0])}
              />
              {imageError && (
                <p className="text-red-500 text-xs mt-1">{imageError}</p>
              )}
            </div>
          )}
          {isEditing && (
            <button
              className="button-secondary"
              onClick={() => handleRemovePicture()}
            >
              {' '}
              Remove Photo
            </button>
          )}

          <p className="text-sm text-gray-600">{formData.email}</p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input
              type="text"
              disabled={!isEditing}
              {...register('username')}
              onChange={e => handleFormChange('username', e.target.value)}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <hr className="my-6 border-dashed border-t border-gray-300" />

          <details
            open={showPasswordForm}
            className="shadow-shadow-pop-up shadow-pop-up rounded-md p-4 bg-gray-50"
            onToggle={e => setShowPasswordForm(e.target.open)}
          >
            <summary className="cursor-pointer font-medium">
              {showPasswordForm ? 'Hide Password Change' : 'Change Password'}
            </summary>

            <form
              className="space-y-4 mt-4"
              onSubmit={handleSubmit(() => updateProfile(true))}
            >
              {['old', 'new', 'confirm'].map(key => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700">
                    {key === 'old'
                      ? 'Old Password'
                      : key === 'new'
                        ? 'New Password'
                        : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword[key] ? 'text' : 'password'}
                      {...register(`${key}Password`)}
                    />
                    <span
                      onClick={() =>
                        setShowPassword(prev => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="absolute right-3 top-2.5 cursor-pointer"
                    >
                      <img src={Eye} className="h-4 w-4" />
                    </span>
                  </div>
                  {errors[`${key}Password`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${key}Password`].message}
                    </p>
                  )}
                </div>
              ))}

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <div className="flex gap-4 pt-2">
                <button type="submit" className="button-primary">
                  Update Password
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    reset({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                      username: watchedUsername,
                    });
                    setPasswordError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
