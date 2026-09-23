import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  PlusCircle, 
  Lock, 
  Shield, 
  Power, 
  Mail, 
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { usersApi } from '../api';
import { useAuth, useToast } from '../hooks';
import { Modal, Button, Input, PasswordInput } from '../components/common';

export default function UsersList() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.list({ limit: 100 });
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('ಬಳಕೆದಾರರ ಪಟ್ಟಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500">
          ಕೇವಲ ಮುಖ್ಯ ಆಡಳಿತಗಾರರಿಗೆ (Admin) ಮಾತ್ರ ಈ ಪುಟವನ್ನು ನೋಡಲು ಅನುಮತಿಯಿದೆ (403 Forbidden).
        </div>
      </AppLayout>
    );
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (newPassword.length < 8) {
      setCreateError('ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೮ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು');
      return;
    }

    setIsCreating(true);
    try {
      await usersApi.create({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole
      });
      toast.success(`'${newName}' ಸಂಪಾದಕರ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ`);
      setCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'ಖಾತೆ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (user) => {
    const nextStatus = user.is_active ? 0 : 1;
    const actionName = nextStatus ? 'ಸಕ್ರಿಯಗೊಳಿಸಲು' : 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು';
    if (!confirm(`'${user.name}' ಅವರ ಖಾತೆಯನ್ನು ${actionName} ಖಚಿತವೇ?`)) return;

    try {
      await usersApi.update(user.id, { is_active: nextStatus });
      toast.success(`ಖಾತೆಯ ಸ್ಥಿತಿ ಬದಲಾಗಿದೆ`);
      loadUsers();
    } catch (err) {
      toast.error('ಸ್ಥಿತಿ ಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPasswordVal.length < 8) {
      toast.warning('ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೮ ಅಕ್ಷರ ಹೊಂದಿರಬೇಕು');
      return;
    }

    setIsResetting(true);
    try {
      await usersApi.resetPassword(selectedUser.id, resetPasswordVal);
      toast.success(`'${selectedUser.name}' ಅವರಿಗೆ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಲಾಗಿದೆ`);
      setResetModalOpen(false);
      setResetPasswordVal('');
    } catch (err) {
      toast.error('ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲು ವಿಫಲವಾಗಿದೆ');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            ಸಂಪಾದಕರ ಮತ್ತು ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ (User Management)
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ಕಥಾ ಕೋಶದ ಸಂಪಾದಕೀಯ ಸಿಬ್ಬಂದಿ ಖಾತೆಗಳನ್ನು ರಚಿಸಿ, ನಿರ್ವಹಿಸಿ ಮತ್ತು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-kannada text-xs font-semibold shadow-md transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ಹೊಸ ಸಂಪಾದಕರು (Add Editor)</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200/80 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">ಹೆಸರು (Name)</th>
                <th className="py-3.5 px-4">ಇಮೇಲ್ (Email)</th>
                <th className="py-3.5 px-4">ಪಾತ್ರ (Role)</th>
                <th className="py-3.5 px-4">ಸ್ಥಿತಿ (Status)</th>
                <th className="py-3.5 px-4">ಕೊನೆಯ ಲಾಗಿನ್ (Last Login)</th>
                <th className="py-3.5 px-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    ದತ್ತಾಂಶ ಲೋಡ್ ಆಗುತ್ತಿದೆ...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    ಯಾವುದೇ ಬಳಕೆದಾರರು ಸಿಗಲಿಲ್ಲ
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        user.role === 'admin'
                          ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-gold-400 border border-primary-200 dark:border-slate-700'
                          : 'bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {user.is_active ? 'ಸಕ್ರಿಯ (Active)' : 'ನಿಷ್ಕ್ರಿಯ (Disabled)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'ಲಾಗಿನ್ ಆಗಿಲ್ಲ'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle active button */}
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.is_active ? 'ಖಾತೆ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ (Disable)' : 'ಖಾತೆ ಸಕ್ರಿಯಗೊಳಿಸಿ (Enable)'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Reset password button */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setResetPasswordVal('');
                            setResetModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-stone-100 transition-colors"
                          title="ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ (Reset password)"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="ಹೊಸ ಸಂಪಾದಕರ ಸೇರ್ಪಡೆ (Create User Account)"
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600">
              {createError}
            </div>
          )}

          <Input
            label="ಪೂರ್ಣ ಹೆಸರು (Full Name)"
            id="user-name"
            placeholder="ಉದಾ: ವೀಣಾ ಶಾಸ್ತ್ರಿ"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="ಇಮೇಲ್ ವಿಳಾಸ (Email)"
            id="user-email"
            type="email"
            placeholder="editor@katha-kosha.org"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <PasswordInput
            label="ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್ (Initial Password)"
            id="user-password"
            placeholder="ಕನಿಷ್ಠ ೮ ಅಕ್ಷರಗಳು"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              ಪಾತ್ರ (Role)
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="editor">Editor (ಸಂಪಾದಕರು - ಕಥೆ/ಸಾಹಿತಿ ರಚನೆ)</option>
              <option value="admin">Admin (ಮುಖ್ಯ ಆಡಳಿತಗಾರರು - ಪೂರ್ಣ ನಿಯಂತ್ರಣ)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              ರದ್ದು
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {isCreating ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'ಖಾತೆ ರಚಿಸಿ (Create Account)'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ: ${selectedUser?.name}`}
      >
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <PasswordInput
            label="ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (New Password)"
            id="reset-pass"
            placeholder="ಕನಿಷ್ಠ ೮ ಅಕ್ಷರಗಳು (1 number, 1 letter)"
            value={resetPasswordVal}
            onChange={(e) => setResetPasswordVal(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              ರದ್ದು
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {isResetting ? 'ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
