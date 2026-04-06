import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Languages, KeyRound, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './ForgotPassword.css'; // Reusing similar styles

interface FormData {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface FormErrors {
    email?: string;
    code?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

const ResetPassword: React.FC = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState<FormData>({
        email: searchParams.get('email') || '',
        code: searchParams.get('code') || '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email: string): string | undefined => {
        if (!email) return t('emailRequired');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return t('emailInvalid');
        return undefined;
    };

    const validateBaseFields = (name: string, value: string) => {
        if (name === 'email') return validateEmail(value);
        if (name === 'code' && !value.trim()) return t('verificationCodeRequired');
        return undefined;
    }

    const validatePassword = (password: string): string | undefined => {
        if (!password) return t('passwordRequired');
        if (password.length < 6) return t('passwordMinLoginLength');
        // Add more complex validation if needed based on requirements
        return undefined;
    };

    const validateConfirmPassword = (confirmPass: string, password: string): string | undefined => {
        if (!confirmPass) return t('confirmPasswordRequired');
        if (confirmPass !== password) return t('passwordsNotMatch');
        return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            if (name === 'newPassword') {
                setErrors(prev => ({ ...prev, newPassword: validatePassword(value) }));
                if (formData.confirmNewPassword) {
                    setErrors(prev => ({ ...prev, confirmNewPassword: validateConfirmPassword(formData.confirmNewPassword, value) }));
                }
            } else if (name === 'confirmNewPassword') {
                setErrors(prev => ({ ...prev, confirmNewPassword: validateConfirmPassword(value, formData.newPassword) }));
            } else {
                setErrors(prev => ({ ...prev, [name]: validateBaseFields(name, value) }));
            }
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        if (name === 'newPassword') {
            setErrors(prev => ({ ...prev, newPassword: validatePassword(value) }));
        } else if (name === 'confirmNewPassword') {
            setErrors(prev => ({ ...prev, confirmNewPassword: validateConfirmPassword(value, formData.newPassword) }));
        } else {
            setErrors(prev => ({ ...prev, [name]: validateBaseFields(name, value) }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all
        const emailError = validateEmail(formData.email);
        const codeError = !formData.code.trim() ? t('verificationCodeRequired') : undefined;
        const passwordError = validatePassword(formData.newPassword);
        const confirmError = validateConfirmPassword(formData.confirmNewPassword, formData.newPassword);

        const newErrors = {
            email: emailError,
            code: codeError,
            newPassword: passwordError,
            confirmNewPassword: confirmError
        };

        setErrors(newErrors);
        setTouched({ email: true, code: true, newPassword: true, confirmNewPassword: true });

        if (Object.values(newErrors).some(err => err !== undefined)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authService.resetPassword({
                email: formData.email,
                code: formData.code,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            });

            if (response.isSucceeded) {
                success(response.successMessage || t('passwordResetSuccess'));
                navigate('/login');
            } else {
                showError(response.errorMessage || t('passwordResetError'));
            }
        } catch (error: any) {
            showError(error.message || t('passwordResetError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const [countdown, setCountdown] = useState(30);

    // Re-validate fields when language changes
    useEffect(() => {
        if (Object.keys(touched).length === 0) return;

        setErrors(prev => {
            const newErrors: FormErrors = { ...prev };

            Object.keys(touched).forEach(key => {
                const name = key;
                const value = formData[name as keyof FormData];
                let error: string | undefined;

                if (name === 'newPassword') {
                    error = validatePassword(value);
                } else if (name === 'confirmNewPassword') {
                    error = validateConfirmPassword(value, formData.newPassword);
                } else {
                    error = validateBaseFields(name, value);
                }

                newErrors[name as keyof FormErrors] = error;
            });

            return newErrors;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendCode = async () => {
        if (!formData.email) return;

        try {
            const response = await authService.forgotPassword({ email: formData.email });
            if (response.isSucceeded) {
                success(t('resendCodeSent') || 'Verification code resent');
                setCountdown(30); // Reset timer
            } else {
                showError(response.errorMessage || t('error'));
            }
        } catch (error: any) {
            showError(error.message || t('error'));
        }
    };

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
                    <div className="forgot-password-header">
                        <h1>{t('resetPasswordTitle')}</h1>
                        <p>{t('resetPasswordMessage')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="forgot-password-form" noValidate>
                        {/* Email Field - Hidden */}
                        <input type="hidden" name="email" value={formData.email} />

                        {/* Code Field */}
                        <div className="form-group">
                            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label htmlFor="code" className="form-label" style={{ marginBottom: 0 }}>{t('verificationCode')}</label>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={countdown > 0}
                                    className="resend-code-btn"
                                >
                                    {countdown > 0 ? `(${countdown}s)` : t('resendCode')}
                                </button>
                            </div>
                            <div className={`input-wrapper ${errors.code && touched.code ? 'error' : ''}`}>
                                <KeyRound size={20} className="input-icon" />
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={t('enterVerificationCode')}
                                    className="form-input"
                                />
                            </div>
                            {errors.code && touched.code && <span className="error-message">{errors.code}</span>}
                        </div>

                        {/* New Password */}
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">{t('newPassword')}</label>
                            <div className={`input-wrapper ${errors.newPassword && touched.newPassword ? 'error' : ''}`}>
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={t('enterPassword')}
                                    className="form-input"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.newPassword && touched.newPassword && <span className="error-message">{errors.newPassword}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="confirmNewPassword" className="form-label">{t('confirmPassword')}</label>
                            <div className={`input-wrapper ${errors.confirmNewPassword && touched.confirmNewPassword ? 'error' : ''}`}>
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={t('enterConfirmPassword')}
                                    className="form-input"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-password">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmNewPassword && touched.confirmNewPassword && <span className="error-message">{errors.confirmNewPassword}</span>}
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? t('resettingPassword') : t('resetPassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
