import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Lock } from '@phosphor-icons/react';
import { useAuth, NotAdminError } from '@/auth/AuthContext';
import { Logo } from '@/components/Logo';
import { Input, Label } from '@/components/ui/Input';
import { errorMessage } from '@/lib/api';
import i18n from '@/i18n';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      // App router redirects on profile change.
    } catch (err) {
      if (err instanceof NotAdminError) setError(t('login.notAdmin'));
      else {
        const msg = errorMessage(err);
        setError(/invalid|credential|password|unauthor/i.test(msg) ? t('login.badCreds') : msg);
      }
    } finally {
      setBusy(false);
    }
  }

  const toggleLang = () => void i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-base px-4">
      {/* soft yellow spotlight — the one indulgence */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 50% -10%, rgba(255,230,4,0.10), transparent 60%), radial-gradient(40rem 30rem at 80% 110%, rgba(255,230,4,0.05), transparent 60%)',
        }}
      />

      <button
        onClick={toggleLang}
        className="fixed end-5 top-5 z-10 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        {i18n.language === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="bezel">
          <div className="bezel-core p-8">
            <div className="mb-7 flex flex-col items-center text-center">
              <Logo wordmark={false} size={52} />
              <h1 className="mt-5 font-brand text-2xl text-ink">{t('login.title')}</h1>
              <p className="mt-1.5 text-sm text-ink-muted">{t('login.subtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@promoo.app"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('login.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <p className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent font-semibold text-black transition-[transform,opacity] duration-200 hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
              >
                {busy ? t('login.signingIn') : t('login.submit')}
                {!busy ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">
                    <ArrowRight size={14} weight="bold" />
                  </span>
                ) : null}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint">
          <Lock size={12} />
          {t('login.footer')}
        </p>
      </div>
    </div>
  );
}
