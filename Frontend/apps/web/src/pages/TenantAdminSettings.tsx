import React, { useState } from 'react';
import { Settings, Shield, Users, Bell, Lock, Database, Zap, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/CommonList.css';

interface TenantSettings {
  // Security Settings
  externalSharingEnabled: boolean;
  downloadEnabled: boolean;
  requireMFA: boolean;
  sessionTimeout: number;
  
  // Agent Settings
  agentAutoModeEnabled: boolean;
  agentCanMessageNonUsers: boolean;
  agentApprovalRequired: boolean;
  agentRateLimit: number;
  
  // Analyzer Settings
  autoAnalyzeEnabled: boolean;
  analyzerCreditsMonthly: number;
  confidenceThreshold: number;
  
  // Notification Settings
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  
  // Data Settings
  dataRetentionDays: number;
  enableAuditLogs: boolean;
  
  // Tenant Info
  tenantName: string;
  billingEmail: string;
}

const TenantAdminSettings: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<TenantSettings>({
    // Security
    externalSharingEnabled: false,
    downloadEnabled: true,
    requireMFA: false,
    sessionTimeout: 60,
    
    // Agent
    agentAutoModeEnabled: false,
    agentCanMessageNonUsers: false,
    agentApprovalRequired: true,
    agentRateLimit: 100,
    
    // Analyzer
    autoAnalyzeEnabled: true,
    analyzerCreditsMonthly: 1000,
    confidenceThreshold: 0.7,
    
    // Notifications
    emailNotificationsEnabled: true,
    whatsappNotificationsEnabled: false,
    
    // Data
    dataRetentionDays: 365,
    enableAuditLogs: true,
    
    // Tenant
    tenantName: 'My Organization',
    billingEmail: 'billing@example.com'
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'Security' | 'Agents' | 'Analyzer' | 'Notifications' | 'Data' | 'Tenant'>('Security');

  // Fixed tab keys — never translated, so comparisons always work
  const TAB_KEYS = ['Security', 'Agents', 'Analyzer', 'Notifications', 'Data', 'Tenant'] as const;
  const tabLabels: Record<string, string> = {
    Security:      t('security')      || 'Security',
    Agents:        t('agents')        || 'Agents',
    Analyzer:      t('analyzer')      || 'Analyzer',
    Notifications: t('notifications') || 'Notifications',
    Data:          t('data')          || 'Data',
    Tenant:        t('tenant')        || 'Tenant',
  };

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('tenantSettings') || 'Tenant Administration' }
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert(t('settingsSaved') || 'Settings saved successfully!');
  };

  const updateSetting = <K extends keyof TenantSettings>(key: K, value: TenantSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const headerActions = (
    <button className="btn-primary" onClick={handleSave} disabled={saving}>
      <Save size={18} />
      {saving ? (t('saving') || 'Saving...') : (t('saveSettings') || 'Save Settings')}
    </button>
  );

  const filters = TAB_KEYS.map(k => tabLabels[k]);

  const handleFilterChange = (label: string) => {
    // Reverse-map from translated label back to fixed key
    const key = TAB_KEYS.find(k => tabLabels[k] === label) ?? 'Security';
    setActiveTab(key as any);
  };

  const customContent = (
    <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        
        {/* Security Settings */}
        {activeTab === 'Security' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--brand-gold)"/>
              {t('securitySettings') || 'Security Settings'}
            </h2>
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.externalSharingEnabled}
                  onChange={(e) => updateSetting('externalSharingEnabled', e.target.checked)}
                />
                {t('enableExternalSharing') || 'Enable External Sharing'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('externalSharingDesc') || 'Allow users to share documents with external parties'}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.downloadEnabled}
                  onChange={(e) => updateSetting('downloadEnabled', e.target.checked)}
                />
                {t('enableDownloads') || 'Enable Document Downloads'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('downloadDesc') || 'Allow users to download documents locally'}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.requireMFA}
                  onChange={(e) => updateSetting('requireMFA', e.target.checked)}
                />
                <Lock size={16} />
                {t('requireMFA') || 'Require Multi-Factor Authentication'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('mfaDesc') || 'Force all users to enable MFA for enhanced security'}
              </p>
            </div>

            <div className="form-group">
              <label>{t('sessionTimeout') || 'Session Timeout (minutes)'}</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                style={{ width: '200px', marginTop: '8px' }}
                className="form-input"
              />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('sessionTimeoutDesc') || 'Automatically log out users after this period of inactivity'}
              </p>
            </div>
          </div>
        )}

        {/* Agent Settings */}
        {activeTab === 'Agents' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--brand-gold)" />
              {t('agentSettings') || 'Agent Settings'}
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.agentAutoModeEnabled}
                  onChange={(e) => updateSetting('agentAutoModeEnabled', e.target.checked)}
                />
                {t('enableAutoMode') || 'Enable Auto Mode'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('tenantAutoModeDesc') || 'Allow agents to execute actions automatically within safety guardrails'}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.agentCanMessageNonUsers}
                  onChange={(e) => updateSetting('agentCanMessageNonUsers', e.target.checked)}
                />
                {t('allowNonUserMessages') || 'Allow Messaging Non-Users'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('nonUserMessagesDesc') || 'Enable agents to send reminders to external contacts'}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.agentApprovalRequired}
                  onChange={(e) => updateSetting('agentApprovalRequired', e.target.checked)}
                />
                {t('requireApproval') || 'Require Approval for Agent Actions'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('approvalDesc') || 'Agent actions must be reviewed before execution'}
              </p>
            </div>

            <div className="form-group">
              <label>{t('agentRateLimit') || 'Agent Rate Limit (actions/day)'}</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.agentRateLimit}
                onChange={(e) => updateSetting('agentRateLimit', parseInt(e.target.value))}
                style={{ width: '200px', marginTop: '8px' }}
                className="form-input"
              />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('rateLimitDesc') || 'Maximum number of agent actions per day'}
              </p>
            </div>
          </div>
        )}

        {/* Analyzer Settings */}
        {activeTab === 'Analyzer' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="var(--brand-gold)" />
              {t('analyzerSettings') || 'Vault Analyzer Settings'}
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.autoAnalyzeEnabled}
                  onChange={(e) => updateSetting('autoAnalyzeEnabled', e.target.checked)}
                />
                {t('autoAnalyze') || 'Auto-Analyze Documents on Upload'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('autoAnalyzeDesc') || 'Automatically classify and extract data when documents are uploaded'}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>{t('monthlyCredits') || 'Monthly Analyzer Credits'}</label>
              <input
                type="number"
                min="100"
                value={settings.analyzerCreditsMonthly}
                onChange={(e) => updateSetting('analyzerCreditsMonthly', parseInt(e.target.value))}
                style={{ width: '200px', marginTop: '8px' }}
                className="form-input"
              />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('creditsDesc') || 'Number of pages that can be analyzed per month'}
              </p>
            </div>

            <div className="form-group">
              <label>{t('confidenceThreshold') || 'Confidence Threshold'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={settings.confidenceThreshold}
                    onChange={(e) => updateSetting('confidenceThreshold', parseFloat(e.target.value))}
                    style={{ width: '300px' }}
                  />
                  <span style={{ fontWeight: '600', minWidth: '40px' }}>
                    {Math.round(settings.confidenceThreshold * 100)}%
                  </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('thresholdDesc') || 'Documents below this confidence require manual review'}
              </p>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'Notifications' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="var(--brand-gold)" />
              {t('notificationSettings') || 'Notification Settings'}
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) => updateSetting('emailNotificationsEnabled', e.target.checked)}
                />
                <Mail size={16} />
                {t('enableEmailNotifications') || 'Enable Email Notifications'}
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.whatsappNotificationsEnabled}
                  onChange={(e) => updateSetting('whatsappNotificationsEnabled', e.target.checked)}
                />
                {t('enableWhatsAppNotifications') || 'Enable WhatsApp Notifications'}
              </label>
            </div>
          </div>
        )}

        {/* Data Settings */}
        {activeTab === 'Data' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="var(--brand-gold)" />
              {t('dataSettings') || 'Data & Compliance Settings'}
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>{t('dataRetention') || 'Default Data Retention (days)'}</label>
              <input
                type="number"
                min="30"
                value={settings.dataRetentionDays}
                onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value))}
                style={{ width: '200px', marginTop: '8px' }}
                className="form-input"
              />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('retentionDesc') || 'Default retention period for documents (can be overridden per workspace)'}
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableAuditLogs}
                  onChange={(e) => updateSetting('enableAuditLogs', e.target.checked)}
                />
                {t('enableAuditLogs') || 'Enable Audit Logs'}
              </label>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                {t('auditLogsDesc') || 'Track all user actions for compliance and security'}
              </p>
            </div>
          </div>
        )}

        {/* Tenant Info */}
        {activeTab === 'Tenant' && (
          <div>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--brand-gold)" />
              {t('tenantInfo') || 'Tenant Information'}
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>{t('tenantName') || 'Organization Name'}</label>
              <input
                type="text"
                value={settings.tenantName}
                onChange={(e) => updateSetting('tenantName', e.target.value)}
                placeholder={t('enterTenantName') || 'Enter organization name'}
                className="form-input"
                style={{ marginTop: '8px' }}
              />
            </div>

            <div className="form-group">
              <label>{t('billingEmail') || 'Billing Email'}</label>
              <input
                type="email"
                value={settings.billingEmail}
                onChange={(e) => updateSetting('billingEmail', e.target.value)}
                placeholder={t('enterBillingEmail') || 'Enter billing email'}
                className="form-input"
                style={{ marginTop: '8px' }}
              />
            </div>
          </div>
        )}

      </div>
  );

  return (
    <DocumentsLayout
      title={t('tenantSettings') || 'Tenant Administration'}
      subtitle={t('tenantSettingsSubtitle') || 'Manage tenant-wide settings, security, and policies'}
      headerIcon={Settings}
      headerIconColor="var(--brand-gold)"
      breadcrumb={<Breadcrumb items={breadcrumbs} />}
      actions={headerActions}
      showFilterBar={true}
      filters={filters}
      defaultFilter={tabLabels[activeTab]}
      onFilterChange={handleFilterChange}
      documents={[]}
      customContent={customContent}
      hideDocuments={true}
    />
  );
};

export default TenantAdminSettings;
