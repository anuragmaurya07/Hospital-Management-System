import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import { FaUserCircle, FaLock, FaSave, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile details updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both current and new passwords are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Security password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Profile & Security
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal medical staff/patient profile credentials and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-center flex flex-col items-center">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 shadow-md mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 font-extrabold text-3xl flex items-center justify-center mb-4">
              {user?.name?.charAt(0)}
            </div>
          )}

          <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
          <span className="text-xs text-slate-500 block">{user?.email}</span>

          <span className="inline-block mt-3 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-bold uppercase tracking-wider">
            {user?.role}
          </span>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FaUserCircle className="text-primary-600" /> Personal Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <FormInput
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Phone Number"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
                <FormInput
                  label="Avatar Image URL"
                  placeholder="https://..."
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm ml-auto disabled:opacity-50"
                >
                  <FaSave /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FaLock className="text-primary-600" /> Change Security Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormInput
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm ml-auto disabled:opacity-50"
                >
                  <FaShieldAlt /> {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
