import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import CreateMessage from './components/CreateMessage';
import ScanMessage from './components/ScanMessage';
import MessagesList from './components/MessagesList';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { Heart, ScanLine, PlusCircle, LogOut, History } from 'lucide-react';
import './App.css';

function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation for anonymous users unless they are scanning
  if (!user && !location.pathname.startsWith('/message/')) {
    return null;
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden sm:flex bg-white shadow-sm py-4 px-6 justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="text-pink-600 fill-pink-600" size={24} />
          <span className="font-bold text-xl text-gray-800">Love QR</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`flex items-center gap-2 font-medium transition-colors ${
              isActive('/') ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
            }`}
          >
            <PlusCircle size={20} />
            <span>Create</span>
          </Link>
          <Link 
            to="/scan" 
            className={`flex items-center gap-2 font-medium transition-colors ${
              isActive('/scan') ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
            }`}
          >
            <ScanLine size={20} />
            <span>Scan</span>
          </Link>
          {user && (
            <>
              <Link 
                to="/history" 
                className={`flex items-center gap-2 font-medium transition-colors ${
                  isActive('/history') ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
                }`}
              >
                <History size={20} />
                <span>History</span>
              </Link>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-400 hover:text-pink-600 font-medium transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around items-center py-3 px-2 z-50">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/') ? 'text-pink-600' : 'text-gray-400'
          }`}
        >
          <PlusCircle size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Create</span>
        </Link>
        <Link 
          to="/scan" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/scan') ? 'text-pink-600' : 'text-gray-400'
          }`}
        >
          <ScanLine size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Scan</span>
        </Link>
        {user && (
          <>
            <Link 
              to="/history" 
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive('/history') ? 'text-pink-600' : 'text-gray-400'
              }`}
            >
              <History size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
            </Link>
            <button 
              onClick={() => signOut()}
              className="flex flex-col items-center gap-1 text-gray-400 transition-colors"
            >
              <LogOut size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Logout</span>
            </button>
          </>
        )}
      </nav>

      {/* Mobile Header (Brand only) */}
      <header className="sm:hidden bg-white shadow-sm py-3 px-6 flex justify-center items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="text-pink-600 fill-pink-600" size={20} />
          <span className="font-bold text-lg text-gray-800">Love QR</span>
        </Link>
      </header>
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center text-pink-600">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading Love QR...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-pink-50 flex flex-col pb-20 sm:pb-0">
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 pt-6 sm:pt-0">
          <div className="w-full max-w-4xl">
            <Routes>
              {/* Public Routes */}
              <Route path="/message/:uid/:id" element={<ScanMessage />} />
              <Route path="/scan" element={<ScanMessage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={user ? <CreateMessage /> : <Login />} />
              <Route path="/history" element={user ? <MessagesList /> : <Login />} />
              
              {/* Fallback */}
              <Route path="*" element={user ? <CreateMessage /> : <Login />} />
            </Routes>
          </div>
        </main>

        {/* Footer (Desktop only) */}
        <footer className="hidden sm:block py-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Love QR. Made with ❤️ for the web.
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MessagesProvider>
          <AppContent />
        </MessagesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
