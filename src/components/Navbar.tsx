import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, Languages } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  // Keep the selector wrapper always present in the DOM (but hidden)
  // so `dropdown.js` can render the control into it. We'll toggle
  // visibility of that wrapper below when user opens the translate menu.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    try {
      const el = wrapperRef.current;
      if (!el) return;
      el.style.display = isTranslateOpen ? 'block' : 'none';
      // If opening and widget not yet rendered, append the dropdown.js
      // script dynamically so it can render into the just-mounted wrapper.
      if (isTranslateOpen && el.innerHTML.trim().length === 0) {
        // avoid repeated dynamic loads
        // @ts-ignore
        if ((window as any).__gtranslate_dropdown_loading) return;
        // @ts-ignore
        (window as any).__gtranslate_dropdown_loading = true;
        const s = document.createElement('script');
        s.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js?ts=' + Date.now();
        s.setAttribute('data-gt-widget-id', 'gt_1');
        s.setAttribute('data-gtranslate-dynamic', '1');
        s.defer = true;
        s.onload = function() {
          // clear flag after a short delay
          setTimeout(() => {
            // @ts-ignore
            (window as any).__gtranslate_dropdown_loading = false;
            try { setupGTranslateChangeHandler('en'); } catch (e) {}
          }, 200);
        };
        s.onerror = function() {
          // @ts-ignore
          (window as any).__gtranslate_dropdown_loading = false;
        };
        document.body.appendChild(s);
      }
    } catch (e) {}
  }, [isTranslateOpen]);

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

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setIsTranslateOpen(v => !v)}
                className="inline-flex items-center px-3 py-1 border rounded-md text-sm"
              >
                <Languages className="h-4 w-4 mr-2" />
                Translate
              </button>
              {/* Inline wrapper where dropdown.js will render the selector. */}
              <div
                ref={wrapperRef}
                className="gtranslate_wrapper"
                style={{ display: 'none', position: 'absolute', right: 0, marginTop: '8px', zIndex: 9999, background: 'white', padding: '6px', borderRadius: 6 }}
              />
            </div>
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

// Delete googtrans cookie across common domain variants
function deleteGoogTransCookie() {
  try {
    const host = location.hostname;
    const domains = [host, '.' + host];
    const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    domains.forEach(d => {
      document.cookie = `googtrans=;expires=${expires};domain=${d};path=/`;
      document.cookie = `googtrans=;expires=${expires};path=/`;
    });
  } catch (e) {}
}

// Attach change handler to gtranslate selector so we can react when
// user picks the default language and clear the cookie to restore
// original language behavior.
function setupGTranslateChangeHandler(defaultLang: string) {
  try {
    // avoid double attaching
    // @ts-ignore
    if ((window as any).__gtranslate_change_handler_attached) return;
    const handler = (evt: Event) => {
      const target = evt.target as HTMLSelectElement | null;
      if (!target) return;
      const cls = target.className || '';
      if (!cls.includes('gt_selector')) return;
      const val = target.value || '';
      const parts = val.split('|');
      const to = parts[1];
      if (!to) return;
      if (to === defaultLang) {
        // user chose default language -> clear cookie and reload
        deleteGoogTransCookie();
        setTimeout(() => location.reload(), 250);
      }
    };

    document.addEventListener('change', handler, true);
    // mark attached
    // @ts-ignore
    (window as any).__gtranslate_change_handler_attached = true;
  } catch (e) {}
}

// Programmatic reset: set googtrans cookie to default and attempt to call
// (no programmatic reset function — we rely on the change handler)

// Hook into popover open changes by observing attribute changes on the
// popover trigger area — this is a defensive fallback in case the
// component mounts/unmounts in ways that prevent the effect in the
// component from running. We also attach a short interval to attempt
// loading if the wrapper appears slightly later.
// Attach the change handler once when running in browser. We rely on the
// single `dropdown.js` script already included in `index.html` to render
// the widget into `#gtranslate-root`.
if (typeof window !== 'undefined') {
  try {
    // attach handler immediately in case widget is already present
    setupGTranslateChangeHandler('en');
  } catch (e) {}
}

// Show/hide the persistent widget when popover opens.
// We add a small exported hook to toggle visibility from React.
export function toggleGTranslateRoot(show: boolean) {
  try {
    const el = document.getElementById('gtranslate-root');
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
  } catch (e) {}
}
