import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Globe, Bell, Menu, Languages, User, LogOut, Lock, Building, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './Header.css';
import { decodeToken } from '../utils/tokenUtils';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { login, user } = useAuth();
  const { success, error: showError } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  // Guard to prevent auto-switch running more than once per page load
  const autoSwitchDone = useRef(false);

  // Memoize decoded token to prevent unnecessary re-renders and re-fetches
  const decodedToken = useMemo(() => {
    return user?.token ? decodeToken(user.token) : null;
  }, [user?.token]);

  const companyName = decodedToken ? (language === 'ar' ? decodedToken.CompanyNameAr : decodedToken.CompanyNameEn) : '';

  // Use local storage priority to remember the explicitly selected company during login, fallback to token claims
  const currentCompanyId = localStorage.getItem('currentCompanyId') ||
    decodedToken?.CompanyId || decodedToken?.companyId || decodedToken?.company_id ||
    decodedToken?.tenantId || decodedToken?.TenantId || decodedToken?.id;

  const partnerId = decodedToken?.Id || decodedToken?.id || decodedToken?.nameid || decodedToken?.sub;

  useEffect(() => {
    const fetchCompanies = async () => {
      const userType = decodedToken?.UserType || decodedToken?.userType;
      // 2 or 'Employee' usually represents an employee in this system
      const isEmployee = userType === 'Employee' || userType === '2' || userType === 2;
      const userId = decodedToken?.Id || decodedToken?.id || decodedToken?.nameid || decodedToken?.sub;

      if (!userId) return;

      try {
        let response;
        if (isEmployee) {
          response = await authService.getEmployeeCompaniesList(userId);
        } else {
          response = await authService.getPartnerCompaniesList(userId);
        }

        if (response.isSucceeded || response.apiStatusCode === 200) {
          // Compare with current state to avoid unnecessary set state updates
          const newData = response.returnData || [];
          setCompanies(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
            return newData;
          });
        }
      } catch (err) {
        console.error('Error fetching companies list:', err);
      }
    };
    fetchCompanies();
    // Only run when userId or userType from decodedToken changes
  }, [decodedToken?.Id, decodedToken?.id, decodedToken?.UserType, decodedToken?.userType, decodedToken?.sub, decodedToken?.nameid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (autoSwitchDone.current) return;           // only once per mount
    if (sessionStorage.getItem('companyAutoSwitched')) return; // only once per session
    if (companies.length === 0) return;            // wait for list to arrive

    const storedId = localStorage.getItem('currentCompanyId');
    if (!storedId) return;

    // Compare with what the token already claims as current company
    const tokenCompanyId =
      decodedToken?.CompanyId || decodedToken?.companyId ||
      decodedToken?.company_id || decodedToken?.tenantId ||
      decodedToken?.TenantId;

    // If token already matches the stored company → no switch needed
    if (tokenCompanyId && String(tokenCompanyId) === String(storedId)) {
      sessionStorage.setItem('companyAutoSwitched', '1');
      autoSwitchDone.current = true;
      return;
    }

    // Token doesn't carry the right company → call ChangeCompany silently
    autoSwitchDone.current = true;
    sessionStorage.setItem('companyAutoSwitched', '1');

    const doAutoSwitch = async () => {
      try {
        const userType = decodedToken?.UserType || decodedToken?.userType;
        const isEmployee = userType === 'Employee' || userType === '2' || userType === 2;

        const response = isEmployee
          ? await authService.employeeChangeCompany(Number(storedId))
          : await authService.partnerChangeCompany(Number(storedId));

        const newToken = response.token || response.returnData?.token;
        if (
          (response.isSucceeded || response.apiStatusCode === 200 || response.apiStatusCode === 0) &&
          newToken
        ) {
          const email =
            decodedToken?.email || decodedToken?.unique_name ||
            localStorage.getItem('userEmail') || '';
          login(email, newToken);
          localStorage.setItem('currentCompanyId', storedId);
          // Full reload so ALL components (workspace, documents …) get the new token
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Auto company switch failed:', err);
      }
    };

    doAutoSwitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  const handleCompanyChange = async (companyId: number) => {
    if (String(companyId) === String(currentCompanyId)) return;

    setIsLoading(true);
    try {
      const userType = decodedToken?.UserType || decodedToken?.userType;
      const isEmployee = userType === 'Employee' || userType === '2' || userType === 2;

      let response;
      if (isEmployee) {
        response = await authService.employeeChangeCompany(companyId);
      } else {
        response = await authService.partnerChangeCompany(companyId);
      }

      // Some APIs return 0 for success, others 200. Check isSucceeded as primary.
      if ((response.isSucceeded || response.apiStatusCode === 200 || response.apiStatusCode === 0) && response.token) {
        const email = decodedToken?.email || decodedToken?.unique_name || localStorage.getItem('userEmail') || '';
        login(email, response.token);
        localStorage.setItem('currentCompanyId', companyId.toString());

        // As per user requirement: display successMessage if apiStatusCode == 200
        const displaySuccess = response.successMessage || t('companyChangedSuccess') || 'Company changed successfully';
        success(displaySuccess);

        // Hard-navigate to force all components and services to reinitialize
        // with the new token so every API call uses the correct auth context
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        const displayError = response.errorMessage || t('errorChangingCompany') || 'Failed to change company';
        showError(displayError);
      }
    } catch (err: any) {
      showError(err.message || 'Error changing company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToGRC = async () => {
    // نفتح تاب جديد فوراً داخل الـ click event (قبل أي await)
    // عشان المتصفح ما يعتبره popup ويبلوكه
    const newTab = window.open('', '_blank');
    try {
      const response = await authService.redirectToGRC();
      if (response.isSucceeded || response.apiStatusCode === 200) {
        const redirectUrl: string = response.returnData?.value;
        if (redirectUrl && newTab) {
          newTab.location.href = redirectUrl;
        } else {
          newTab?.close();
          showError('GRC URL not returned from server.');
        }
      } else {
        newTab?.close();
        showError(response.errorMessage || 'Failed to redirect to GRC.');
      }
    } catch (err: any) {
      newTab?.close();
      showError(err.message || 'Failed to redirect to GRC.');
    }
  };

  const handleLogout = () => {
    // Clear any stored auth data including the selected company
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('currentCompanyId');

    // Close menu and navigate to login
    setShowUserMenu(false);
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    setShowUserMenu(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Tooltip content={t('menu')} position="bottom">
          <button className="menu-btn" onClick={onMenuClick}>
            <Menu size={20} />
          </button>
        </Tooltip>

        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchInVault')}
            className="search-input"
          />
        </div>

        {companyName && (
          <div
            ref={companyDropdownRef}
            className="company-name"
            style={{
              fontWeight: 600,
              color: '#00295B',
              fontSize: '14px',
              padding: '4px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              cursor: companies.length > 0 ? 'pointer' : 'default'
            }}
          >
            <Building size={16} style={{ marginInlineEnd: '6px' }} />

            {companies.length > 0 ? (
              <>
                {/* Trigger */}
                <div
                  onClick={() => setShowCompanyDropdown(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>
                    {companies.find(c => String(c.id) === String(currentCompanyId))?.name || companyName}
                  </span>

                  <ChevronDown
                    size={14}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: showCompanyDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: 0.7
                    }}
                  />
                </div>

                {/* Dropdown */}
                {showCompanyDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      minWidth: '200px',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}
                  >
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => {
                          handleCompanyChange(company.id);
                          setShowCompanyDropdown(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background:
                            String(company.id) === String(currentCompanyId)
                              ? '#f3f4f6'
                              : '#fff',
                          transition: '0.2s'
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = '#f9fafb')
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          String(company.id) === String(currentCompanyId)
                            ? '#f3f4f6'
                            : '#fff')
                        }
                      >
                        {company.name}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span>{companyName}</span>
            )}
          </div>
        )}

        {/* Removed advanced search button */}
        <button className="ask-vault" onClick={() => navigate('/ai-chat')}>
          <span className="ask-icon">🔮</span>
          {t('askVault')}
        </button>

        <button className="ask-vault" onClick={handleGoToGRC}>
          {t('goToGRC')}
        </button>
      </div>

      <div className="header-right">
        <button className="icon-btn" onClick={toggleLanguage}>
          <Languages size={18} />
          <span style={{ paddingInlineStart: '4px' }}>{language === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        <button className="icon-btn">
          <Bell size={18} />
        </button>

        <div className="user-menu-container">
          <Tooltip content={t('profile')} position="bottom">
            <button
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={18} />
            </button>
          </Tooltip>

          {showUserMenu && (
            <>
              <div
                className="user-menu-overlay"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="user-menu-dropdown">
                <button
                  className="user-menu-item"
                  onClick={handleProfile}
                >
                  <User size={16} />
                  <span>{t('profile')}</span>
                </button>
                <button
                  className="user-menu-item"
                  onClick={handleChangePassword}
                >
                  <Lock size={16} />
                  <span>{t('changePassword')}</span>
                </button>
                <div className="user-menu-divider" />
                <button
                  className="user-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
