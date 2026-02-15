import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Lock, 
  ArrowLeft, 
  Loader2, 
  Shield, 
  Key, 
  LogIn,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Subtle pattern background only
const PatternBackground = () => (
  <div className="fixed inset-0 -z-10">
    {/* Clean base */}
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
    
    {/* Single subtle pattern - dots only */}
    <div 
      className="absolute inset-0 opacity-20 dark:opacity-10"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}
    />
  </div>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Login successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <PatternBackground />

      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/career-icon.png" 
                alt="Career Launch Pack" 
                className="h-6 w-6 object-contain"
              />
              <span className="font-serif text-sm font-medium text-slate-900 dark:text-white">
                Career Pack
              </span>
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Compact */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px]"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="p-0 pb-4 text-center">
              {/* Simple icon */}
              <div className="flex justify-center mb-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Lock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              <CardTitle className="font-serif text-lg text-slate-900 dark:text-white">
                Admin Login
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to access dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username field - compact */}
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs text-slate-600 dark:text-slate-400">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      id="username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter username"
                      autoComplete="username"
                      className="h-9 pl-8 text-sm bg-slate-50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 rounded-lg"
                    />
                  </div>
                </div>

                {/* Password field - compact */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs text-slate-600 dark:text-slate-400">
                    Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="h-9 pl-8 text-sm bg-slate-50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 rounded-lg"
                    />
                  </div>
                </div>

                {/* Submit button - compact */}
                <Button 
                  type="submit" 
                  className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-lg mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-3.5 w-3.5 mr-1.5" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Simple security note */}
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 pt-1">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Secure admin access only
                </p>
              </form>

              {/* Back link - compact */}
              <div className="mt-4 text-center">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>© 2026 Career Pack</span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}