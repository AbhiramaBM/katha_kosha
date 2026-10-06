import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  PlusCircle, 
  Key, 
  Power, 
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { usersApi } from '../api';
import { useAuth, useToast, useLanguage } from '../hooks';
import { Modal, Button, Input, PasswordInput } from '../components/common';

export default function UsersList() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { lang, t } = useLanguage();

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
      toast.error(lang === 'kn' ? 'ಬಳಕೆದಾರರ ಪಟ್ಟಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to fetch users list');
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
        <div className="p-12 text-center text-slate-500 font-kannada">
          {lang === 'kn' ? 'ಕೇವಲ ಮುಖ್ಯ ಆಡಳಿತಗಾರರಿಗೆ (Admin) ಮಾತ್ರ ಈ ಪುಟವನ್ನು ನೋಡಲು ಅನುಮತಿಯಿದೆ.' : 'Only administrators are allowed to view this page.'}
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
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole
      });
      toast.success('ಹೊಸ ಬಳಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ');
      setCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      loadUsers();
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || 'ಬಳಕೆದಾರರನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.is_active ? 0 : 1;
    const actionLabel = nextStatus ? 'ಸಕ್ರಿಯಗೊಳಿಸಲು' : 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು';

    if (!confirm(`'${user.name}' ಖಾತೆಯನ್ನು ${actionLabel} ನೀವು ಖಚಿತವೇ?`)) return;

    try {
      await usersApi.update(user.id, { is_active: nextStatus });
      toast.success('ಖಾತೆಯ ಸ್ಥಿತಿ ಬದಲಾಗಿದೆ');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'ಸ್ಥಿತಿ ಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordVal || resetPasswordVal.length < 8) {
      toast.error('ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೮ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು');
      return;
    }

    setIsResetting(true);
    try {
      await usersApi.resetPassword(selectedUser.id, resetPasswordVal);
      toast.success(`'${selectedUser.name}' ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲಾಗಿದೆ`);
      setResetModalOpen(false);
      setResetPasswordVal('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('usersTitle')}
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('usersSubtitle')}
          </p>
        </div>

        <Button
          onClick={() => {
            setCreateError('');
            setCreateModalOpen(true);
          }}
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm"
        >
          {t('addNewUser')}
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-kannada text-xs">
            {t('loading')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-medium text-[11px] border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-kannada">{t('colUserName')}</th>
                  <th className="py-3 px-4 font-kannada">{t('colUserEmail')}</th>
                  <th className="py-3 px-4 font-kannada">{t('colUserRole')}</th>
                  <th className="py-3 px-4 font-kannada">{t('colUserStatus')}</th>
                  <th className="py-3 px-4 text-right font-kannada">{t('colUserActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {u.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-amber-400'
                          : u.role === 'user'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-stone-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role === 'admin' ? t('roleAdmin') : (u.role === 'user' ? t('roleReader') : t('roleEditor'))}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                        u.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {u.is_active ? t('activeStatus') : t('inactiveStatus')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setResetPasswordVal('');
                            setResetModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] transition-colors"
                          title={t('resetPasswordBtn')}
                        >
                          {t('resetPasswordBtn')}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title={u.is_active ? t('deactivateBtn') : t('activateBtn')}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={lang === 'kn' ? 'ಹೊಸ ಬಳಕೆದಾರ ಖಾತೆ ಸೇರಿಸಿ (Create User)' : 'Create New User Account'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label={t('fullNameLabel')}
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
          />

          <Input
            label={t('emailLabel')}
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="editor@example.com"
            required
          />

          <PasswordInput
            label={t('passwordLabel')}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {t('colUserRole')}
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="user">{lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಓದುಗರು (User - Read Only)' : 'Reader (Read Only)'}</option>
              <option value="editor">{lang === 'kn' ? 'ಸಂಪಾದಕರು (Editor - Create & Edit Stories)' : 'Editor (Create & Edit Stories)'}</option>
              <option value="admin">{lang === 'kn' ? 'ಆಡಳಿತಗಾರ (Admin - Full Control)' : 'Admin (Full Control)'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isCreating}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`${t('resetPasswordBtn')} - ${selectedUser?.name}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <PasswordInput
            label={lang === 'kn' ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (New Password) *' : 'New Password *'}
            id="resetPasswordVal"
            value={resetPasswordVal}
            onChange={(e) => setResetPasswordVal(e.target.value)}
            placeholder="Minimum 8 characters"
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isResetting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
