import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const user = await loginMutation.mutateAsync({ email, password });
            toast.success(`Welcome back, ${user.name}!`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-3">
                    <div className="flex justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">Sign in to continue your learning journey</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loginMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loginMutation.isPending}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link to="/register" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 text-center mb-2">Demo accounts:</p>
                            <div className="space-y-1 text-xs text-gray-600">
                                <p>Admin: admin@example.com / admin123</p>
                                <p>User: user@example.com / user123</p>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
