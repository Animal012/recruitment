import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

const INPUT = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function AccountSettings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    new_password: '',
    new_password2: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrors({});
    try {
      const data = await apiJson('/api/auth/settings/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setUser((u) => ({ ...u, username: data.username, email: data.email }));
      setForm((f) => ({ ...f, current_password: '', new_password: '', new_password2: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Настройки аккаунта</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Логин и почта */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Данные аккаунта</h2>
          <Field label="Логин" error={errors.username}>
            <input value={form.username} onChange={set('username')} className={INPUT} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} className={INPUT} />
          </Field>
        </div>

        {/* Смена пароля */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Смена пароля</h2>
          <p className="text-xs text-slate-400">Заполните только если хотите сменить пароль</p>
          <Field label="Новый пароль" error={errors.new_password}>
            <input type="password" value={form.new_password} onChange={set('new_password')} className={INPUT} autoComplete="new-password" />
          </Field>
          <Field label="Повторите новый пароль" error={errors.new_password2}>
            <input type="password" value={form.new_password2} onChange={set('new_password2')} className={INPUT} autoComplete="new-password" />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Сохранено
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
