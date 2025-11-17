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

    // Mock authentication
    const mockUser = {
      id: selectedRole === 'exporter' ? 'EXP-001' : 'QA-001',
      name: selectedRole === 'exporter' ? 'John Smith' : 'Jane Doe',
      email: email,
      role: selectedRole,
      organization: selectedRole === 'exporter' ? 'ABC Exports Ltd.' : 'Certify QA Division',
    };

    setUser(mockUser);
    toast.success('Login successful!');

    // Navigate to appropriate dashboard
    if (selectedRole === 'exporter') {
      navigate('/exporter/dashboard');
    } else {
      navigate('/qa/dashboard');
    }
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
          <CardTitle className="text-2xl text-center">Welcome to Certify</CardTitle>
          <CardDescription className="text-center">Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="exporter">Exporter</TabsTrigger>
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
                  Login as {selectedRole === 'exporter' ? 'Exporter' : 'QA Agent'}
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
