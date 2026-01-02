import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp, UserRole } from '@/context/AppContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const defaultRole = (searchParams.get('role') as UserRole) || 'exporter';
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }


    (async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Supabase sign-in error:', error);
          toast.error(error.message || 'Failed to sign in');
          return;
        }

        const supaUser = data?.user;
        if (!supaUser) {
          toast.error('No user returned from auth.');
          return;
        }

        
        try {
          const { data: profileData, error: profileErr } = await supabase.from('profiles').select('*').eq('id', supaUser.id).maybeSingle();
          if (profileErr) {
            console.warn('Failed to fetch profile after sign-in:', profileErr);
          }

          const roleFromProfile = (profileData as any)?.role || selectedRole;
          const nameFromProfile = (profileData as any)?.name || (supaUser.user_metadata as any)?.name || (selectedRole === 'exporter' ? 'Exporter' : 'QA Agent');
          const orgFromProfile = (profileData as any)?.organization || (supaUser.user_metadata as any)?.organization || '';

          
          try {
            await supabase.from('profiles').upsert({ id: supaUser.id, email: supaUser.email, name: nameFromProfile, role: roleFromProfile, organization: orgFromProfile });
          } catch (e) {
            console.warn('Failed to upsert profile after sign-in:', e);
          }

          const appUser = {
            id: supaUser.id,
            name: nameFromProfile,
            email: supaUser.email || email,
            role: roleFromProfile,
            organization: orgFromProfile,
          } as any;

          setUser(appUser);
          toast.success('Login successful!');

          
if (appUser.role === 'exporter') {
  navigate('/exporter/dashboard');
} else if (appUser.role === 'importer') {
  navigate('/importer');
} else {
  navigate('/qa/dashboard');
}

        } catch (e) {
          console.error('Profile fetch/upsert error:', e);
        
          const appUser = {
            id: supaUser.id,
            name: (supaUser.user_metadata as any)?.name || (selectedRole === 'exporter' ? 'Exporter' : 'QA Agent'),
            email: supaUser.email || email,
            role: (supaUser.user_metadata as any)?.role || selectedRole,
            organization: (supaUser.user_metadata as any)?.organization || '',
          } as any;

          setUser(appUser);
          toast.success('Login successful!');
          if ((appUser.role as UserRole) === 'exporter') {
            navigate('/exporter/dashboard');
          } else {
            navigate('/qa/dashboard');
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        toast.error((err as any)?.message || 'Login failed');
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome to Agrofy</CardTitle>
          <CardDescription className="text-center">Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="exporter">Exporter</TabsTrigger>
              <TabsTrigger value="importer">Importer</TabsTrigger>
              <TabsTrigger value="qa">QA Agent</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedRole}>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login as {
  selectedRole === 'exporter'
    ? 'Exporter'
    : selectedRole === 'importer'
    ? 'Importer'
    : 'QA Agent'
}

                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
