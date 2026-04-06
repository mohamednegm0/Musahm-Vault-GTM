import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, Languages, Building2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService, RegisterRequest } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './Registration.css';

interface FormData {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  companyNameAr: string;
  companyNameEn: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullNameAr?: string;
  fullNameEn?: string;
  email?: string;
  companyNameAr?: string;
  companyNameEn?: string;
  password?: string;
  confirmPassword?: string;
}

type EmailCheckStatus = 'idle' | 'checking' | 'exists' | 'available';

const Registration: React.FC = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState<FormData>({
    fullNameAr: '',
    fullNameEn: '',
    email: '',
    companyNameAr: '',
    companyNameEn: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Email existence check state
  const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>('idle');
  const emailCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedEmail = useRef<string>('');

  const userExists = emailCheckStatus === 'exists';

  // ── Validators ──────────────────────────────────────────────────────────────
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  const englishRegex = /^[a-zA-Z0-9\s\-\.,'\&]+$/;

  const validateFullNameAr = (name: string): string | undefined => {
    if (!name.trim()) return t('fullNameArRequired');
    if (name.trim().length < 2) return t('nameMinLength');
    if (!arabicRegex.test(name)) return t('mustBeArabic') || 'Must be in Arabic';
    return undefined;
  };

  const validateFullNameEn = (name: string): string | undefined => {
    if (!name.trim()) return t('fullNameEnRequired');
    if (name.trim().length < 2) return t('nameMinLength');
    if (!englishRegex.test(name)) return t('mustBeEnglish');
    if (/[\u0600-\u06FF]/.test(name)) return t('mustBeEnglish');
    return undefined;
  };

  const validateCompanyNameAr = (name: string): string | undefined => {
    if (!name.trim()) return t('companyNameArRequired');
    if (name.trim().length < 2) return t('nameMinLength');
    if (!arabicRegex.test(name)) return t('mustBeArabic') || 'Must be in Arabic';
    return undefined;
  };

  const validateCompanyNameEn = (name: string): string | undefined => {
    if (!name.trim()) return t('companyNameEnRequired');
    if (name.trim().length < 2) return t('nameMinLength');
    if (!englishRegex.test(name)) return t('mustBeEnglish') || 'Must be in English';
    if (/[\u0600-\u06FF]/.test(name)) return t('mustBeEnglish') || 'Must be in English';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return t('emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('emailInvalid');
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return t('passwordRequired');
    if (password.length < 8) return t('passwordMinLength');
    if (!/(?=.*[a-z])/.test(password)) return t('passwordLowercase');
    if (!/(?=.*[A-Z])/.test(password)) return t('passwordUppercase');
    if (!/(?=.*\d)/.test(password)) return t('passwordNumber');
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return t('confirmPasswordRequired');
    if (confirmPassword !== password) return t('passwordsNotMatch');
    return undefined;
  };

  // ── Email existence check ───────────────────────────────────────────────────
  const triggerEmailCheck = async (email: string) => {
    const emailError = validateEmail(email);
    if (emailError || !email) {
      setEmailCheckStatus('idle');
      return;
    }

    // Avoid re-checking the same email
    if (email === lastCheckedEmail.current && emailCheckStatus !== 'idle') return;

    setEmailCheckStatus('checking');
    lastCheckedEmail.current = email;

    try {
      const result = await authService.checkEmailExists(email);
      if (result.exists) {
        setEmailCheckStatus('exists');
        if (result.userData) {
          setFormData(prev => ({
            ...prev,
            fullNameAr: result.userData?.nameAr || '',
            fullNameEn: result.userData?.nameEn || '',
            password: 'Usr.123456',
            confirmPassword: 'Usr.123456'
          }));

          setTouched(prev => ({
            ...prev,
            fullNameAr: true,
            fullNameEn: true,
            companyNameAr: true,
            companyNameEn: true
          }));
        }
      } else {
        setEmailCheckStatus('available');
        // Reset personal data fields only — preserve company names
        setFormData(prev => ({
          ...prev,
          fullNameAr: '',
          fullNameEn: '',
          password: '',
          confirmPassword: ''
        }));
        setTouched({ email: true });
        setErrors({ email: undefined });
      }
    } catch {
      setEmailCheckStatus('idle');
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');

    if (name === 'email') {
      // Reset check when email changes
      setEmailCheckStatus('idle');
      lastCheckedEmail.current = '';
    }

    if (touched[name]) {
      validateFieldInState(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateFieldInState(name, value);

    if (name === 'email') {
      // Debounced check
      if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
      emailCheckTimeout.current = setTimeout(() => {
        triggerEmailCheck(value.trim());
      }, 300);
    }
  };

  const validateFieldInState = (name: string, value: string) => {
    let error: string | undefined;
    switch (name) {
      case 'fullNameAr': error = userExists ? undefined : validateFullNameAr(value); break;
      case 'fullNameEn': error = userExists ? undefined : validateFullNameEn(value); break;
      case 'email': error = validateEmail(value); break;
      case 'companyNameAr': error = validateCompanyNameAr(value); break;
      case 'companyNameEn': error = validateCompanyNameEn(value); break;
      case 'password':
        error = validatePassword(value);
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword': error = validateConfirmPassword(value, formData.password); break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    setTouched({
      fullNameAr: true, fullNameEn: true, email: true,
      companyNameAr: true, companyNameEn: true, password: true, confirmPassword: true
    });

    const newErrors: FormErrors = {
      fullNameAr: userExists ? undefined : validateFullNameAr(formData.fullNameAr),
      fullNameEn: userExists ? undefined : validateFullNameEn(formData.fullNameEn),
      email: validateEmail(formData.email),
      companyNameAr: validateCompanyNameAr(formData.companyNameAr),
      companyNameEn: validateCompanyNameEn(formData.companyNameEn),
      password: userExists ? undefined : validatePassword(formData.password),
      confirmPassword: userExists ? undefined : validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== undefined)) return;

    setIsSubmitting(true);
    try {
      const payload: RegisterRequest = {
        fullNameAr: formData.fullNameAr.trim(),
        fullNameEn: formData.fullNameEn.trim(),
        email: formData.email.trim(),
        companyNameAr: formData.companyNameAr.trim(),
        companyNameEn: formData.companyNameEn.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const response = await authService.register(payload);

      if (response.isSucceeded && response.apiStatusCode === 200) {
        success(response.successMessage || t('registrationSuccess'));
        navigate('/login');
      } else {
        const errorMsg = response.errorMessage || t('registrationError');
        setSubmitError(errorMsg);
        showError(errorMsg);
      }
    } catch (err: any) {
      const errorMessage = err.message || t('registrationError');
      setSubmitError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: '', color: '', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 2) return { strength: t('weak'), color: '#ef4444', width: '33%' };
    if (score <= 3) return { strength: t('medium'), color: '#f59e0b', width: '66%' };
    return { strength: t('strong'), color: '#10b981', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Re-validate touched fields on language switch
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setErrors(prev => {
      const newErrors: FormErrors = { ...prev };
      Object.keys(touched).forEach(key => {
        const name = key;
        const value = formData[name as keyof FormData];
        let error: string | undefined;
        switch (name) {
          case 'fullNameAr': error = userExists ? undefined : validateFullNameAr(value); break;
          case 'fullNameEn': error = userExists ? undefined : validateFullNameEn(value); break;
          case 'email': error = validateEmail(value); break;
          case 'companyNameAr': error = validateCompanyNameAr(value); break;
          case 'companyNameEn': error = validateCompanyNameEn(value); break;
          case 'password': error = userExists ? undefined : validatePassword(value); break;
          case 'confirmPassword': error = userExists ? undefined : validateConfirmPassword(value, formData.password); break;
        }
        newErrors[name as keyof FormErrors] = error;
      });
      return newErrors;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ── Email status indicator inside input ─────────────────────────────────────
  const emailStatusIcon = () => {
    if (emailCheckStatus === 'checking') {
      return <Loader2 size={15} className="email-spin-icon" />;
    }
    if (emailCheckStatus === 'exists') {
      return <CheckCircle size={20} className="validation-icon success" />;
    }
    if (emailCheckStatus === 'available' && formData.email) {
      return <CheckCircle size={20} className="validation-icon success" />;
    }
    if (errors.email && touched.email) {
      return <XCircle size={20} className="validation-icon error" />;
    }
    if (!errors.email && touched.email && formData.email) {
      return <CheckCircle size={20} className="validation-icon success" />;
    }
    return null;
  };

  const inputWrapperClass = (field: keyof FormErrors, extraOverride?: 'error' | 'success') => {
    if (extraOverride) return `input-wrapper ${extraOverride}`;
    const hasError = !!errors[field] && !!touched[field];
    const hasSuccess = !errors[field] && !!touched[field] && !!formData[field as keyof FormData];
    return `input-wrapper${hasError ? ' error' : ''}${hasSuccess ? ' success' : ''}`;
  };

  const emailWrapperClass = () => {
    if (emailCheckStatus === 'exists') return 'input-wrapper success';
    if (emailCheckStatus === 'available') return 'input-wrapper success';
    const hasError = !!errors.email && !!touched.email;
    const hasSuccess = !errors.email && !!touched.email && !!formData.email;
    return `input-wrapper${hasError ? ' error' : ''}${hasSuccess ? ' success' : ''}`;
  };

  return (
    <div className="registration-page">
      <button className="language-toggle" onClick={toggleLanguage}>
        <Languages size={20} />
        <span>{language === 'ar' ? 'EN' : 'ع'}</span>
      </button>

      <div className="registration-container">
        <div className="registration-card">
          <div className="registration-header">
            <h1>{t('createAccount')}</h1>
            <p>{t('signUpMessage')}</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form" noValidate>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 1 — Personal Data
            ══════════════════════════════════════════════════════════════ */}
            <div className="form-section">
              <h2 className="form-section-title">
                <User size={18} className="section-title-icon" />
                {t('personalData') || 'Personal Data'}
              </h2>

              {/* Email — first field in this section */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t('email')}
                </label>
                <div className={emailWrapperClass()}>
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t('enterEmail')}
                    className="form-input"
                    autoComplete="email"
                  />
                  {/* Spinner / status icon lives inside the input wrapper */}
                  {emailStatusIcon()}
                </div>
                {errors.email && touched.email && emailCheckStatus !== 'exists' && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Full Name Row — second in this section */}
              <div className="form-row">
                {/* Full Name Arabic */}
                <div className="form-group">
                  <label htmlFor="fullNameAr" className="form-label">
                    {t('fullNameAr')}
                  </label>
                  <div className={inputWrapperClass('fullNameAr')}>
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="fullNameAr"
                      name="fullNameAr"
                      value={formData.fullNameAr}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('enterFullNameAr')}
                      className="form-input"
                      disabled={userExists}
                    />
                    {!errors.fullNameAr && touched.fullNameAr && formData.fullNameAr && (
                      <CheckCircle size={20} className="validation-icon success" />
                    )}
                    {errors.fullNameAr && touched.fullNameAr && (
                      <XCircle size={20} className="validation-icon error" />
                    )}
                  </div>
                  {errors.fullNameAr && touched.fullNameAr && (
                    <span className="error-message">{errors.fullNameAr}</span>
                  )}
                </div>

                {/* Full Name English */}
                <div className="form-group">
                  <label htmlFor="fullNameEn" className="form-label">
                    {t('fullNameEn')}
                  </label>
                  <div className={inputWrapperClass('fullNameEn')}>
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="fullNameEn"
                      name="fullNameEn"
                      value={formData.fullNameEn}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('enterFullNameEn')}
                      className="form-input"
                      disabled={userExists}
                    />
                    {!errors.fullNameEn && touched.fullNameEn && formData.fullNameEn && (
                      <CheckCircle size={20} className="validation-icon success" />
                    )}
                    {errors.fullNameEn && touched.fullNameEn && (
                      <XCircle size={20} className="validation-icon error" />
                    )}
                  </div>
                  {errors.fullNameEn && touched.fullNameEn && (
                    <span className="error-message">{errors.fullNameEn}</span>
                  )}
                </div>
              </div>

              {/* Password Row — hidden when user already exists */}
              {!userExists && (
                <div className="form-row">
                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      {t('password')}
                    </label>
                    <div className={inputWrapperClass('password')}>
                      <Lock size={20} className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('enterPassword')}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="toggle-password"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                          />
                        </div>
                        {passwordStrength.strength && (
                          <span className="strength-text" style={{ color: passwordStrength.color }}>
                            {passwordStrength.strength}
                          </span>
                        )}
                      </div>
                    )}
                    {errors.password && touched.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      {t('confirmPassword')}
                    </label>
                    <div className={inputWrapperClass('confirmPassword')}>
                      <Lock size={20} className="input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('enterConfirmPassword')}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="toggle-password"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {!errors.confirmPassword && touched.confirmPassword && formData.confirmPassword && (
                        <CheckCircle size={20} className="validation-icon success" />
                      )}
                      {errors.confirmPassword && touched.confirmPassword && (
                        <XCircle size={20} className="validation-icon error" />
                      )}
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <span className="error-message">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 2 — Company Information
            ══════════════════════════════════════════════════════════════ */}
            <div className="form-section">
              <h2 className="form-section-title">
                <Building2 size={18} className="section-title-icon" />
                {t('companyInfo') || 'Company Information'}
              </h2>

              <div className="form-row">
                {/* Company Name Arabic */}
                <div className="form-group">
                  <label htmlFor="companyNameAr" className="form-label">
                    {t('companyNameAr')}
                  </label>
                  <div className={inputWrapperClass('companyNameAr')}>
                    <Building2 size={20} className="input-icon" />
                    <input
                      type="text"
                      id="companyNameAr"
                      name="companyNameAr"
                      value={formData.companyNameAr}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('enterCompanyNameAr')}
                      className="form-input"
                    />
                    {!errors.companyNameAr && touched.companyNameAr && formData.companyNameAr && (
                      <CheckCircle size={20} className="validation-icon success" />
                    )}
                    {errors.companyNameAr && touched.companyNameAr && (
                      <XCircle size={20} className="validation-icon error" />
                    )}
                  </div>
                  {errors.companyNameAr && touched.companyNameAr && (
                    <span className="error-message">{errors.companyNameAr}</span>
                  )}
                </div>

                {/* Company Name English */}
                <div className="form-group">
                  <label htmlFor="companyNameEn" className="form-label">
                    {t('companyNameEn')}
                  </label>
                  <div className={inputWrapperClass('companyNameEn')}>
                    <Building2 size={20} className="input-icon" />
                    <input
                      type="text"
                      id="companyNameEn"
                      name="companyNameEn"
                      value={formData.companyNameEn}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('enterCompanyNameEn')}
                      className="form-input"
                    />
                    {!errors.companyNameEn && touched.companyNameEn && formData.companyNameEn && (
                      <CheckCircle size={20} className="validation-icon success" />
                    )}
                    {errors.companyNameEn && touched.companyNameEn && (
                      <XCircle size={20} className="validation-icon error" />
                    )}
                  </div>
                  {errors.companyNameEn && touched.companyNameEn && (
                    <span className="error-message">{errors.companyNameEn}</span>
                  )}
                </div>
              </div>
            </div>



            {/* ── Submit ──────────────────────────────────────────────────── */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || emailCheckStatus === 'checking'}
            >
              {isSubmitting ? t('registering') : t('register')}
            </button>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="form-footer">
              <span>{t('alreadyHaveAccount')}</span>
              <Link to="/login" className="login-link">{t('login')}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
