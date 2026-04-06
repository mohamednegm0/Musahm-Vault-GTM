import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { profileService } from '../services/profileService';
import { useToast } from '../contexts/ToastContext';
import './ChangePassword.css';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

const ChangePassword: React.FC = () => {
  const { t, language } = useLanguage();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 1) {
      return { score, text: t('weak'), color: '#ef4444' };
    } else if (score <= 3) {
      return { score, text: t('medium'), color: '#f59e0b' };
    } else {
      return { score, text: t('strong'), color: '#10b981' };
    }
  };

  const validateCurrentPassword = (password: string): string | undefined => {
    if (!password) {
      return t('passwordRequired');
    }
    return undefined;
  };

  const validateNewPassword = (password: string): string | undefined => {
    if (!password) {
      return t('passwordRequired');
    }
    if (password.length < 8) {
      return t('passwordMinLength');
    }
    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }
    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }
    if (!/\d/.test(password)) {
      return t('passwordNumber');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return t('passwordSpecialChar');
    }
    return undefined;
  };

  const validateConfirmPassword = (confirm: string): string | undefined => {
    if (!confirm) {
      return t('confirmPasswordRequired');
    }
    if (confirm !== formData.newPassword) {
      return t('passwordsNotMatch');
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

    switch (name) {
      case 'currentPassword':
        error = validateCurrentPassword(value);
        break;
      case 'newPassword':
        error = validateNewPassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value);
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.currentPassword = validateCurrentPassword(formData.currentPassword);
    newErrors.newPassword = validateNewPassword(formData.newPassword);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);

    setErrors(newErrors);
    return !newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show errors even if not visited
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });

    if (!validateForm()) {
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      showError(t('passwordSameAsOld') || 'كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await profileService.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.isSucceeded) {
        success(response.successMessage || t('passwordChangeSuccess') || 'تم تغيير كلمة المرور بنجاح!');

        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        setTouched({});
      } else {
        showError(response.errorMessage || t('passwordChangeError') || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (error: any) {
      showError(error.message || t('passwordChangeError') || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  // Re-validate fields when language changes
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    setErrors(prev => {
      const newErrors: FormErrors = { ...prev };

      Object.keys(touched).forEach(key => {
        const name = key;
        const value = formData[name as keyof FormData];
        let error: string | undefined;

        switch (name) {
          case 'currentPassword':
            error = validateCurrentPassword(value);
            break;
          case 'newPassword':
            error = validateNewPassword(value);
            break;
          case 'confirmPassword':
            error = validateConfirmPassword(value);
            break;
        }

        newErrors[name as keyof FormErrors] = error;
      });

      return newErrors;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <div className="change-password-header-content">
          <h1>{t('changePassword') || 'تغيير كلمة المرور'}</h1>
          <p>{t('changePasswordMessage') || 'تحديث كلمة المرور الخاصة بك'}</p>
        </div>
      </div>

      <div className="change-password-content">
        <div className="change-password-card">
          <form onSubmit={handleSubmit} className="change-password-form">

            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">
                {t('currentPassword') || 'كلمة المرور الحالية'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('enterCurrentPassword') || 'أدخل كلمة المرور الحالية'}
                  className={`form - input ${errors.currentPassword && touched.currentPassword ? 'input-error' : ''} `}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && touched.currentPassword && (
                <div className="error-message">
                  <XCircle size={14} />
                  {errors.currentPassword}
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">
                {t('newPassword') || 'كلمة المرور الجديدة'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('enterNewPassword') || 'أدخل كلمة المرور الجديدة'}
                  className={`form - input ${errors.newPassword && touched.newPassword ? 'input-error' : ''} `}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && touched.newPassword && (
                <div className="error-message">
                  <XCircle size={14} />
                  {errors.newPassword}
                </div>
              )}

              {formData.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}% `,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    {t('passwordStrength')}: {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">
                {t('confirmPassword') || 'تأكيد كلمة المرور'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('confirmNewPassword') || 'أعد إدخال كلمة المرور الجديدة'}
                  className={`form - input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''} `}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="error-message">
                  <XCircle size={14} />
                  {errors.confirmPassword}
                </div>
              )}

              {formData.newPassword && formData.confirmPassword === formData.newPassword && (
                <div className="success-message">
                  <CheckCircle size={14} />
                  {t('passwordsMatch') || 'كلمات المرور متطابقة'}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? t('changingPassword') || 'جاري التغيير...' : t('updatePassword') || 'تحديث كلمة المرور'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
