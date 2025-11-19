import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const location = useLocation();

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // delegate to generic scroller
    handleScrollTo('about');
  };

  const handleScrollTo = (id: string) => {
    // If we're already on the landing page, just smooth-scroll to the section
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // update the hash without causing a reload
        history.replaceState(null, '', `#${id}`);
      }
      return;
    }

    // Otherwise navigate to home and then scroll after a short delay
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `/#${id}`);
      }
    }, 160);
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Agrofy</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <button
              onClick={handleAboutClick}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 p-0"
            >
              About Us
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleScrollTo('faqs'); }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 p-0"
            >
              FAQ
            </button>
            {user && (
              <>
                {user.role === 'exporter' && (
                  <Link
                    to="/exporter/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Exporter
                  </Link>
                )}
                {user.role === 'qa' && (
                  <Link
                    to="/qa/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    QA
                  </Link>
                )}
              </>
            )}
            <Link to="/verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Verify
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.name} ({user.role.toUpperCase()})
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
