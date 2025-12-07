'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Camera, CheckCircle, XCircle, Upload, X } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newEmail: '',
    profile_image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        newEmail: '',
        profile_image: session.user.image || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setImagePreview(session.user.image || '');
      setLoading(false);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setImagePreview(data.url);
        setFormData(prev => ({ ...prev, profile_image: data.url }));
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        showToast('Current password is required to change password', 'error');
        return;
      }

      if (formData.newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showToast('Password confirmation does not match', 'error');
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: formData.name,
          newEmail: formData.newEmail || session.user.email,
          profile_image: formData.profile_image,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Profile updated successfully!', 'success');
        
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        if (formData.newEmail || formData.newPassword) {
          setTimeout(() => {
            showToast('Please login again with your new credentials', 'success');
            setTimeout(() => {
              signOut({ callbackUrl: '/login' });
            }, 2000);
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-10 pr-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your personal information and settings</p>
          </div>
        </div>

        {/* Profile Form */}
        <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture Section */}
            <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-transparent">
              <div className="relative inline-block">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 mx-auto shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-4xl text-white border-4 border-emerald-500 mx-auto shadow-lg font-bold">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-3 rounded-full cursor-pointer hover:bg-emerald-700 shadow-lg transition-all hover:scale-110">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {uploading && (
                <div className="mt-4 text-sm text-emerald-600 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>Uploading image...</span>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">Click camera icon to change profile picture</p>
              <p className="text-xs text-gray-400 mt-1">Maximum size: 5MB</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 text-emerald-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Your current email address</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      New Email (optional)
                    </label>
                    <input
                      type="email"
                      value={formData.newEmail}
                      onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      session?.user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-sky-100 text-sky-700'
                    }`}>
                      <User className="w-4 h-4" />
                      <span className="capitalize font-semibold">{session?.user?.role || 'user'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  Change Password
                </h3>
                <p className="text-sm text-gray-600">
                  Leave blank if you don't want to change password
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Min 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition shadow-sm hover:shadow-md"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Info Box */}
        <section className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
          <h3 className="font-semibold text-sky-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Important Notes
          </h3>
          <ul className="text-sm text-sky-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-sky-600 mt-0.5">•</span>
              <span>If you change your email or password, you'll need to login again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 mt-0.5">•</span>
              <span>Profile picture should be less than 5MB in size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 mt-0.5">•</span>
              <span>Password must be at least 6 characters long</span>
            </li>
          </ul>
        </section>

        <footer className="pt-60 text-sm text-gray-400 py-6">
          © {new Date().getFullYear()} Puskata — Profile Settings
        </footer>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}