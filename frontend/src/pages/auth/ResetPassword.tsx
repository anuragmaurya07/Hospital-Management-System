import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import { FaHospitalAlt, FaLock, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) {
      toast.error('Token and new password are required');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ resetToken: token, newPassword: password });
      toast.success(res.data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white shadow-md mb-3">
            <FaHospitalAlt className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your reset token and new credentials</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <FormInput
            label="Reset Token"
            icon={FaKey}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <FormInput
            label="New Password"
            type="password"
            icon={FaLock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <FormInput
            label="Confirm Password"
            type="password"
            icon={FaLock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            Cancel and Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
