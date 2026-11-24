import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import { FaHospitalAlt, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.data.message || 'Reset token generated');
      if (res.data.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process request');
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
          <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {resetToken ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm space-y-3">
            <p className="font-semibold">Reset token generated for evaluation:</p>
            <div className="p-2 bg-white rounded border border-emerald-300 font-mono text-xs break-all">
              {resetToken}
            </div>
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="inline-block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              Proceed to Change Password &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Account Email"
              type="email"
              icon={FaEnvelope}
              placeholder="e.g. doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
            >
              {loading ? 'Sending...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <FaArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
