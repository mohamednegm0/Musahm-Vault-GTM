import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MainContent from './components/MainContent'
import Registration from './pages/Registration'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AdminPartnerLogin from './pages/AdminPartnerLogin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'
import Starred from './pages/Starred'
import AIChat from './pages/AIChat'
import WorkspaceExplorer from './pages/WorkspaceExplorer'
import DocumentDetails from './pages/DocumentDetails'
import DocumentUpload from './pages/DocumentUpload'
import DocumentVersions from './pages/DocumentVersions'
import DocumentPermissions from './pages/DocumentPermissions'
import SharedDocuments from './pages/SharedDocuments'
import WorkspaceMembers from './pages/WorkspaceMembers'
import WorkspaceInvite from './pages/WorkspaceInvite'
import WorkspaceSettings from './pages/WorkspaceSettings'
import Activities from './pages/Activities'
import Tasks from './pages/Tasks'
import Obligations from './pages/Obligations'
import Workflows from './pages/Workflows'
import SearchVault from './pages/SearchVault'
import ExtractionReview from './pages/ExtractionReview'
import Invitations from './pages/Invitations'
import AgentActions from './pages/AgentActions'
import AuditLogs from './pages/AuditLogs'
import Users from './pages/Users'
import Dashboard from './pages/Dashboard'
import RetentionPolicies from './pages/RetentionPolicies'
import WorkflowInstances from './pages/WorkflowInstances'
import TenantAdminSettings from './pages/TenantAdminSettings'
import InvitationAccept from './pages/InvitationAccept'
import InvitationPreview from './pages/InvitationPreview'
import WorkflowEditorPage from './pages/WorkflowEditorPage'
import WorkflowAssignmentsPage from './pages/WorkflowAssignmentsPage'
import Permissions from './pages/Permissions'
import RecycleBinPage from './pages/RecycleBinPage'
import TokenAuth from './pages/TokenAuth'
import MyCompanies from './pages/MyCompanies'
import { GlobalTooltip } from './components/GlobalTooltip'
import { LoadingProvider } from './contexts/LoadingContext'
import Loader from './components/Loader'
import './App.css'

import { WorkspaceProvider } from './contexts/WorkspaceContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <LoadingProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <BrowserRouter>
              <GlobalTooltip />
              <Loader />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/login/adminP" element={<AdminPartnerLogin />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/api/Auth/reset-password" element={<ResetPassword />} /> {/* Providing explicit path just in case, or standard route */}
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invitation/accept" element={<InvitationAccept />} />
                <Route path="/invitation/preview" element={<InvitationPreview />} />
                <Route path="/auth" element={<TokenAuth />} />

                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <ChangePassword />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                {/* ... other routes ... */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Profile />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/starred"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Starred />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shared"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <SharedDocuments />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-chat"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <AIChat />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace/:workspaceId"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkspaceExplorer />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace/:workspaceId/members"
                  element={<Navigate to="../invite" replace />}
                />
                <Route
                  path="/workspace/:workspaceId/invite"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkspaceInvite />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/workspace/:workspaceId/settings"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkspaceSettings />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/document/upload"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <DocumentUpload />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/document/:documentId"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <DocumentDetails />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/document/:documentId/versions"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <DocumentVersions />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Activities />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Tasks />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/:taskId"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Tasks />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/obligations"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Obligations />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflows"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Workflows />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflows/new"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkflowEditorPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflows/:id/edit"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkflowEditorPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow-assignments/:workflowId"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkflowAssignmentsPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow-instances"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <WorkflowInstances />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/retention-policies"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <RetentionPolicies />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Dashboard />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <TenantAdminSettings />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <SearchVault />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/extractions"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <ExtractionReview />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invitations"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Invitations />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent-actions"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <AgentActions />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <TenantAdminSettings />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Users />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <AuditLogs />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/document/:documentId/permissions"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <DocumentPermissions />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/permissions"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <Permissions />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-companies"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <MyCompanies />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recycle-bin"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <RecycleBinPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <div className="app">
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <div className="app-main">
                          <Header onMenuClick={() => setSidebarOpen(true)} />
                          <MainContent />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </WorkspaceProvider >
        </ToastProvider >
      </LoadingProvider>
    </AuthProvider >
  )
}

export default App

