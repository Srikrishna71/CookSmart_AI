import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Heart, User, LogOut, ChefHat, Plus, Moon, Sun, Sparkles, Menu, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const navigate   = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    navigate(`/recipes?search=${searchQuery}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
          <ChefHat className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CookSmart
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light'
              ? <Moon className="h-5 w-5 text-muted-foreground" />
              : <Sun  className="h-5 w-5 text-muted-foreground" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/recipes')}>
            Recipes
          </Button>

          {user && (
            <Button
              variant="ghost" size="sm"
              onClick={() => navigate('/ai-kitchen')}
              className="items-center gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              AI Kitchen
            </Button>
          )}

          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/create')}
                className="hover:bg-primary/10 hover:text-primary">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}
                className="hover:bg-primary/10 hover:text-primary">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}
                className="hover:bg-primary/10 hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/login')}
                className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger only */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light'
              ? <Moon className="h-5 w-5 text-muted-foreground" />
              : <Sun  className="h-5 w-5 text-muted-foreground" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search — always visible below the bar on mobile */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
        </form>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navTo('/recipes')}>
            Recipes
          </Button>

          {user && (
            <Button
              variant="ghost" className="w-full justify-start gap-2"
              onClick={() => navTo('/ai-kitchen')}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI Kitchen
            </Button>
          )}

          {user ? (
            <>
              <Button variant="ghost" className="w-full justify-start gap-2"
                onClick={() => navTo('/create')}>
                <Plus className="h-4 w-4" />
                Create Recipe
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2"
                onClick={() => navTo('/profile')}>
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full justify-start"
                onClick={() => navTo('/login')}>
                Sign In
              </Button>
              <Button
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={() => navTo('/login')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

