import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Search,
    Plus,
    Building
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { userService, EmployeeCompany } from '../api/users';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { jwtDecode } from 'jwt-decode';

import './Users.css'; // Reusing Users.css for the requested matching design

const MyCompanies: React.FC = () => {
    const { t, language } = useLanguage();
    const { error: toastError, success: toastSuccess } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [companies, setCompanies] = useState<EmployeeCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        companyNameAr: '',
        companyNameEn: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user && user.token) {
            fetchCompanies();
        }
    }, [user]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);

            // Extract employeeId from token
            let employeeId = '';
            if (user?.token) {
                const decodedToken: any = jwtDecode(user.token);
                // Commonly used claims for user ID in .NET
                employeeId = sessionStorage.getItem('userId') || '';
            }

            if (!employeeId) {
                toastError(t('employeeIdNotFound') || 'Employee ID not found in token');
                setLoading(false);
                return;
            }

            const response = await userService.getEmployeeCompanies(employeeId);
            if (response.apiStatusCode === 200) {
                setCompanies(response.returnData || []);
            } else {
                toastError(response.errorMessage || t('failedToLoadCompanies') || 'Failed to load companies');
            }
        } catch (error: any) {
            console.error('Error fetching companies:', error);
            const apiError = error.response?.data?.errorMessage;
            toastError(apiError || t('failedToLoadCompanies') || 'Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = () => {
        setFormData({ companyNameAr: '', companyNameEn: '' });
        setShowModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'companyNameAr') {
            // Keep only Arabic characters, numbers, dashes and spaces
            const arabicRegex = /[^0-9\u0600-\u06FF\s-]/g;
            const cleanedValue = value.replace(arabicRegex, '');
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let fullNameAr = '';
            let fullNameEn = '';
            let email = '';

            if (user?.token) {
                const decodedToken: any = jwtDecode(user.token);
                // Get email and full names from token mapping
                fullNameAr = decodedToken.NameAr || decodedToken.name || '';
                fullNameEn = decodedToken.NameEn || decodedToken.unique_name || '';
                email = decodedToken.Email || decodedToken.email || user?.email || '';
            }

            const payload = {
                fullNameAr,
                fullNameEn,
                email,
                companyNameAr: formData.companyNameAr,
                companyNameEn: formData.companyNameEn,
                password: "Usr.1234",
                confirmPassword: "Usr.1234"
            };

            const response = await userService.registerCompany(payload);
            if (response.apiStatusCode === 200) {
                toastSuccess(response.successMessage || t('companyCreatedSuccessfully') || 'Company created successfully');
                setShowModal(false);
                fetchCompanies();
            } else {
                toastError(response.errorMessage || t('failedToCreateCompany') || 'Failed to create company');
            }
        } catch (error: any) {
            console.error('Error creating company:', error);
            const apiError = error.response?.data?.errorMessage;
            toastError(apiError || t('failedToCreateCompany') || 'Failed to create company');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter and Paginate
    const filteredCompanies = companies.filter(company =>
        (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.companyTypeName && company.companyTypeName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const breadcrumbs = [
        { label: t('home'), onClick: () => navigate('/') },
        { label: t('myCompanies') || 'My Companies' }
    ];

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
                        <h1>{t('myCompanies') || 'My Companies'}</h1>
                        <p className="header-subtitle">{t('manageMyCompanies') || 'View and manage your companies'}</p>
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="search-box-input" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder') || 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '250px' }}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleAddCompany} style={{
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
                        {t('addNewCompany') || 'Add New Company'}
                    </button>
                </div>
            </div>

            <div className="users-main-area">
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                {/* <th>{t('logo') || 'Logo'}</th> */}
                                <th>{t('companyName') || 'Company Name'}</th>
                                <th>{t('companyType') || 'Company Type'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ color: '#64748b' }}>{t('loading')}</div>
                                    </td>
                                </tr>
                            ) : filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <EmptyState
                                            icon={Building}
                                            title={t('noCompaniesFound') || 'No Companies Found'}
                                            description={t('noCompaniesDescription') || 'There are no companies assigned to you.'}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginatedCompanies.map((company) => (
                                    <tr key={company.id}>
                                        <td>{company.rowNumber}</td>
                                        {/* <td>
                                            {company.logo ? (
                                                <img
                                                    src={company.logo.startsWith('data:image') || company.logo.startsWith('http') || company.logo.startsWith('/') ? company.logo : `data:image/jpeg;base64,${company.logo}`}
                                                    alt={company.name}
                                                    style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                    <Building size={20} />
                                                </div>
                                            )}
                                        </td> */}
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.name}</span>
                                        </td>
                                        <td>
                                            <span className="role-pill">{company.companyTypeName}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredCompanies.length > 0 && (
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredCompanies.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>

            {/* Create Company Modal */}
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
                            {t('addNewCompany') || 'Add New Company'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div className="modal-content-scroll">
                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>{t('companyNameAr') || 'Company Name (Ar)'} *</label>
                                        <input
                                            name="companyNameAr"
                                            value={formData.companyNameAr}
                                            onChange={handleChange}
                                            required
                                            style={{ direction: 'rtl' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('companyNameEn') || 'Company Name (En)'} *</label>
                                        <input
                                            name="companyNameEn"
                                            value={formData.companyNameEn}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} style={{
                                    padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b'
                                }}>
                                    {t('cancel') || 'Cancel'}
                                </button>
                                <button type="submit" disabled={isSubmitting} style={{
                                    padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#c3924d', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(195, 146, 77, 0.2)'
                                }}>
                                    {isSubmitting ? t('saving') || 'Saving...' : t('create') || 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCompanies;
