import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Camera, Home, RefreshCw, ChevronLeft, ChevronRight, Star, Shield, Menu as MenuIcon, X, User, LogOut, Search, Plus, Settings, Lock, Globe, Eye, EyeOff, Sparkles, BookOpen, Zap, Brain, Users, Briefcase, Coffee, Gamepad2, GraduationCap, ShoppingBag, Copy, Check, FileText, MessageSquare, Languages, Volume2, Loader2, MoreVertical, Tablet } from 'lucide-react';
import './index.css';

// Check if running in Electron
const isElectron = window.electronAPI?.isElectron || false;

// Supabase Configuration
const SUPABASE_URL = 'https://ttkttetepaqvexmhymvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a3R0ZXRlcGFxdmV4bWh5bXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzM4MTAsImV4cCI6MjA4MjAwOTgxMH0.7e1ZT-VOLm3P_V1ndcGSnP4oUtLkCwUwVQGuVkWuMdY';

// Initialize Supabase Client
const createClient = (url, key) => ({
  auth: {
    signUp: async ({ email, password }) => {
      const response = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key
        },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    },
    signInWithPassword: async ({ email, password }) => {
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key
        },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    }
  }
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// VPN Providers Configuration
const VPN_PROVIDERS = [
  { id: 'mullvad', name: 'Mullvad VPN', endpoint: 'wg://mullvad.net', type: 'wireguard' },
  { id: 'proton', name: 'ProtonVPN', endpoint: 'wg://protonvpn.com', type: 'wireguard' },
  { id: 'nordvpn', name: 'NordVPN', endpoint: 'wg://nordvpn.com', type: 'wireguard' },
  { id: 'expressvpn', name: 'ExpressVPN', endpoint: 'https://expressvpn.com', type: 'https' },
  { id: 'custom', name: 'Custom VPN', endpoint: '', type: 'custom' }
];

// Workspace presets
const WORKSPACE_PRESETS = [
  { id: 'work', name: 'Work', icon: Briefcase, color: 'blue', description: 'Professional browsing' },
  { id: 'personal', name: 'Personal', icon: User, color: 'purple', description: 'Personal activities' },
  { id: 'research', name: 'Research', icon: GraduationCap, color: 'green', description: 'Deep research mode' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'pink', description: 'Online shopping' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: 'orange', description: 'Gaming & videos' },
  { id: 'social', name: 'Social', icon: Users, color: 'cyan', description: 'Social media' },
];

const FlowBrowser = () => {
  // Tab and navigation state
  const [workspaces, setWorkspaces] = useState([
    { id: 'default', name: 'Personal', icon: User, color: 'purple', tabs: [{ id: 1, url: 'about:blank', title: 'New Tab', history: ['about:blank'], historyIndex: 0 }] }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  
  // Security and privacy state
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [vpnProvider, setVpnProvider] = useState('mullvad');
  const [antiFingerprint, setAntiFingerprint] = useState(true);
  const [blockTrackers, setBlockTrackers] = useState(true);
  const [autoDeleteCookies, setAutoDeleteCookies] = useState(true);
  
  // User and settings state
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [securityLevel, setSecurityLevel] = useState('maximum');
  const [showPassword, setShowPassword] = useState(false);
  
  // AI Assistant state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMode, setAiMode] = useState('summarize');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  
  // Workspace management
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    // Check viewport size
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Remove loading screen after component mounts
    const timer = setTimeout(() => {
      const loadingScreen = document.querySelector('.loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 300);
      }
    }, 500);

    checkUser();
    loadBookmarks();
    loadWorkspaces();

    // Set up Electron event listeners
    if (isElectron) {
      window.electronAPI.onPageLoaded((data) => {
        const currentWorkspace = workspaces[activeWorkspace];
        const currentTab = currentWorkspace.tabs[activeTab];
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[activeWorkspace].tabs[activeTab] = {
          ...currentTab,
          url: data.url,
          title: data.title || data.url
        };
        setWorkspaces(updatedWorkspaces);
        setUrlInput(data.url);
      });

      window.electronAPI.onPageTitleUpdated((title) => {
        const currentWorkspace = workspaces[activeWorkspace];
        const currentTab = currentWorkspace.tabs[activeTab];
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[activeWorkspace].tabs[activeTab] = {
          ...currentTab,
          title: title
        };
        setWorkspaces(updatedWorkspaces);
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('flow_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const loadWorkspaces = () => {
    const saved = localStorage.getItem('flow_workspaces');
    if (saved) {
      setWorkspaces(JSON.parse(saved));
    }
  };

  const saveWorkspaces = (newWorkspaces) => {
    localStorage.setItem('flow_workspaces', JSON.stringify(newWorkspaces));
    setWorkspaces(newWorkspaces);
  };

  const saveBookmarks = (newBookmarks) => {
    localStorage.setItem('flow_bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      setUser(data.user);
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setUser(data.user);
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Workspace Management
  const addWorkspace = (preset) => {
    const newWorkspace = {
      id: Date.now(),
      name: preset.name,
      icon: preset.icon,
      color: preset.color,
      tabs: [{ id: Date.now(), url: 'about:blank', title: 'New Tab', history: ['about:blank'], historyIndex: 0 }]
    };
    saveWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(workspaces.length);
    setActiveTab(0);
    setShowNewWorkspace(false);
  };

  const deleteWorkspace = (index) => {
    if (workspaces.length === 1) return;
    const newWorkspaces = workspaces.filter((_, i) => i !== index);
    saveWorkspaces(newWorkspaces);
    if (activeWorkspace >= index && activeWorkspace > 0) {
      setActiveWorkspace(activeWorkspace - 1);
    }
    setActiveTab(0);
  };

  const switchWorkspace = (index) => {
    setActiveWorkspace(index);
    setActiveTab(0);
    setShowWorkspaces(false);
    setShowMobileMenu(false);
  };

  // Tab Management
  const addTab = () => {
    const currentWorkspace = workspaces[activeWorkspace];
    const newTab = {
      id: Date.now(),
      url: 'about:blank',
      title: 'New Tab',
      history: ['about:blank'],
      historyIndex: 0
    };
    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[activeWorkspace] = {
      ...currentWorkspace,
      tabs: [...currentWorkspace.tabs, newTab]
    };
    saveWorkspaces(updatedWorkspaces);
    setActiveTab(currentWorkspace.tabs.length);
  };

  const closeTab = (index) => {
    const currentWorkspace = workspaces[activeWorkspace];
    if (currentWorkspace.tabs.length === 1) return;
    
    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[activeWorkspace] = {
      ...currentWorkspace,
      tabs: currentWorkspace.tabs.filter((_, i) => i !== index)
    };
    saveWorkspaces(updatedWorkspaces);
    
    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const navigateToUrl = async (url) => {
    if (!url || url.trim() === '') return;
    
    if (isElectron) {
      // Use Electron's BrowserView for navigation
      const result = await window.electronAPI.navigate(url, {
        proxyEnabled,
        vpnEnabled,
        blockTrackers,
        antiFingerprint
      });

      if (result.success) {
        const currentWorkspace = workspaces[activeWorkspace];
        const currentTab = currentWorkspace.tabs[activeTab];
        const newHistory = currentTab.history.slice(0, currentTab.historyIndex + 1);
        newHistory.push(result.url);

        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[activeWorkspace].tabs[activeTab] = {
          ...currentTab,
          url: result.url,
          title: result.title || 'Loading...',
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
        saveWorkspaces(updatedWorkspaces);
        setUrlInput(result.url);
      }
    } else {
      // Fallback for web version (not recommended for production)
      alert('This browser works best as an Electron app. Please use the desktop version for full functionality.');
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    navigateToUrl(urlInput);
  };

  const goBack = async () => {
    if (isElectron) {
      await window.electronAPI.goBack();
    }
  };

  const goForward = async () => {
    if (isElectron) {
      await window.electronAPI.goForward();
    }
  };

  const reload = async () => {
    if (isElectron) {
      await window.electronAPI.reload();
    }
  };

  const goHome = () => {
    navigateToUrl('about:blank');
  };

  const addBookmark = () => {
    const currentWorkspace = workspaces[activeWorkspace];
    const currentTab = currentWorkspace.tabs[activeTab];
    
    if (currentTab.url !== 'about:blank') {
      const newBookmark = {
        id: Date.now(),
        url: currentTab.url,
        title: currentTab.title,
        workspace: currentWorkspace.name
      };
      saveBookmarks([...bookmarks, newBookmark]);
    }
  };

  const removeBookmark = (id) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const toggleProxy = () => {
    setProxyEnabled(!proxyEnabled);
  };

  const toggleVPN = () => {
    setVpnEnabled(!vpnEnabled);
  };

  // AI Assistant Functions
  const extractPageContent = async () => {
    if (isElectron) {
      const result = await window.electronAPI.getPageContent();
      if (result.success) {
        return `Title: ${result.content.title}\nURL: ${result.content.url}\n\nContent:\n${result.content.text}`;
      }
    }
    return 'No page loaded. Please navigate to a webpage first.';
  };

  const callClaudeAPI = async (prompt, systemPrompt) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('AI API Error:', error);
      return 'Error: Unable to process request. Please try again.';
    }
  };

  const handleAISummarize = async () => {
    setAiLoading(true);
    const content = await extractPageContent();
    
    const systemPrompt = "You are a helpful AI assistant that summarizes web content concisely and clearly. Provide key points and main takeaways.";
    const prompt = `Please summarize this webpage content:\n\n${content}`;
    
    const response = await callClaudeAPI(prompt, systemPrompt);
    setAiResponse(response);
    setAiLoading(false);
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    const content = await extractPageContent();
    
    const systemPrompt = "You are a helpful AI assistant that answers questions about web content accurately and helpfully.";
    const prompt = `Based on this webpage content:\n\n${content}\n\nQuestion: ${aiQuestion}`;
    
    const response = await callClaudeAPI(prompt, systemPrompt);
    setAiResponse(response);
    setAiLoading(false);
  };

  const handleAIExplain = async () => {
    setAiLoading(true);
    const content = await extractPageContent();
    
    const systemPrompt = "You are a helpful AI assistant that explains complex topics in simple, easy-to-understand language.";
    const prompt = `Please explain this webpage content in simple terms:\n\n${content}`;
    
    const response = await callClaudeAPI(prompt, systemPrompt);
    setAiResponse(response);
    setAiLoading(false);
  };

  const handleAITranslate = async (targetLanguage = 'Spanish') => {
    setAiLoading(true);
    const content = await extractPageContent();
    
    const systemPrompt = `You are a helpful AI translator. Translate the content to ${targetLanguage} accurately while preserving meaning and tone.`;
    const prompt = `Please translate this webpage content to ${targetLanguage}:\n\n${content}`;
    
    const response = await callClaudeAPI(prompt, systemPrompt);
    setAiResponse(response);
    setAiLoading(false);
  };

  const copyAIResponse = () => {
    navigator.clipboard.writeText(aiResponse);
  };

  const currentWorkspace = workspaces[activeWorkspace];
  const currentTab = currentWorkspace.tabs[activeTab];
  const WorkspaceIcon = currentWorkspace.icon;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-cyan-500/30 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg shadow-cyan-500/10 relative z-50">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Globe className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          {!isMobile && (
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Flow
            </span>
          )}
        </div>

        {/* Workspace Indicator - Hidden on mobile */}
        {!isMobile && (
          <button
            onClick={() => setShowWorkspaces(!showWorkspaces)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <WorkspaceIcon className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm text-cyan-400 hidden sm:inline">{currentWorkspace.name}</span>
          </button>
        )}

        <div className="flex-1 flex items-center gap-1 sm:gap-2">
          {/* Navigation Controls - Compact on mobile */}
          {!isMobile && (
            <div className="flex gap-1">
              <button 
                onClick={goBack}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={goForward}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={reload}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={goHome}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-1 sm:gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-cyan-400/50 pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={isMobile ? "URL..." : "Enter URL or search..."}
                className="w-full bg-slate-800/50 text-cyan-100 pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2.5 rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 placeholder-cyan-400/30 text-sm sm:text-base"
              />
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                {vpnEnabled && (
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 animate-pulse" />
                )}
                {proxyEnabled && (
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 animate-pulse" />
                )}
              </div>
            </div>
            
            {/* Desktop Controls */}
            {!isMobile && (
              <>
                <button 
                  onClick={addBookmark}
                  type="button"
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-yellow-500/20 text-cyan-400 transition-colors"
                >
                  <Star className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  type="button"
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleProxy}
                  type="button"
                  className={`p-2 rounded-lg transition-all ${
                    proxyEnabled 
                      ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20 border border-green-500/30' 
                      : 'bg-slate-800/50 text-cyan-400'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </button>
              </>
            )}
          </form>

          {/* More Options Button - Mobile Only */}
          {isMobile && (
            <button
              onClick={() => setShowMobileOptions(!showMobileOptions)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}

          {/* User Menu - Desktop */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/20 p-2 min-w-[200px] z-50">
                      <div className="px-3 py-2 text-xs text-cyan-400/70 border-b border-cyan-500/20 mb-2">
                        {user.email}
                      </div>
                      <button
                        onClick={() => { setShowSettings(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 text-cyan-400 rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm sm:text-base transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="bg-black/40 backdrop-blur-xl border-t border-cyan-500/30 px-2 py-2 flex items-center justify-around safe-area-bottom relative z-40">
          <button onClick={goBack} className="p-2 text-cyan-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goForward} className="p-2 text-cyan-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={reload} className="p-2 text-cyan-400 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={goHome} className="p-2 text-cyan-400 transition-colors">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={addTab} className="p-2 text-cyan-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs Bar - Hidden on mobile in favor of menu */}
      {!isMobile && (
        <div className="bg-black/30 backdrop-blur-lg border-b border-cyan-500/20 px-2 py-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {currentWorkspace.tabs.map((tab, index) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`group relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-t-lg cursor-pointer transition-all min-w-[100px] sm:min-w-[150px] max-w-[150px] sm:max-w-[200px] ${
                activeTab === index
                  ? 'bg-slate-800/70 text-cyan-400 border-t-2 border-cyan-400'
                  : 'bg-slate-900/30 text-cyan-400/60 hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate flex-1">{tab.title}</span>
              {currentWorkspace.tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTab}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 ml-2 transition-colors"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 ml-auto transition-colors"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Browser Content - Electron BrowserView renders here */}
        <div className="flex-1 relative bg-slate-900">
          {currentTab.url === 'about:blank' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 mx-auto mb-4 sm:mb-6 animate-float">
                  <Globe className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Flow Browser
                </h1>
                <p className="text-cyan-400/70 text-sm sm:text-lg max-w-md">
                  Workspace: {currentWorkspace.name}
                </p>
                <p className="text-cyan-400/50 text-xs sm:text-sm">
                  Enter a URL or search query above to start browsing
                </p>
                <div className="flex items-center gap-2 sm:gap-4 justify-center mt-4 sm:mt-8 flex-wrap">
                  {vpnEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-pulse" />
                      <span className="text-purple-400 text-xs sm:text-sm">VPN Active</span>
                    </div>
                  )}
                  {proxyEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs sm:text-sm">Proxy Active</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="text-cyan-400 text-xs sm:text-sm">Security: {securityLevel.toUpperCase()}</span>
                  </div>
                </div>
                {!isElectron && (
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ For full functionality, please use the desktop Electron app
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                <p className="text-cyan-400 text-sm">Loading: {currentTab.title}</p>
                <p className="text-cyan-400/50 text-xs max-w-md px-4">
                  The page is rendering in a native browser view
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel - Desktop or Tablet */}
        {showAIPanel && !isMobile && (
          <div className="w-80 lg:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-xl flex flex-col">
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-cyan-400">AI Assistant</h3>
              </div>
              <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setAiMode('summarize'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'summarize'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <BookOpen className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Summarize</div>
                </button>
                <button
                  onClick={() => { setAiMode('qa'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'qa'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Ask Q&A</div>
                </button>
                <button
                  onClick={() => { setAiMode('explain'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'explain'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <Brain className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Explain</div>
                </button>
                <button
                  onClick={() => { setAiMode('translate'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'translate'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <Languages className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Translate</div>
                </button>
              </div>

              {/* Action Buttons */}
              {aiMode === 'summarize' && (
                <button
                  onClick={handleAISummarize}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Summarize Page'
                  )}
                </button>
              )}

              {aiMode === 'qa' && (
                <div className="space-y-2">
                  <textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-slate-800/50 text-cyan-100 px-4 py-3 rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleAIQuestion}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                  >
                    {aiLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      'Get Answer'
                    )}
                  </button>
                </div>
              )}

              {aiMode === 'explain' && (
                <button
                  onClick={handleAIExplain}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Explain Simply'
                  )}
                </button>
              )}

              {aiMode === 'translate' && (
                <button
                  onClick={() => handleAITranslate('Spanish')}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Translate to Spanish'
                  )}
                </button>
              )}

              {/* AI Response */}
              {aiResponse && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400 font-semibold">AI Response</span>
                    </div>
                    <button onClick={copyAIResponse} className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                      <Copy className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                  <div className="text-sm text-cyan-100 whitespace-pre-wrap leading-relaxed">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookmarks Sidebar - Desktop only */}
        {showBookmarks && !isMobile && (
          <div className="w-64 sm:w-80 bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-400">Bookmarks</h3>
                <button onClick={() => setShowBookmarks(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
              <div className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="group flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-sm text-cyan-400 truncate cursor-pointer hover:text-cyan-300 transition-colors"
                        onClick={() => {
                          navigateToUrl(bookmark.url);
                          setShowBookmarks(false);
                        }}
                      >
                        {bookmark.title}
                      </div>
                      <div className="text-xs text-cyan-400/50 truncate">{bookmark.url}</div>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                {bookmarks.length === 0 && (
                  <div className="text-center text-cyan-400/50 py-8 text-sm">
                    No bookmarks yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && isMobile && (
  <div 
    className="fixed inset-0 z-50"
    onClick={() => setShowMobileMenu(false)}
  >
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    
    {/* Menu drawer */}
    <div 
      className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-slate-900 border-r border-cyan-500/30 shadow-2xl overflow-y-auto safe-area-bottom"></div>

              {/* Workspace Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Workspaces</h3>
                <div className="space-y-2">
                  {workspaces.map((workspace, index) => {
                    const Icon = workspace.icon;
                    return (
                      <button
                        key={workspace.id}
                        onClick={() => switchWorkspace(index)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          activeWorkspace === index
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-slate-800/30 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-cyan-400" />
                        <div className="flex-1 text-left">
                          <div className="text-cyan-400 font-medium">{workspace.name}</div>
                          <div className="text-xs text-cyan-400/50">{workspace.tabs.length} tabs</div>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setShowNewWorkspace(true); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-dashed border-cyan-500/30 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400">New Workspace</span>
                  </button>
                </div>
              </div>

              {/* Tabs List */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Tabs ({currentWorkspace.tabs.length})</h3>
                <div className="space-y-2">
                  {currentWorkspace.tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      onClick={() => { setActiveTab(index); setShowMobileMenu(false); }}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                        activeTab === index
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'bg-slate-800/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-cyan-400 truncate">{tab.title}</div>
                      </div>
                      {currentWorkspace.tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(index);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowBookmarks(true); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-cyan-400 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    <span>Bookmarks ({bookmarks.length})</span>
                  </button>
                  <button
                    onClick={() => { addBookmark(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-cyan-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Bookmark</span>
                  </button>
                  <button
                    onClick={() => { setShowAIPanel(true); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>

              {/* Security */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Security</h3>
                <div className="space-y-2">
                  <button
                    onClick={toggleProxy}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      proxyEnabled
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400">Proxy</span>
                    </div>
                    <span className={`text-xs ${proxyEnabled ? 'text-green-400' : 'text-cyan-400/50'}`}>
                      {proxyEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    onClick={toggleVPN}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      vpnEnabled
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400">VPN</span>
                    </div>
                    <span className={`text-xs ${vpnEnabled ? 'text-purple-400' : 'text-cyan-400/50'}`}>
                      {vpnEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Settings & Account */}
              <div className="space-y-2">
                <button
                  onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-cyan-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowAuth(true); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile More Options Menu */}
      {showMobileOptions && isMobile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowMobileOptions(false)}>
          <div 
            className="w-full bg-slate-900 border-t border-cyan-500/30 rounded-t-2xl p-4 pb-8 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-cyan-400/30 rounded-full mx-auto mb-4"></div>
            <div className="space-y-2">
              <button
                onClick={() => { addBookmark(); setShowMobileOptions(false); }}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 text-cyan-400 transition-colors"
              >
                <Star className="w-5 h-5" />
                <span>Add Bookmark</span>
              </button>
              <button
                onClick={() => { setShowAIPanel(true); setShowMobileOptions(false); }}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => { toggleProxy(); setShowMobileOptions(false); }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
                  proxyEnabled
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-slate-800/50 text-cyan-400'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Proxy {proxyEnabled ? 'ON' : 'OFF'}</span>
              </button>
              {user && (
                <button
                  onClick={() => { setShowSettings(true); setShowMobileOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 text-cyan-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile AI Panel as Modal */}
      {showAIPanel && isMobile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowAIPanel(false)}>
          <div 
            className="w-full h-4/5 bg-slate-900 border-t border-cyan-500/30 rounded-t-2xl flex flex-col safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-cyan-400">AI Assistant</h3>
              </div>
              <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setAiMode('summarize'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'summarize'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <BookOpen className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Summarize</div>
                </button>
                <button
                  onClick={() => { setAiMode('qa'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'qa'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Ask Q&A</div>
                </button>
                <button
                  onClick={() => { setAiMode('explain'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'explain'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <Brain className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Explain</div>
                </button>
                <button
                  onClick={() => { setAiMode('translate'); setAiResponse(''); }}
                  className={`p-3 rounded-lg border transition-all ${
                    aiMode === 'translate'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/30 border-slate-700 text-cyan-400/70'
                  }`}
                >
                  <Languages className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Translate</div>
                </button>
              </div>

              {aiMode === 'summarize' && (
                <button
                  onClick={handleAISummarize}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? 'Processing...' : 'Summarize Page'}
                </button>
              )}

              {aiMode === 'qa' && (
                <div className="space-y-2">
                  <textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-slate-800/50 text-cyan-100 px-4 py-3 rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleAIQuestion}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                  >
                    {aiLoading ? 'Processing...' : 'Get Answer'}
                  </button>
                </div>
              )}

              {aiMode === 'explain' && (
                <button
                  onClick={handleAIExplain}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? 'Processing...' : 'Explain Simply'}
                </button>
              )}

              {aiMode === 'translate' && (
                <button
                  onClick={() => handleAITranslate('Spanish')}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 transition-opacity"
                >
                  {aiLoading ? 'Processing...' : 'Translate to Spanish'}
                </button>
              )}

              {aiResponse && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400 font-semibold">Response</span>
                    </div>
                    <button onClick={copyAIResponse} className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                      <Copy className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                  <div className="text-sm text-cyan-100 whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bookmarks Modal */}
      {showBookmarks && isMobile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowBookmarks(false)}>
          <div 
            className="w-full h-4/5 bg-slate-900 border-t border-cyan-500/30 rounded-t-2xl overflow-y-auto safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-400">Bookmarks</h3>
                <button onClick={() => setShowBookmarks(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
              <div className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                    <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => {
                        navigateToUrl(bookmark.url);
                        setShowBookmarks(false);
                      }}
                    >
                      <div className="text-sm text-cyan-400 truncate">{bookmark.title}</div>
                      <div className="text-xs text-cyan-400/50 truncate">{bookmark.url}</div>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                {bookmarks.length === 0 && (
                  <div className="text-center text-cyan-400/50 py-8 text-sm">
                    No bookmarks yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Switcher Modal - Responsive */}
      {showWorkspaces && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowWorkspaces(false)}>
          <div 
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-8 w-full max-w-4xl shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Workspaces</h2>
              <button onClick={() => setShowWorkspaces(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {workspaces.map((workspace, index) => {
                const Icon = workspace.icon;
                return (
                  <div
                    key={workspace.id}
                    onClick={() => switchWorkspace(index)}
                    className={`group relative p-4 sm:p-6 rounded-xl cursor-pointer transition-all ${
                      activeWorkspace === index
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400'
                        : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-2 sm:mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-1">{workspace.name}</h3>
                    <p className="text-xs text-cyan-400/60">{workspace.tabs.length} tabs</p>
                    
                    {workspaces.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkspace(index);
                        }}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                );
              })}

              <div
                onClick={() => setShowNewWorkspace(true)}
                className="p-4 sm:p-6 rounded-xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/30 cursor-pointer transition-all flex flex-col items-center justify-center"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-2" />
                <span className="text-xs sm:text-sm text-cyan-400">New Workspace</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Workspace Modal - Responsive */}
      {showNewWorkspace && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewWorkspace(false)}>
          <div 
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-8 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Create Workspace</h2>
              <button onClick={() => setShowNewWorkspace(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {WORKSPACE_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => addWorkspace(preset)}
                    className="p-4 sm:p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 hover:border-cyan-500/50 transition-all text-left"
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-2 sm:mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-1">{preset.name}</h3>
                    <p className="text-xs sm:text-sm text-cyan-400/60">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal - Responsive */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAuth(false)}>
          <div 
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </h2>
              <button onClick={() => setShowAuth(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </button>
            </div>
            
            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              <div>
                <label className="block text-cyan-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 text-cyan-100 px-4 py-2.5 sm:py-3 rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-400 text-sm mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 text-cyan-100 px-4 py-2.5 sm:py-3 rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="w-full text-center text-cyan-400/70 mt-4 text-xs sm:text-sm transition-colors hover:text-cyan-400"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal - Responsive */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div 
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-8 w-full max-w-4xl shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-800/50 rounded transition-colors">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Security Settings */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Security & Privacy
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                    <div>
                      <div className="text-cyan-400 font-medium text-sm sm:text-base">Proxy Protection</div>
                      <div className="text-cyan-400/50 text-xs sm:text-sm">Route through proxy</div>
                    </div>
                    <button
                      onClick={toggleProxy}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                        proxyEnabled
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700/50 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {proxyEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-cyan-400 font-medium text-sm sm:text-base">VPN Protection</div>
                        <div className="text-cyan-400/50 text-xs sm:text-sm">Connect through VPN</div>
                      </div>
                      <button
                        onClick={toggleVPN}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                          vpnEnabled
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-slate-700/50 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {vpnEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {vpnEnabled && (
                      <div>
                        <label className="block text-cyan-400 text-xs sm:text-sm mb-2">VPN Provider</label>
                        <select
                          value={vpnProvider}
                          onChange={(e) => setVpnProvider(e.target.value)}
                          className="w-full bg-slate-800/50 text-cyan-100 px-3 py-2 rounded-lg border border-cyan-500/30 text-sm"
                        >
                          {VPN_PROVIDERS.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                    <div>
                      <div className="text-cyan-400 font-medium text-sm sm:text-base">Anti-Fingerprinting</div>
                      <div className="text-cyan-400/50 text-xs sm:text-sm">Randomize fingerprint</div>
                    </div>
                    <button
                      onClick={() => setAntiFingerprint(!antiFingerprint)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                        antiFingerprint
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700/50 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {antiFingerprint ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                    <div>
                      <div className="text-cyan-400 font-medium text-sm sm:text-base">Block Trackers</div>
                      <div className="text-cyan-400/50 text-xs sm:text-sm">Block ads & trackers</div>
                    </div>
                    <button
                      onClick={() => setBlockTrackers(!blockTrackers)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                        blockTrackers
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700/50 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {blockTrackers ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                    <div className="text-cyan-400 font-medium mb-2 sm:mb-3 text-sm sm:text-base">Security Level</div>
                    <select
                      value={securityLevel}
                      onChange={(e) => setSecurityLevel(e.target.value)}
                      className="w-full bg-slate-800/50 text-cyan-100 px-3 py-2 rounded-lg border border-cyan-500/30 text-sm"
                    >
                      <option value="maximum">Maximum</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Browser Info */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  Browser Info
                </h3>
                <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">Version:</span>
                    <span className="text-cyan-400">2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">Platform:</span>
                    <span className="text-cyan-400">{isElectron ? 'Electron Desktop' : 'Web'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">Workspaces:</span>
                    <span className="text-cyan-400">{workspaces.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">Total Tabs:</span>
                    <span className="text-cyan-400">{workspaces.reduce((acc, w) => acc + w.tabs.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">Bookmarks:</span>
                    <span className="text-cyan-400">{bookmarks.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mount the app 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FlowBrowser />
  </React.StrictMode>
);
