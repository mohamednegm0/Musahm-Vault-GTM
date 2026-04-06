import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './ForgotPassword.css';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

const ForgotPassword: React.FC = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return t('emailRequired');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('emailInvalid');
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error: string | undefined;

    if (name === 'email') {
      error = validateEmail(value);
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true });
    const emailError = validateEmail(formData.email);
    setErrors({ email: emailError });

    if (emailError) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword({ email: formData.email });

      if (response.isSucceeded) {
        success(response.successMessage || t('resetLinkSent'));
        // Redirect to reset password page with email param
        navigate(`/reset-password?email=${encodeURIComponent(formData.email)}`);
      } else {
        showError(response.errorMessage || t('error'));
      }
    } catch (error: any) {
      console.error('Error:', error);
      showError(error.message || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-validate fields when language changes
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    setErrors(prev => {
      const newErrors: FormErrors = { ...prev };

      Object.keys(touched).forEach(key => {
        const name = key;
        const value = formData[name as keyof FormData];
        let error: string | undefined;

        if (name === 'email') {
          error = validateEmail(value);
        }

        newErrors[name as keyof FormErrors] = error;
      });

      return newErrors;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div className="forgot-password-page">
      <button
        className="language-toggle"
        onClick={toggleLanguage}
      >
        <Languages size={20} />
        <span>{language === 'ar' ? 'EN' : 'ع'}</span>
      </button>

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <Link to="/login" className="back-link">
            <ArrowLeft size={20} />
            <span>{t('backToLogin')}</span>
          </Link>

          <div className="forgot-password-header">
            <h1>{t('forgotPasswordTitle')}</h1>
            <p>{t('forgotPasswordMessage')}</p>
          </div>

          <form onSubmit={handleSendEmail} className="forgot-password-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('email')}
              </label>
              <div className={`input-wrapper ${errors.email && touched.email ? 'error' : ''} ${!errors.email && touched.email && formData.email ? 'success' : ''}`}>
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
                />
                {!errors.email && touched.email && formData.email && (
                  <CheckCircle size={20} className="validation-icon success" />
                )}
                {errors.email && touched.email && (
                  <XCircle size={20} className="validation-icon error" />
                )}
              </div>
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('sending') : t('sendResetLink')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
