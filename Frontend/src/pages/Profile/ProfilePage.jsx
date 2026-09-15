import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Lock, Mail, User } from 'lucide-react';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        const profile = response.data;
        setFormData({ username: profile.username || '', email: profile.email || '' });
        setImagePreview(profile.profileImage || null);
        updateUser(profile);
      } catch (error) {
        setFormData({ username: user?.username || '', email: user?.email || '' });
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePasswordChange = (event) => {
    setPasswordData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileImage) return;

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('profileImage', profileImage);
      const response = await authService.updateProfile(payload);
      updateUser(response.data);
      setProfileImage(null);
      setImagePreview(response.data.profileImage);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='max-w-2xl'>
      <div className='mb-6'>
        <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Profile</h1>
        <p className='text-sm text-slate-500'>Manage your account details.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 space-y-5'>
        <div className='flex items-center gap-4 pb-2'>
          <div className='relative'>
            {imagePreview ? (
              <img src={imagePreview} alt='Profile preview' className='h-20 w-20 rounded-full object-cover ring-4 ring-emerald-50' />
            ) : (
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-white ring-4 ring-emerald-50'>
                <User size={32} />
              </div>
            )}
            <label htmlFor='profileImage' className='absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md hover:bg-emerald-600'>
              <Camera size={15} />
              <input id='profileImage' type='file' accept='image/*' onChange={handleImageChange} className='sr-only' />
            </label>
          </div>
          <div>
            <h2 className='text-base font-semibold text-slate-900'>Profile picture</h2>
            <p className='mt-1 text-sm text-slate-500'>Choose an image up to 5MB.</p>
          </div>
        </div>

        <div>
          <label htmlFor='username' className='block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2'>Username</label>
          <div className='relative'>
            <User className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input id='username' name='username' value={formData.username} readOnly disabled={loading} className='w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl bg-slate-100 text-sm font-medium text-slate-600 cursor-not-allowed' />
          </div>
        </div>

        <div>
          <label htmlFor='email' className='block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2'>Email</label>
          <div className='relative'>
            <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input id='email' name='email' type='email' value={formData.email} readOnly disabled={loading} className='w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl bg-slate-100 text-sm font-medium text-slate-600 cursor-not-allowed' />
          </div>
        </div>

      
        <button type='submit' disabled={!profileImage || saving} className='inline-flex items-center gap-2 h-11 px-5 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed'>
          <Camera size={16} />
          {saving ? 'Saving...' : 'Save profile picture'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className='mt-6 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 space-y-5'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Change password</h2>
        
        </div>

        <div>
          <label htmlFor='currentPassword' className='block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2'>Current password</label>
          <div className='relative'>
            <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input id='currentPassword' name='currentPassword' type='password' value={passwordData.currentPassword} onChange={handlePasswordChange} disabled={saving} required className='w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60' />
          </div>
        </div>

        <div>
          <label htmlFor='newPassword' className='block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2'>New password</label>
          <div className='relative'>
            <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input id='newPassword' name='newPassword' type='password' value={passwordData.newPassword} onChange={handlePasswordChange} disabled={saving} required minLength={6} className='w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60' />
          </div>
        </div>

        <div>
          <label htmlFor='confirmPassword' className='block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2'>Confirm new password</label>
          <div className='relative'>
            <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input id='confirmPassword' name='confirmPassword' type='password' value={passwordData.confirmPassword} onChange={handlePasswordChange} disabled={saving} required minLength={6} className='w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60' />
          </div>
        </div>

        <button type='submit' disabled={saving} className='inline-flex items-center justify-center gap-2 h-11 px-5 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed'>
          <Lock size={16} />
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}

export default ProfilePage
