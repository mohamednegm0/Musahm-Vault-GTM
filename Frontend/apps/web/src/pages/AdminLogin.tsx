import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, Languages, Building } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authService, GRCActiveCompany } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import SearchableSelect from '../components/SearchableSelect';
import './Login.css';

interface FormData {
    company: number | string;
    email: string;
    password: string;
}

interface FormErrors {
    company?: string;
    email?: string;
    password?: string;
}

// Local type for dropdown options
interface CompanyOption {
    id: number | string;
    name: string;
}

const AdminLogin: React.FC = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const { login, logout } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        company: '',
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);

    useEffect(() => {
        // Clear any existing session to prevent api/Workspaces or other authenticated calls
        logout();

        const fetchCompanies = async () => {
            try {
                const data = await authService.getGRCActiveCompany();

                const options = data.map(item => ({
                    id: item.id,
                    name: item.name
                }));
                setCompanyOptions(options);
            } catch (err) {
                console.error("Failed to load companies", err);
            }
        };

        fetchCompanies();
    }, []);

    const validateCompany = (company: string | number): string | undefined => {
        if (company === undefined || company === null || company === '') {
            return t('companyRequired');
        }
        return undefined;
    };

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

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return t('passwordRequired');
        }
        return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleCompanyChange = (value: string | number) => {
        const stringValue = value.toString();
        setFormData(prev => ({ ...prev, company: value }));
        setTouched(prev => ({ ...prev, company: true }));
        validateField('company', stringValue);
    };

    const handleCompanyBlur = () => {
        setTouched(prev => ({ ...prev, company: true }));
        // Only validate on blur if we aren't in the middle of a change
        // Or better, validate with current state but be aware of stale closure
        setFormData(current => {
            validateField('company', current.company.toString());
            return current;
        });
    };

    const validateField = (name: string, value: string) => {
        let error: string | undefined;

        switch (name) {
            case 'company':
                error = validateCompany(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({
            company: true,
            email: true,
            password: true
        });

        const companyError = validateCompany(formData.company.toString());
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        const newErrors: FormErrors = {
            company: companyError,
            email: emailError,
            password: passwordError
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error !== undefined)) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('AdminLogin - Selected Company ID:', formData.company);

            const response = await authService.adminLogin({
                companyId: Number(formData.company),
                adminEmail: formData.email,
                adminPassword: formData.password
            });

            console.log('AdminLogin.tsx - Response from authService:', response);

            if (response.isSucceeded && response.token) {
                // Save to auth context
                login(formData.email, response.token);

                // Store the selected company ID so Header can use it for default selection
                localStorage.setItem('currentCompanyId', formData.company.toString());
                sessionStorage.removeItem('companyAutoSwitched');

                // Verify token was saved
                const savedToken = localStorage.getItem('authToken');
                if (!savedToken) {
                    throw new Error('Failed to save authentication token');
                }

                success(t('loginSuccess'));
                navigate('/');
            } else {
                showError(response.errorMessage || t('loginError'));
                setIsSubmitting(false);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = error.message || t('loginError');
            showError(errorMessage);
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

                switch (name) {
                    case 'company':
                        error = validateCompany(value.toString());
                        break;
                    case 'email':
                        error = validateEmail(value.toString());
                        break;
                    case 'password':
                        error = validatePassword(value.toString());
                        break;
                }

                newErrors[name as keyof FormErrors] = error;
            });

            return newErrors;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    return (
        <div className="login-page">
            <button
                className="language-toggle"
                onClick={toggleLanguage}
            >
                <Languages size={20} />
                <span>{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        {/* Keeping similar styling but maybe different title could be used if needed. Reusing loginTitle for now */}
                        <h1>{t('loginTitle')}</h1>
                        <p>{t('loginMessage')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form" noValidate>

                        {/* Company Selection Field - Mandatory */}
                        <div className="form-group">
                            <label htmlFor="company" className="form-label">
                                {t('selectCompany')}
                            </label>
                            <div className={`input-wrapper ${errors.company && touched.company ? 'error' : ''} ${!errors.company && touched.company && formData.company ? 'success' : ''}`}>
                                <Building size={20} className="input-icon" />
                                <SearchableSelect
                                    options={companyOptions}
                                    value={formData.company}
                                    onChange={handleCompanyChange}
                                    onBlur={handleCompanyBlur}
                                    placeholder={t('selectCompany')}
                                    error={!!(errors.company && touched.company)}
                                    name="company"
                                />

                                {!errors.company && touched.company && formData.company && (
                                    <CheckCircle size={20} className="validation-icon success" style={{ right: language === 'ar' ? 'unset' : '44px', left: language === 'ar' ? '44px' : 'unset' }} />
                                )}
                                {errors.company && touched.company && (
                                    <XCircle size={20} className="validation-icon error" style={{ right: language === 'ar' ? 'unset' : '44px', left: language === 'ar' ? '44px' : 'unset' }} />
                                )}
                            </div>
                            {errors.company && touched.company && (
                                <span className="error-message">{errors.company}</span>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                {t('adminEmail')}
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

                        {/* Password Field */}
                        <div className="form-group">
                            <div className="password-header">
                                <label htmlFor="password" className="form-label">
                                    {t('adminPassword')}
                                </label>
                            </div>
                            <div className={`input-wrapper ${errors.password && touched.password ? 'error' : ''} ${!errors.password && touched.password && formData.password ? 'success' : ''}`}>
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
                            {errors.password && touched.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="checkbox"
                            />
                            <label htmlFor="rememberMe" className="checkbox-label">
                                {t('rememberMe')}
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('loggingIn') : t('loginBtn')}
                        </button>


                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
