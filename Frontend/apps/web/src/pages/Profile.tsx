import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Shield, UserCircle, Hexagon, Fingerprint, AlertCircle, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { profileService, ProfileData } from '../services/profileService';
import { useToast } from '../contexts/ToastContext';
import Breadcrumb from '../components/Breadcrumb';
import { getAllTokenClaims } from '../utils/tokenUtils';
import './Profile.css';

const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    companyName: '',
    email: ''
  });

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('profile') || 'Profile' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getProfile();
      const tokenClaims = getAllTokenClaims();

      if (response.isSucceeded && response.returnData) {
        const data = { ...response.returnData };

        if (tokenClaims) {
          if (tokenClaims.MobileNumber) data.mobileNumber = tokenClaims.MobileNumber;
          if (tokenClaims.UserType) data.accountType = tokenClaims.UserType;
        }

        setProfileData(data);
      } else {
        // Even if API fails, try to show token data
        if (tokenClaims) {
          setProfileData({
            name: tokenClaims.NameEn || tokenClaims.NameAr || '',
            email: tokenClaims.Email || '',
            companyName: tokenClaims.CompanyNameEn || tokenClaims.CompanyNameAr || '',
            mobileNumber: tokenClaims.MobileNumber,
            accountType: tokenClaims.UserType
          });
        } else {
          showToast(response.errorMessage || 'Failed to fetch profile', 'error');
        }
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return '??';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className={`profile-page-wrapper ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="profile-top-bar">
        <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="profile-container-premium">
        {/* Hero Section with Avatar */}
        <div className="profile-hero-card">
          <div className="glass-effect"></div>
          <div className="hero-content">
            <div className="avatar-container">
              <div className="avatar-outer-glow"></div>
              <div className="avatar-main">
                {getInitials(profileData.name)}
              </div>
              <div className="badge-verified">
                <Shield size={14} />
              </div>
            </div>
            <div className="user-intro">
              <h1>{profileData.name}</h1>
              <span className="user-role-badge">
                <Fingerprint size={14} />
                {t('registeredUser') || 'مستخدم مسجل'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-info-grid " style={{ padding: '0 0 20px 0' }}>
          {/* Public Profile Card */}
          <div className="info-card-premium">
            <div className="card-header">
              <UserCircle className="header-icon" />
              <h3>{t('personalInfo') || 'المعلومات الشخصية'}</h3>
            </div>
            <div className="card-body">
              <div className="premium-field">
                <label>{t('fullName') || 'الاسم الكامل'}</label>
                <div className="field-content">
                  <User size={18} className="field-icon" />
                  <span>{profileData.name}</span>
                </div>
              </div>

              <div className="premium-field">
                <label>{t('emailAddress') || 'البريد الإلكتروني'}</label>
                <div className="field-content">
                  <Mail size={18} className="field-icon" />
                  <span>{profileData.email}</span>
                </div>
              </div>

              {profileData.mobileNumber && (
                <div className="premium-field">
                  <label>{t('phone') || 'رقم الهاتف'}</label>
                  <div className="field-content">
                    <Phone size={18} className="field-icon" />
                    <span>{profileData.mobileNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization Card */}
          <div className="info-card-premium">
            <div className="card-header">
              <Hexagon className="header-icon" />
              <h3>{t('organizationInfo') || 'معلومات المنظمة'}</h3>
            </div>
            <div className="card-body">
              <div className="premium-field">
                <label>{t('companyName') || 'اسم الشركة'}</label>
                <div className="field-content">
                  <Building size={18} className="field-icon" />
                  <span>{profileData.companyName}</span>
                </div>
              </div>

              <div className="premium-field">
                <label>{t('accountType') || 'نوع الحساب'}</label>
                <div className="field-content">
                  <Shield size={18} className="field-icon" />
                  <span>{profileData.accountType || t('businessAccount') || 'حساب أعمال'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
