import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users as UsersIcon,
    Plus,
    Edit2,
    Search,
    ArrowLeft,
    ArrowRight,
    Shield,
    Phone,
    Mail,
    UserCheck,
    UserX,
    ChevronDown,
    X,
    Check,
    Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { userService, UserListItem, CreateUserRequest, UpdateUserRequest, Country } from '../api/users';
import { roleService, Role } from '../api/permissions';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import './Users.css';

const Users: React.FC = () => {
    const { t, language } = useLanguage();
    const { success: toastSuccess, error: toastError } = useToast();
    const navigate = useNavigate();

    // State
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Refs
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    // Role Dropdown State
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);

    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Form State
    const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
        companyId: 0,
        nameAr: '',
        nameEn: '',
        email: '',
        mobileCountryCode: 0,
        mobileNumber: '',
        identityNumber: '',
        isActive: true,
        roleIds: []
    });

    // Email Check State
    const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');
    const emailCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastCheckedEmail = useRef<string>('');
    const [apiFields, setApiFields] = useState<{
        nameAr?: boolean;
        nameEn?: boolean;
        mobileCountryCode?: boolean;
        mobileNumber?: boolean;
        identityNumber?: boolean;
    }>({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchCountries();

        // Click outside handler
        // Click outside handler
        const handleClickOutside = (event: MouseEvent) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await roleService.getAll();
            if (response.apiStatusCode === 200) {
                setAllRoles(response.returnData);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await userService.getCountryCodes();
            if (response.apiStatusCode === 200) {
                setCountries(response.returnData);
                // Set default country code if needed, e.g., SA (966)
                // const sa = response.returnData.find(c => c.countryCode === 966);
                // if (sa) setFormData(prev => ({ ...prev, mobileCountryCode: sa.countryCode }));
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            if (response.apiStatusCode === 200) {
                setUsers(response.returnData);
            } else {
                toastError(response.errorMessage || t('failedToLoadUsers'));
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            const apiError = error.response?.data?.errorMessage;
            toastError(apiError || t('failedToLoadUsers'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setFormData({
            companyId: 0,
            nameAr: '',
            nameEn: '',
            email: '',
            mobileCountryCode: 966, // Default to SA
            mobileNumber: '',
            identityNumber: '',
            isActive: true,
            roleIds: []
        });
        setEmailCheckStatus('idle');
        setApiFields({});
        lastCheckedEmail.current = '';
        setShowModal(true);
    };

    const handleEdit = async (user: UserListItem) => {
        try {
            // Use id or localId, whichever is available
            const userId = user.id?.toString() || user.id;

            if (!userId) {
                toastError(t('failedToLoadUser') || 'User ID not found');
                return;
            }

            // Fetch full user data by userId
            const response = await userService.getById(userId);
            if (response.apiStatusCode === 200) {
                const userData = response.returnData;
                setSelectedUser(userData);
                setFormData({
                    id: userData.id?.toString() || userData.id,
                    nameAr: userData.nameAr,
                    nameEn: userData.nameEn,
                    email: userData.email,
                    mobileCountryCode: userData.mobileCountryCode ? Number(userData.mobileCountryCode) : 966,
                    mobileNumber: userData.mobileNumber,
                    identityNumber: userData.identityNumber || '',
                    isActive: userData.isActive,
                    roleIds: userData.roles?.map(r => r.roleId) || []
                } as UpdateUserRequest);
                setEmailCheckStatus('idle');
                setApiFields({}); // In edit, fields don't start disabled by API check
                lastCheckedEmail.current = '';
                setShowModal(true);
            } else {
                toastError(response.errorMessage || t('failedToLoadUser'));
            }
        } catch (error: any) {
            console.error('Error fetching user details:', error);
            const apiError = error.response?.data?.errorMessage;
            toastError(apiError || t('failedToLoadUser'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Role is required
        if (formData.roleIds.length === 0) {
            toastError(t('roleRequired'));
            return;
        }

        setIsSubmitting(true);
        try {
            let response;
            if (selectedUser) {
                response = await userService.update(formData as UpdateUserRequest);
            } else {
                response = await userService.create(formData as CreateUserRequest);
            }

            // Check apiStatusCode === 200 for success
            if (response.apiStatusCode === 200) {
                toastSuccess(response.successMessage || (selectedUser ? t('userUpdatedSuccessfully') : t('userCreatedSuccessfully')));
                setShowModal(false);
                fetchUsers();
            } else {
                toastError(response.errorMessage || (selectedUser ? t('failedToUpdateUser') : t('failedToCreateUser')));
            }
        } catch (error: any) {
            console.error('Error saving user:', error);
            const apiError = error.response?.data?.errorMessage;
            toastError(apiError || (selectedUser ? t('failedToUpdateUser') : t('failedToCreateUser')));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));

        if (name === 'email') {
            if (!val) {
                setEmailCheckStatus('idle');
                lastCheckedEmail.current = '';
                setApiFields({});
                setFormData(prev => ({
                    ...prev,
                    nameAr: '',
                    nameEn: '',
                    mobileNumber: '',
                    identityNumber: ''
                }));
            } else {
                setEmailCheckStatus('idle');
                lastCheckedEmail.current = '';
            }
        }
    };

    const triggerEmailCheck = async (email: string) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailCheckStatus('idle');
            if (!email) {
                setApiFields({});
                setFormData(prev => ({
                    ...prev,
                    nameAr: '',
                    nameEn: '',
                    mobileNumber: '',
                    identityNumber: ''
                }));
            }
            return;
        }

        if (email === lastCheckedEmail.current && emailCheckStatus !== 'idle') return;

        setEmailCheckStatus('checking');
        lastCheckedEmail.current = email;

        try {
            const response = await userService.activeByEmail(email);
            if (response.isSucceeded && response.apiStatusCode === 200 && response.returnData) {
                setEmailCheckStatus('exists');
                const data = response.returnData;
                setApiFields({
                    nameAr: !!(data.nameAr || data.NameAr || data.fullNameAr),
                    nameEn: !!(data.nameEn || data.NameEn || data.fullNameEn),
                    mobileCountryCode: !!data.mobileCountryCode,
                    mobileNumber: !!data.mobileNumber,
                    identityNumber: !!data.identityNumber
                });
                setFormData(prev => ({
                    ...prev,
                    nameAr: data.nameAr || data.NameAr || data.fullNameAr || prev.nameAr,
                    nameEn: data.nameEn || data.NameEn || data.fullNameEn || prev.nameEn,
                    mobileCountryCode: data.mobileCountryCode ? Number(data.mobileCountryCode) : prev.mobileCountryCode,
                    mobileNumber: data.mobileNumber || prev.mobileNumber,
                    identityNumber: data.identityNumber || (prev as any).identityNumber || ''
                }));
            } else {
                setEmailCheckStatus('available');
                setApiFields({});
                setFormData(prev => ({
                    ...prev,
                    nameAr: '',
                    nameEn: '',
                    mobileNumber: '',
                    identityNumber: ''
                }));
            }
        } catch {
            setEmailCheckStatus('idle');
            setApiFields({});
            setFormData(prev => ({
                ...prev,
                nameAr: '',
                nameEn: '',
                mobileNumber: '',
                identityNumber: ''
            }));
        }
    };

    const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
        emailCheckTimeout.current = setTimeout(() => {
            triggerEmailCheck(value.trim());
        }, 300);
    };

    const toggleRole = (role: Role) => {
        const isSelected = formData.roleIds.includes(role.id);
        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                roleIds: prev.roleIds.filter(id => id !== role.id)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                roleIds: [...prev.roleIds, role.id]
            }));
        }
    };

    const removeRole = (roleId: string) => {
        setFormData(prev => ({
            ...prev,
            roleIds: prev.roleIds.filter(id => id !== roleId)
        }));
    };

    const filteredRoles = allRoles.filter(role =>
        role.nameAr.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
        role.nameEn.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );

    // Filter and Paginate
    const filteredUsers = users.filter(user =>
        user.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const breadcrumbs = [
        { label: t('home'), onClick: () => navigate('/') },
        { label: t('users') }
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Helper to map calling code to ISO alpha-2 for flags
    const getCountryIsoCode = (callingCode: number): string => {
        const map: { [key: number]: string } = {
            966: 'sa', 1: 'us', 20: 'eg', 971: 'ae', 965: 'kw', 973: 'bh', 968: 'om', 974: 'qa', 962: 'jo', 44: 'gb', 91: 'in', 213: 'dz', 216: 'tn', 212: 'ma', 961: 'lb', 963: 'sy', 964: 'iq', 970: 'ps', 967: 'ye', 249: 'sd', 218: 'ly'
        };
        return map[callingCode] || 'xx';
    };

    return (
        <div className={`users-page ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="breadcrumb-container">
                <Breadcrumb items={breadcrumbs} />
            </div>

            <div className="users-header">
                <div className="header-info-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        className="btn-icon-edit"
                        onClick={() => navigate('/')}
                        style={{ width: '40px', height: '40px' }}
                    >
                        {language === 'ar' ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
                    </button>
                    <div className="title-row">
                        <h1>{t('users')}</h1>
                        <p className="header-subtitle">{t('manageUsers')}</p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="search-box-input" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '250px' }}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleCreate} style={{
                        background: '#c3924d',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgba(195, 146, 77, 0.2)'
                    }}>
                        <Plus size={20} />
                        {t('createUser')}
                    </button>
                </div>
            </div>

            <div className="users-main-area">
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>{t('name')}</th>
                                <th>{t('roles')}</th>
                                <th>{t('mobileNumber')}</th>
                                <th>{t('status')}</th>
                                <th style={{ textAlign: 'start' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ color: '#64748b' }}>{t('loading')}</div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon={UsersIcon}
                                            title={t('noUsersFound')}
                                            description={t('noUsersDescription')}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar-circle">
                                                    {getInitials(language === 'ar' ? user.nameAr : user.nameEn)}
                                                </div>
                                                <div className="user-text">
                                                    <span className="user-name-text">{language === 'ar' ? user.nameAr : user.nameEn}</span>
                                                    <span className="user-email-text">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {user.roles?.map((role, idx) => (
                                                    <span key={idx} className="role-pill">{role.roleName}</span>
                                                )) || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                                                {user.mobileCountryCode && (
                                                    <span>
                                                        {countries.find(c => c.countryCode === user.mobileCountryCode) ? (
                                                            <img
                                                                src={`https://flagcdn.com/w20/${getCountryIsoCode(user.mobileCountryCode)}.png`}
                                                                alt={`+${user.mobileCountryCode}`}
                                                                style={{ width: '20px', borderRadius: '2px', objectFit: 'cover' }}
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontWeight: 600 }}>+{user.mobileCountryCode}</span>
                                                        )}
                                                    </span>
                                                )}
                                                <Phone size={14} />
                                                <span>{user.mobileNumber || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${user.isActive ? 'status-active-pill' : 'status-inactive-pill'}`}>
                                                <div className="status-dot"></div>
                                                {user.isActive ? t('active') : t('inactive')}
                                            </span>
                                        </td>
                                        <td className="">
                                            <button className="btn-icon-edit" onClick={() => handleEdit(user)}>
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredUsers.length > 0 && (
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
                    overflowY: 'auto', padding: '40px 16px'
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '32px', borderRadius: '20px',
                        width: '100%', maxWidth: '750px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        margin: 'auto', display: 'flex', flexDirection: 'column'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                            {selectedUser ? t('editUser') : t('createUser')}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div className="modal-content-scroll">
                                <div className="form-group">
                                    <label>{t('email')} *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={(formData as CreateUserRequest).email}
                                            onChange={handleChange}
                                            onBlur={handleEmailBlur}
                                            required
                                            style={emailCheckStatus === 'checking' ? { paddingRight: '40px' } : undefined}
                                        />
                                        {emailCheckStatus === 'checking' && (
                                            <Loader2 size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', animation: 'users-spin 1s linear infinite' }} />
                                        )}
                                        {(emailCheckStatus === 'exists' || emailCheckStatus === 'available') && (
                                            <Check size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                                        )}
                                    </div>
                                </div>

                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>{t('nameAr')} *</label>
                                        <input
                                            name="nameAr"
                                            value={(formData as CreateUserRequest).nameAr}
                                            onChange={handleChange}
                                            required
                                            pattern="[\u0600-\u06FF\s]*"
                                            style={{ direction: 'rtl' }}
                                            disabled={apiFields.nameAr}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('nameEn')} *</label>
                                        <input name="nameEn" value={(formData as CreateUserRequest).nameEn} onChange={handleChange} required disabled={apiFields.nameEn} />
                                    </div>
                                </div>

                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>{t('countryCode')} *</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                name="mobileCountryCode"
                                                value={(formData as CreateUserRequest).mobileCountryCode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, mobileCountryCode: parseInt(e.target.value) }))}
                                                required
                                                style={{ paddingLeft: '40px' }} // Make space for flag
                                                disabled={apiFields.mobileCountryCode}
                                            >
                                                {countries.map(country => (
                                                    <option key={country.id} value={country.countryCode}>
                                                        {language === 'ar' ? country.countryNameAr : country.countryNameEn} (+{country.countryCode})
                                                    </option>
                                                ))}
                                            </select>
                                            {(formData as CreateUserRequest).mobileCountryCode && (
                                                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                    {(() => {
                                                        const c = countries.find(c => c.countryCode === (formData as CreateUserRequest).mobileCountryCode);
                                                        if (c) {
                                                            // Use helper to get ISO code
                                                            return <img
                                                                src={`https://flagcdn.com/w20/${getCountryIsoCode(c.countryCode)}.png`}
                                                                alt="flag"
                                                                style={{ width: '20px', borderRadius: '2px', objectFit: 'cover' }}
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />;

                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('mobileNumber')} *</label>
                                        <input
                                            type="text"
                                            name="mobileNumber"
                                            value={(formData as CreateUserRequest).mobileNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="5xxxxxxxxx"
                                            disabled={apiFields.mobileNumber}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t('identityNumber') || 'Identity Number'}</label>
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={(formData as CreateUserRequest).identityNumber || ''}
                                        onChange={handleChange}
                                        placeholder="1xxxxxxxxx"
                                        disabled={apiFields.identityNumber}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={(formData as CreateUserRequest).isActive}
                                            onChange={handleChange}
                                        />
                                        <span> {t('isActive')}</span>

                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>{t('roles')}</label>
                                    <div className="role-select-container" ref={roleDropdownRef}>
                                        <div
                                            className="role-select-trigger"
                                            onClick={(e) => {
                                                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                                            }}
                                        >
                                            {formData.roleIds.length === 0 ? (
                                                <span style={{ color: '#94a3b8', fontSize: '14px' }}>{t('selectRoles')}</span>
                                            ) : (
                                                formData.roleIds.map(roleId => {
                                                    const role = allRoles.find(r => r.id === roleId);
                                                    return (
                                                        <span key={roleId} className="role-tag">
                                                            {role ? (language === 'ar' ? role.nameAr : role.nameEn) : roleId}
                                                            <span
                                                                className="role-tag-remove"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeRole(roleId);
                                                                }}
                                                            >
                                                                <X size={14} />
                                                            </span>
                                                        </span>
                                                    );
                                                })
                                            )}
                                            <ChevronDown size={18} style={{ marginLeft: 'auto', color: '#64748b' }} />
                                        </div>

                                        {isRoleDropdownOpen && (
                                            <div className="role-dropdown">
                                                <div className="role-search-wrapper">
                                                    <input
                                                        type="text"
                                                        placeholder={t('searchRoles')}
                                                        value={roleSearchQuery}
                                                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                    />
                                                    <Search size={16} className="search-icon" />
                                                </div>
                                                <div className="role-options-list">
                                                    {filteredRoles.length === 0 ? (
                                                        <div className="no-roles-found">{t('noRolesFound')}</div>
                                                    ) : (
                                                        filteredRoles.map(role => (
                                                            <div
                                                                key={role.id}
                                                                className={`role-option ${formData.roleIds.includes(role.id) ? 'selected' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleRole(role);
                                                                }}
                                                            >
                                                                {language === 'ar' ? role.nameAr : role.nameEn}
                                                                {formData.roleIds.includes(role.id) && <Check size={16} />}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} style={{
                                    padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b'
                                }}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" disabled={isSubmitting} style={{
                                    padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#c3924d', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(195, 146, 77, 0.2)'
                                }}>
                                    {isSubmitting ? t('saving') : (selectedUser ? t('save') : t('create'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
