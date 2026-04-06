import React, { useState, useEffect } from 'react';
import { Shield, Eye, MessageSquare, Edit3, Settings, Crown, Check, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useLanguage } from '../contexts/LanguageContext';
import { roleService, Role, Permission } from '../api/permissions';
import Breadcrumb from '../components/Breadcrumb';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import './Permissions.css';

interface RoleWithPermissions extends Role {
    permissionsList: Permission[];
}

const Permissions: React.FC = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchRolesAndPermissions = async () => {
            try {
                const rolesRes = await roleService.getAll();
                if (rolesRes.isSucceeded && rolesRes.returnData) {
                    const rolesWithPerms = await Promise.all(
                        rolesRes.returnData.map(async (role) => {
                            const permsRes = await roleService.getPermissions(role.id);
                            return {
                                ...role,
                                permissionsList: permsRes.isSucceeded ? permsRes.returnData : []
                            };
                        })
                    );
                    setRoles(rolesWithPerms.sort((a, b) => a.level - b.level));
                }
            } catch (error) {
                console.error('Error fetching roles and permissions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRolesAndPermissions();
    }, []);

    const getRoleIcon = (code: string) => {
        const iconProps = { size: 22, strokeWidth: 2.5 };
        switch (code.toLowerCase()) {
            case 'viewer':
                return <Eye {...iconProps} />;
            case 'commenter':
                return <MessageSquare {...iconProps} />;
            case 'editor':
                return <Edit3 {...iconProps} />;
            case 'organizer':
                return <Settings {...iconProps} />;
            case 'admin':
                return <Crown {...iconProps} />;
            default:
                return <Shield {...iconProps} />;
        }
    };

    const toggleExpanded = (roleId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roleId)) {
                newSet.delete(roleId);
            } else {
                newSet.add(roleId);
            }
            return newSet;
        });
    };

    const breadcrumbItems = [
        { label: t('dashboard'), path: '/dashboard' },
        { label: t('rolesAndPermissions'), path: '/permissions', active: true }
    ];

    return (
        <div className="permissions-page">
            <Breadcrumb items={breadcrumbItems} />

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
                        <h1>{t('teamFolderRolesAndPermissions')}</h1>
                        <p className="header-subtitle">{t('rolesAndPermissions')}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p className="loading-text">Loading permissions...</p>
                </div>
            ) : (
                <div className="roles-swiper-container">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: true,
                            pauseOnMouseEnter: true
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 15,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            1400: {
                                slidesPerView: 4,
                                spaceBetween: 20,
                            },
                        }}
                        className="roles-swiper"
                    >
                        {roles.map((role, index) => {
                            const isExpanded = expandedCards.has(role.id);
                            const hasMoreThan5 = role.permissionsList.length > 5;
                            const displayedPermissions = isExpanded
                                ? role.permissionsList
                                : role.permissionsList.slice(0, 5);

                            return (
                                <SwiperSlide key={role.id}>
                                    <div className="role-card">
                                        <div className="role-card-header">
                                            <div className="role-icon-wrapper">
                                                {getRoleIcon(role.code)}
                                            </div>
                                            <h2 className="role-name">
                                                {language === 'ar' ? role.nameAr : role.nameEn}
                                            </h2>
                                        </div>

                                        <div className="role-description">
                                            {language === 'ar' ? role.descriptionAr : role.descriptionEn}
                                        </div>

                                        <div className="permissions-list-container">
                                            {index > 0 && (
                                                <div className="everything-label">
                                                    <span style={{ fontSize: '16px' }}>✨</span>
                                                    {t('everything')} {language === 'ar' ? roles[index - 1].nameAr : roles[index - 1].nameEn} {t('canDo')} {t('plus')}
                                                </div>
                                            )}

                                            <ul className={`permissions-list ${isExpanded ? 'expanded' : ''}`}>
                                                {displayedPermissions.length > 0 ? (
                                                    displayedPermissions.map((perm) => (
                                                        <li key={perm.id} className="permission-item">
                                                            <span>{language === 'ar' ? perm.nameAr : perm.nameEn}</span>
                                                            <Check size={16} className="permission-item-dot" strokeWidth={3} />
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="permission-item" style={{ color: '#94a3b8', fontStyle: 'italic', justifyContent: 'center' }}>
                                                        <Shield size={16} style={{ opacity: 0.5 }} />
                                                        <span>No specific permissions assigned</span>
                                                    </li>
                                                )}
                                            </ul>

                                            {hasMoreThan5 && (
                                                <button
                                                    className={`see-more-btn ${isExpanded ? 'expanded' : ''}`}
                                                    onClick={() => toggleExpanded(role.id)}
                                                >
                                                    {isExpanded ? 'See Less' : `See More (${role.permissionsList.length - 5} more)`}
                                                    <ChevronDown size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            )}
        </div>
    );
};

export default Permissions;
