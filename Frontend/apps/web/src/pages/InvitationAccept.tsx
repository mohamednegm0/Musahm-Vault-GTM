import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Languages, FileText, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { generateOTP, verifyOTP } from '../api/invitations';
import './InvitationAccept.css';

const InvitationAccept: React.FC = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const invitationId = searchParams.get('id') || '';
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string>('');
    const [otpGenerated, setOtpGenerated] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [fileInfo, setFileInfo] = useState<{ fileName: string, fileSize: number, contentType: string } | null>(null);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const otpInitialized = useRef(false);

    // Generate OTP on component mount
    useEffect(() => {
        // Prevent duplicate API calls
        if (otpInitialized.current) return;

        const initializeOTP = async () => {
            if (!invitationId || !email) {
                setError(t('invalidInvitationLink'));
                setIsLoading(false);
                return;
            }

            otpInitialized.current = true;

            try {
                const response = await generateOTP(invitationId, email);

                if (response.apiStatusCode === 200 && response.isSucceeded) {
                    setOtpGenerated(true);
                    setFileInfo(response.returnData); // Save file info
                    success(response.successMessage || t('resendCodeSent'));
                } else {
                    setError(response.errorMessage || t('otpGenerationFailed'));
                    otpInitialized.current = false; // Allow retry on error
                }
            } catch (err: any) {
                setError(err.response?.data?.errorMessage || t('error'));
                otpInitialized.current = false; // Allow retry on error
            } finally {
                setIsLoading(false);
            }
        };

        initializeOTP();
    }, [invitationId, email, t, success]);

    // Countdown timer for resend button
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        if (verificationSuccess) return;

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (index === 5 && value) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6) {
                handleVerifyOtp(fullOtp);
            }
        }
    };

    // Handle backspace/delete
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        if (verificationSuccess) return;
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp);

            // Focus last filled input or first empty
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();

            // Auto-submit if 6 digits pasted
            if (pastedData.length === 6) {
                handleVerifyOtp(pastedData);
            }
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (otpCode?: string) => {
        const otpToVerify = otpCode || otp.join('');

        if (otpToVerify.length !== 6) {
            setError(t('enterAllDigits'));
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response = await verifyOTP(invitationId, email, otpToVerify);

            const contentType = response.headers['content-type'];
            const data = response.data; // This is a Blob now

            // CASE 1: Response is JSON (likely an error)
            if (contentType && contentType.includes('application/json')) {
                const text = await data.text();
                const jsonResponse = JSON.parse(text);

                if (jsonResponse.isSucceeded === false) {
                    setError(jsonResponse.errorMessage || t('invalidOtp'));
                    setOtp(Array(6).fill(''));
                    inputRefs.current[0]?.focus();
                    return;
                }
            }

            // CASE 2: Response is File - SUCCESS
            success(t('invitationAccepted'));

            // Create a URL for the blob
            const blob = new Blob([data], { type: contentType || fileInfo?.contentType || 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setVerificationSuccess(true);

        } catch (err: any) {
            if (err.response && err.response.data instanceof Blob) {
                const errorBlob = err.response.data;
                try {
                    const text = await errorBlob.text();
                    const jsonError = JSON.parse(text);
                    setError(jsonError.errorMessage || t('invalidOtp'));
                } catch {
                    setError(t('error'));
                }
            } else {
                setError(err.response?.data?.errorMessage || t('error'));
                showError(err.response?.data?.errorMessage || t('error'));
            }
            setOtp(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        setOtp(Array(6).fill(''));

        try {
            const response = await generateOTP(invitationId, email);

            if (response.apiStatusCode === 200 && response.isSucceeded) {
                success(response.successMessage || t('resendCodeSent'));
                setCountdown(30); // Reset countdown timer
                inputRefs.current[0]?.focus();
            } else {
                setError(response.errorMessage || t('otpGenerationFailed'));
            }
        } catch (err: any) {
            setError(err.response?.data?.errorMessage || t('otpGenerationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="invitation-accept-page">
                <div className="invitation-accept-container">
                    <div className="invitation-accept-card">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>{t('loading')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !otpGenerated) {
        return (
            <div className="invitation-accept-page">
                <button
                    className="language-toggle"
                    onClick={toggleLanguage}
                >
                    <Languages size={20} />
                    <span>{language === 'ar' ? 'EN' : 'ع'}</span>
                </button>

                <div className="invitation-accept-container">
                    <div className="invitation-accept-card">
                        <div className="error-state">
                            <XCircle size={64} className="error-icon" />
                            <h2>{t('error')}</h2>
                            <p className="error-message">{error}</p>
                            <button onClick={() => navigate('/login')} className="btn-primary">
                                {t('goToLogin')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="invitation-accept-page">
            <button
                className="language-toggle"
                onClick={toggleLanguage}
            >
                <Languages size={20} />
                <span>{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            <div className="invitation-accept-container">
                <div className="invitation-accept-card">
                    {!verificationSuccess ? (
                        <>
                            <div className="invitation-accept-header">
                                <div className="header-icon">
                                    <Mail size={48} />
                                </div>
                                <h1>{t('verifyInvitation')}</h1>
                                <p>{t('otpSentTo')}</p>
                                <p className="email-display">{email}</p>
                            </div>

                            {/* {fileInfo && (
                                <div className="file-info-box">
                                    <div className="file-icon">
                                        <FileText size={24} />
                                    </div>
                                    <div className="file-details">
                                        <p className="file-name">{fileInfo.fileName}</p>
                                        <p className="file-size">{formatSize(fileInfo.fileSize)}</p>
                                    </div>
                                </div>
                            )} */}

                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="otp-form">
                                <div className="otp-input-group">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className={`otp-input ${error ? 'error' : ''}`}
                                            disabled={isVerifying}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <XCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isVerifying || otp.join('').length !== 6}
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            {t('verifying')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            {t('verifyCode')}
                                        </>
                                    )}
                                </button>

                                <div className="resend-section">
                                    <p>{t('didntReceiveCode')}</p>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="resend-btn"
                                        disabled={isLoading || countdown > 0}
                                    >
                                        {countdown > 0 ? `(${countdown}s)` : t('resendCode')}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="success-state">
                            <div className="success-icon-wrapper">
                                <div className="success-icon">
                                    <CheckCircle size={64} />
                                </div>
                            </div>
                            <h2>{t('invitationAccepted')}</h2>
                            <p>{t('fileReady') || 'Your document is ready for download'}</p>

                            <div className="file-info-box success">
                                <div className="file-icon">
                                    <FileText size={32} />
                                </div>
                                <div className="file-details">
                                    <p className="file-name">{fileInfo?.fileName || 'Document'}</p>
                                    <p className="file-size">{fileInfo ? formatSize(fileInfo.fileSize) : ''}</p>
                                </div>
                            </div>

                            <div className="success-actions">
                                <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="btn-primary"
                                >
                                    <Eye size={20} />
                                    {t('preview') || 'Preview'}
                                </button>
                                <button onClick={() => navigate('/login')} className="btn-secondary">
                                    {t('backToLogin')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Protected Preview Overlay */}
            {isPreviewOpen && (
                <div
                    className="preview-overlay"
                    onContextMenu={(e) => e.preventDefault()} // Disable right-click
                >
                    <div className="preview-toolbar">
                        <div className="preview-info">
                            <FileText size={18} />
                            <span>{fileInfo?.fileName || 'Document'}</span>
                        </div>
                        <button className="close-preview-btn" onClick={() => setIsPreviewOpen(false)}>
                            <XCircle size={24} />
                            <span>{t('close')}</span>
                        </button>
                    </div>
                    <div className="preview-content">
                        {/* Adding #toolbar=0 to discourage native UI downloads */}
                        <iframe
                            src={`${downloadUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            title="Document Preview"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                        />
                        {/* Transparent shield to prevent direct interaction with iframe headers if possible */}
                        <div className="preview-shield" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitationAccept;
