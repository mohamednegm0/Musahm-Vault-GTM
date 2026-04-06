import React, { useEffect, useState, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';

interface JWTPayload {
  email?: string;
  unique_name?: string;
  nameid?: string;
  sub?: string;
  Id?: string;
  id?: string;
  [key: string]: any;
}

/**
 * TokenAuth Page
 *
 * هذه الصفحة تستقبل التوكن عن طريق Query String:
 *   window.location.href = '/auth?token=' + jwt;
 */
const TokenAuth: React.FC = () => {
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem('language') || 'ar'
  );
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processToken = () => {
      try {
        // ── Query String (?token=...) ──
        const queryParams = new URLSearchParams(window.location.search);
        let token: string | null = queryParams.get('token');

        // Check hash if not in search
        if (!token && window.location.hash) {
          const hashParam = new URLSearchParams(window.location.hash.replace(/^#\/?/, '?'));
          token = hashParam.get('token');
          if (!token && window.location.hash.startsWith('#token=')) {
            token = window.location.hash.replace('#token=', '');
          }
        }

        // ── MUS-707/713: Apply language from URL immediately (before any error returns) ──
        const langFromUrl = queryParams.get('lang');
        if (langFromUrl) {
          const normalizedLang = langFromUrl.toLowerCase().startsWith('ar') ? 'ar' : 'en';
          localStorage.setItem('language', normalizedLang);
          document.documentElement.dir = normalizedLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = normalizedLang;
          setLanguageState(normalizedLang);
        }

        // Helper: resolve "is Arabic" right now for error messages
        const currentLang = langFromUrl
          ? (langFromUrl.toLowerCase().startsWith('ar') ? 'ar' : 'en')
          : (localStorage.getItem('language') || 'ar');
        const isAr = currentLang === 'ar';

        // امسح التوكن من الـ URL فورًا عشان ميظهرش في الـ history
        if (token) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (!token) {
          setErrorMessage(isAr ? 'لم يتم العثور على رمز المصادقة.' : 'No authentication token found.');
          setStatus('error');
          return;
        }

        // ── فكّ التوكن واستخراج الإيميل ──
        let email = '';
        let userId = '';
        let langFromToken = '';
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          email = decoded.Email;
          userId = decoded.Id || '';

          // ── MUS-707: استخراج اللغة من التوكن ──
          langFromToken = decoded.lang || decoded.Language || '';
        } catch (decodeErr) {
          setErrorMessage(isAr ? 'صيغة الرمز غير صالحة.' : 'Invalid token format.');
          setStatus('error');
          return;
        }

        if (!email) {
          setErrorMessage(isAr ? 'الرمز لا يحتوي على بريد إلكتروني صالح.' : 'Token does not contain a valid email.');
          setStatus('error');
          return;
        }

        // ── MUS-707: Apply token language if URL didn't set one ──
        if (!langFromUrl && langFromToken) {
          const normalizedLang = langFromToken.toLowerCase().startsWith('ar') ? 'ar' : 'en';
          localStorage.setItem('language', normalizedLang);
          document.documentElement.dir = normalizedLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = normalizedLang;
          setLanguageState(normalizedLang);
        }

        // ── تسجيل التوكن (نفس اللي بيعمله اللوجن) ──
        // login() بتحفظ في localStorage: authToken + userEmail
        login(email, token);

        // حفظ userId في sessionStorage زي اللوجن بالظبط
        if (userId) {
          sessionStorage.setItem('userId', userId);
        }

        setStatus('success');

        // ── التحويل للصفحة الرئيسية ──
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (err) {
        console.error('TokenAuth error:', err);
        const lang = localStorage.getItem('language') || 'ar';
        setErrorMessage(lang === 'ar' ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');
        setStatus('error');
      }
    };

    processToken();
  }, [login]);

  const isArabic = language === 'ar';

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes vault-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vault-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner} />
            <p style={styles.text}>
              {isArabic ? 'جاري التحقق...' : 'Authenticating...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={styles.text}>
              {isArabic ? 'تم تسجيل الدخول! جاري التحويل...' : 'Login successful! Redirecting...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p style={styles.errorText}>{errorMessage}</p>
            <a href="/login" style={styles.link}>
              {isArabic ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
            </a>
          </>
        )}
      </div>
    </div>
  );
};

// ── Brand-aligned styles (Musahm gold: #c3924d) ──
const BRAND_GOLD = '#c3924d';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#faf9f7',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '56px 48px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 4px 24px rgba(195, 146, 77, 0.10), 0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid rgba(195, 146, 77, 0.15)',
    animation: 'vault-fade-in 0.3s ease-out',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f0e6d6',
    borderTopColor: BRAND_GOLD,
    borderRadius: '50%',
    animation: 'vault-spin 0.8s linear infinite',
  },
  successIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(34, 197, 94, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(220, 38, 38, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 500,
    margin: 0,
  },
  errorText: {
    color: '#dc2626',
    fontSize: '15px',
    margin: 0,
    textAlign: 'center',
  },
  link: {
    marginTop: '4px',
    color: BRAND_GOLD,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
};

export default TokenAuth;
