import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, Languages, Smartphone, ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authService, PartnerCompany } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import CompanySelection from '../components/CompanySelection';
import './Login.css';

interface JWTPayload {
  nameid?: string;
  email?: string;
  unique_name?: string;
  sub?: string;
  Id?: string; // Add Id explicitly as user mentioned it
  id?: string;
  [key: string]: any;
}

interface FormData {
  email: string;
  password: string;
  identityNumber: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  identityNumber?: string;
}

const Login: React.FC = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employee' | 'partner'>('employee');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    identityNumber: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP Step State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(5).fill(''));
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Selection state
  const [showCompanySelection, setShowCompanySelection] = useState(false);
  const [partnerCompanies, setPartnerCompanies] = useState<PartnerCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Timer logic for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const validateIdentityNumber = (id: string): string | undefined => {
    if (!id) {
      return t('identityNumberRequired');
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
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'identityNumber':
        error = validateIdentityNumber(value);
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (pastedData) {
      const newOtp = pastedData.split('').concat(Array(5 - pastedData.length).fill(''));
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 4);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsSubmitting(true);
    try {
      const response = await authService.partnerLogin({
        identityNumber: formData.identityNumber
      });

      if (response.apiStatusCode === 200) {
        success(response.successMessage || t('otpSentSuccess'));
        setPhoneNumbers(response.returnData?.phoneNumbers || []);
        setCountdown(response.returnData?.acceptedResendOtpTime || 30);
        setOtp(Array(5).fill(''));
        otpInputRefs.current[0]?.focus();
      } else {
        showError(response.errorMessage || t('loginError'));
      }
    } catch (error: any) {
      showError(error.message || t('loginError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'employee') {
      setTouched({
        email: true,
        password: true
      });

      const emailError = validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);

      const newErrors: FormErrors = {
        email: emailError,
        password: passwordError
      };

      setErrors(newErrors);

      if (Object.values(newErrors).some(error => error !== undefined)) {
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });

        if (response.apiStatusCode === 200 && response.token) {
          const token = response.token;
          const userEmail = formData.email;

          // Extract User ID from JWT
          try {
            const decoded = jwtDecode<JWTPayload>(token);
            const employeeId = decoded.Id || decoded.id || decoded.nameid || decoded.sub || '';

            if (employeeId) {
              sessionStorage.setItem('userId', employeeId);
            }

            // Set token in localStorage via login first, as apiClient needs it for the next call
            login(userEmail, token);

            // Now fetch companies count for employee
            if (employeeId) {
              try {
                const countResponse = await authService.getEmployeeCompaniesCount(employeeId);

                if (countResponse.apiStatusCode === 200) {
                  const companyCount = countResponse.returnData;

                  if (companyCount === 1) {
                    // Automatically select the single company
                    const companiesResponse = await authService.getEmployeeCompanies(employeeId);
                    if (companiesResponse.apiStatusCode === 200 && companiesResponse.returnData?.length > 0) {
                      const companyId = companiesResponse.returnData[0].id;
                      const changeResponse = await authService.employeeChangeCompany(companyId);

                      if (changeResponse.apiStatusCode === 200 && (changeResponse.token || changeResponse.returnData?.token)) {
                        const newToken = changeResponse.token || changeResponse.returnData?.token;
                        if (newToken) {
                          login(userEmail, newToken);
                          localStorage.setItem('currentCompanyId', companyId.toString());
                          sessionStorage.removeItem('companyAutoSwitched');
                          success(t(changeResponse.successMessage || 'loginSuccess'));
                          navigate('/');
                          return;
                        }
                      }
                    }
                  } else if (companyCount > 1) {
                    // Multi-company selection
                    const companiesResponse = await authService.getEmployeeCompanies(employeeId);
                    if (companiesResponse.apiStatusCode === 200) {
                      setPartnerCompanies(companiesResponse.returnData || []);
                      setIsSubmitting(false);
                      setShowCompanySelection(true);
                      success(t(companiesResponse.successMessage || 'selectCompany'));
                      return;
                    }
                  }
                }

                // Fallback for no companies or error
                success(t(response.successMessage || 'loginSuccess'));
                navigate('/');
              } catch (compErr) {
                console.error('Error fetching employee companies:', compErr);
                navigate('/');
              }
            } else {
              success(t(response.successMessage || 'loginSuccess'));
              navigate('/');
            }
          } catch (decodeError) {
            console.error('Token decoding failed:', decodeError);
            login(userEmail, token);
            success(t(response.successMessage || 'loginSuccess'));
            navigate('/');
          }
        } else {
          showError(t(response.errorMessage || 'loginError'));
          setIsSubmitting(false);
        }
      } catch (error: any) {
        let errorMessage = error.message || t('loginError');
        showError(errorMessage);
        setIsSubmitting(false);
      }
    } else {
      // Partner Login
      if (!isOtpStep) {
        setTouched({
          identityNumber: true
        });

        const idError = validateIdentityNumber(formData.identityNumber);

        const newErrors: FormErrors = {
          identityNumber: idError
        };

        setErrors(newErrors);

        if (idError) {
          return;
        }

        setIsSubmitting(true);

        try {
          const response = await authService.partnerLogin({
            identityNumber: formData.identityNumber
          });

          if (response.apiStatusCode === 200) {
            const successMsg = response.successMessage || 'otpSentSuccess';
            success(t(successMsg));

            setPhoneNumbers(response.returnData?.phoneNumbers || []);
            setCountdown(response.returnData?.acceptedResendOtpTime || 30);
            setIsOtpStep(true);
          } else {
            showError(t(response.errorMessage || 'loginError'));
          }
        } catch (error: any) {
          showError(error.message || t('loginError'));
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // Handle OTP Verification
        const otpCode = otp.join('');
        if (otpCode.length !== 5) {
          showError(t('enterVerificationCode'));
          return;
        }

        setIsSubmitting(true);
        try {
          const response = await authService.verifyPartnerOTP({
            identityNumber: formData.identityNumber,
            otp: otpCode,
            rememberMe: rememberMe,
            firebaseToken: '', // Optional placeholder
            deviceName: navigator.userAgent.substring(0, 100)
          });

          const verifyToken = response.token || response.returnData?.token;
          if (response.apiStatusCode === 200 && verifyToken) {
            const token = verifyToken;

            // Extract User ID from JWT
            try {
              const decoded = jwtDecode<JWTPayload>(token);
              const partnerId = decoded.Id || decoded.id || decoded.nameid || decoded.sub || '';
              const userEmail = decoded.email || decoded.unique_name || formData.identityNumber;

              if (partnerId) {
                sessionStorage.setItem('userId', partnerId);
              }

              // Set token in localStorage via login first, as apiClient needs it for the next call
              login(userEmail, token);

              // Now fetch companies
              if (partnerId) {
                try {
                  const countResponse = await authService.getPartnerCompaniesCount(partnerId);

                  if (countResponse.apiStatusCode === 200) {
                    const companyCount = countResponse.returnData;

                    if (companyCount === 1) {
                      // Automatically select the single company
                      const companiesResponse = await authService.getPartnerCompanies(partnerId);
                      if (companiesResponse.apiStatusCode === 200 && companiesResponse.returnData?.length > 0) {
                        const companyId = companiesResponse.returnData[0].id;
                        const changeResponse = await authService.partnerChangeCompany(companyId);

                        if (changeResponse.apiStatusCode === 200 && (changeResponse.token || changeResponse.returnData?.token)) {
                          const newToken = changeResponse.token || changeResponse.returnData?.token;
                          if (newToken) {
                            login(userEmail, newToken);
                            localStorage.setItem('currentCompanyId', companyId.toString());
                            sessionStorage.removeItem('companyAutoSwitched');
                            success(t(changeResponse.successMessage || 'loginSuccess'));
                            navigate('/');
                            return;
                          }
                        }
                      }
                    } else if (companyCount > 1) {
                      // Multi-company selection
                      const companiesResponse = await authService.getPartnerCompanies(partnerId);
                      if (companiesResponse.apiStatusCode === 200) {
                        setPartnerCompanies(companiesResponse.returnData || []);
                        setShowCompanySelection(true);
                        success(t('selectCompany'));
                        return;
                      }
                    }
                  }

                  // Fallback for no companies or error
                  success(t(response.successMessage || 'loginSuccess'));
                  navigate('/');
                } catch (compErr) {
                  console.error('Error fetching companies:', compErr);
                  navigate('/');
                }
              } else {
                success(response.successMessage || t('loginSuccess'));
                navigate('/');
              }
            } catch (decodeError) {
              console.error('Token decoding failed:', decodeError);
              login(formData.identityNumber, token);
              success(response.successMessage || t('loginSuccess'));
              navigate('/');
            }
          } else {
            showError(t(response.errorMessage || 'invalidOtp'));
            setIsSubmitting(false);
          }
        } catch (error: any) {
          showError(error.message || t('loginError'));
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleCompanySelect = async (companyId: number) => {
    setIsSubmitting(true);
    try {
      const response = activeTab === 'employee'
        ? await authService.employeeChangeCompany(companyId)
        : await authService.partnerChangeCompany(companyId);

      if (response.apiStatusCode === 200 && (response.token || response.returnData?.token)) {
        const newToken = response.token || response.returnData?.token;
        const currentEmail = localStorage.getItem('userEmail') || (activeTab === 'employee' ? formData.email : formData.identityNumber);

        // Update local storage and context with new token
        login(currentEmail, newToken);
        localStorage.setItem('currentCompanyId', companyId.toString());
        sessionStorage.removeItem('companyAutoSwitched');

        success(t(response.successMessage || 'loginSuccess'));
        navigate('/');
      } else {
        showError(t(response.errorMessage || 'loginError'));
        setIsSubmitting(false);
      }
    } catch (error: any) {
      showError(error.message || t('loginError'));
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
          case 'email':
            error = validateEmail(value);
            break;
          case 'password':
            error = validatePassword(value);
            break;
          case 'identityNumber':
            error = validateIdentityNumber(value);
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

      <div className={`login-container ${showCompanySelection ? 'selection-mode' : ''}`}>
        <div className="login-card">
          {showCompanySelection ? (
            <CompanySelection
              companies={partnerCompanies}
              onSelect={handleCompanySelect}
              onBack={() => {
                setShowCompanySelection(false);
                setIsOtpStep(false);
              }}
              isSubmitting={isSubmitting}
            />
          ) : !isOtpStep ? (
            <>
              <div className="login-header">
                <h1>{t('loginTitle')}</h1>
                <p>{t('loginMessage')}</p>
              </div>

              <div className="login-tabs">
                <button
                  className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
                  onClick={() => setActiveTab('employee')}
                >
                  {t('employeeTab')}
                </button>
                <button
                  className={`tab-btn ${activeTab === 'partner' ? 'active' : ''}`}
                  onClick={() => setActiveTab('partner')}
                >
                  {t('partnerTab')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form" noValidate>
                {activeTab === 'employee' ? (
                  <>
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

                    <div className="form-group">
                      <div className="password-header">
                        <label htmlFor="password" className="form-label">
                          {t('password')}
                        </label>
                        <Link to="/forgot-password" title={t('forgotPassword')} className="forgot-password">
                          {t('forgotPassword')}
                        </Link>
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
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="identityNumber" className="form-label">
                        {t('enterIdentityNumber')}
                      </label>
                      <div className={`input-wrapper ${errors.identityNumber && touched.identityNumber ? 'error' : ''} ${!errors.identityNumber && touched.identityNumber && formData.identityNumber ? 'success' : ''}`}>
                        <Lock size={20} className="input-icon" />
                        <input
                          type="text"
                          id="identityNumber"
                          name="identityNumber"
                          value={formData.identityNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={t('enterIdentityNumber')}
                          className="form-input"
                        />
                        {!errors.identityNumber && touched.identityNumber && formData.identityNumber && (
                          <CheckCircle size={20} className="validation-icon success" />
                        )}
                        {errors.identityNumber && touched.identityNumber && (
                          <XCircle size={20} className="validation-icon error" />
                        )}
                      </div>
                      {errors.identityNumber && touched.identityNumber && (
                        <span className="error-message">{errors.identityNumber}</span>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('loggingIn') : t('loginBtn')}
                </button>

                <div className="form-footer">
                  <span>{t('noAccount')}</span>
                  <Link to="/registration" className="signup-link">{t('signUp')}</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="otp-header">
                <button
                  className="back-btn"
                  onClick={() => setIsOtpStep(false)}
                  data-tooltip-content={t('back')}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="header-icon">
                  <Smartphone size={40} />
                </div>
                <h1>{t('verificationCode')}</h1>
                <p>{t('otpSentToPhones')}</p>
                <div className="phone-numbers">
                  {phoneNumbers.map((phone, idx) => (
                    <span key={idx} className="phone-badge">{phone}</span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="otp-form">
                <div className="otp-input-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || otp.join('').length !== 5}
                >
                  {isSubmitting ? t('verifyingCode') : t('verify')}
                </button>

                <div className="resend-section">
                  {countdown > 0 ? (
                    <p className="timer">
                      {t('resendOtpIn')} {countdown} {t('seconds')}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="resend-btn"
                      disabled={isSubmitting}
                    >
                      {t('resendCode')}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
