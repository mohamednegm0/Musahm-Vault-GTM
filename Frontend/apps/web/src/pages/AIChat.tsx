import React, { useState, useRef, useEffect } from 'react';
import {
  SendHorizontal,
  Bot,
  User,
  FileText,
  Clock,
  PenTool,
  Shield,
  FileSearch,
  Lock,
  BarChart,
  Sparkles,
  Plus,
  Paperclip,
  X,
  File
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage
import './AIChat.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachment?: { name: string; type: string };
}

interface Agent {
  id: string;
  nameKey: string; // Changed to nameKey for translation
  icon: React.ElementType;
  descKey: string; // Changed to descKey for translation
  color?: string;
}

const agents: Agent[] = [
  { id: 'auto', nameKey: 'agent_auto', icon: Sparkles, descKey: 'agent_desc_auto' },
  { id: 'docs', nameKey: 'agent_docs', icon: FileText, descKey: 'agent_desc_docs' },
  { id: 'deadlines', nameKey: 'agent_deadlines', icon: Clock, descKey: 'agent_desc_deadlines' },
  { id: 'signing', nameKey: 'agent_signing', icon: PenTool, descKey: 'agent_desc_signing' },
  { id: 'governance', nameKey: 'agent_governance', icon: Shield, descKey: 'agent_desc_governance' },
  { id: 'audit', nameKey: 'agent_audit', icon: FileSearch, descKey: 'agent_desc_audit' },
  { id: 'access', nameKey: 'agent_access', icon: Lock, descKey: 'agent_desc_access' },
  { id: 'insights', nameKey: 'agent_insights', icon: BarChart, descKey: 'agent_desc_insights' },
];

const AIChat: React.FC = () => {
  const { t, language } = useLanguage(); // Use hook
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: string } | null>(null);
  const [agentMode, setAgentMode] = useState<'draft' | 'auto'>('draft'); // Draft mode by default

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if ((!input.trim() && !attachment)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachment: attachment ? { ...attachment } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI response
    setTimeout(() => {
      const agentName = t(selectedAgent.nameKey);
      const mode = agentMode === 'draft' ? t('draftMode') : t('autoMode');
      let responseText = language === 'ar'
        ? `${t('agentUsingPrefix')} **${agentName}** ${t('agentModePrefix')} **${mode}**. `
        : `${t('agentUsingPrefix')} **${agentName}** ${t('agentModePrefix')} **${mode}**. `;

      if (agentMode === 'draft') {
        responseText += t('draftModeDesc') + ' ';
      } else {
        responseText += t('autoModeDesc') + ' ';
      }

      if (userMessage.attachment) {
        responseText += language === 'ar'
          ? `${t('agentFileUploaded')} "${userMessage.attachment.name}". `
          : `${t('agentFileUploaded')} "${userMessage.attachment.name}". `;
      }

      responseText += `${t('agentMessageReceived')} "${userMessage.content}". ${t('agentSimulatedResponse')}`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowPlusMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
      setShowPlusMenu(false);
    }
  };

  const suggestions = [
    { title: t('suggestion_expiring'), desc: t('suggestion_expiring_desc') },
    { title: t('suggestion_summarize'), desc: t('suggestion_summarize_desc') },
    { title: t('suggestion_access'), desc: t('suggestion_access_desc') },
    { title: t('suggestion_draft'), desc: t('suggestion_draft_desc') },
  ];

  const currentAgentName = t(selectedAgent.nameKey);

  return (
    <div className="ai-chat-container">
      <div className={`ai-chat-main ${messages.length > 0 ? 'has-messages' : ''}`}>

        {/* Agent Mode Selector */}
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '16px', 
          display: 'flex', 
          gap: '8px',
          zIndex: 10
        }}>
          <button
            onClick={() => setAgentMode('draft')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: agentMode === 'draft' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: agentMode === 'draft' ? 'var(--primary)' : 'var(--bg-surface)',
              color: agentMode === 'draft' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: agentMode === 'draft' ? '600' : '400'
            }}
          >
            {t('draftMode')}
          </button>
          <button
            onClick={() => setAgentMode('auto')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: agentMode === 'auto' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: agentMode === 'auto' ? 'var(--primary)' : 'var(--bg-surface)',
              color: agentMode === 'auto' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: agentMode === 'auto' ? '600' : '400'
            }}
          >
            {t('autoMode')}
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="empty-state">
            <h1 className="greeting-text">{t('whatToStartWith')}</h1>

            <div className="suggestions-grid">
              {suggestions.map((s, idx) => (
                <div key={idx} className="suggestion-card" onClick={() => setInput(s.desc)}>
                  <span className="suggestion-title">{s.title}</span>
                  {s.desc}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="message-content">
                  {msg.attachment && (
                    <div className="attachment-preview" style={{ marginLeft: 0, marginBottom: '0.5rem' }}>
                      <File size={16} />
                      <span>{msg.attachment.name}</span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ai">
                <div className="message-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-content">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="input-container-wrapper">
          <div className="chat-input-box">
            {/* Plus Button with Menu */}
            <div style={{ position: 'relative' }}>
              <button
                className="plus-btn"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                data-tooltip-content={t('actions')}
              >
                <Plus size={20} />
              </button>

              {showPlusMenu && (
                <div className="plus-menu-popover" ref={menuRef}>
                  <div className="menu-section">
                    <div className="menu-label">{t('actions')}</div>
                    <label className="menu-item">
                      <div className="menu-item-icon"><Paperclip size={18} /></div>
                      <span>{t('uploadFile')}</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <div className="menu-section">
                    <div className="menu-label">{t('selectAgent')}</div>
                    {agents.map(agent => (
                      <div
                        key={agent.id}
                        className={`menu-item ${selectedAgent.id === agent.id ? 'active' : ''}`}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        <div className="menu-item-icon">
                          <agent.icon size={18} />
                        </div>
                        <span>{t(agent.nameKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {attachment && (
                <div className="attachment-preview">
                  <File size={14} />
                  <span>{attachment.name}</span>
                  <button className="remove-attachment" onClick={() => setAttachment(null)} data-tooltip-content={t('removeAttachment')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder={`${t('message')} ${currentAgentName}...`}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                dir="auto"
              />
            </div>

            <button
              className={`send-btn-round ${(input.trim() || attachment) ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() && !attachment}
            >
              <SendHorizontal size={20} className={language === 'ar' ? 'mirror-rtl' : ''} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIChat;
