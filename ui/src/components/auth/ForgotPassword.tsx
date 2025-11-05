import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending reset email
        setSuccess(true);
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
                    <CardTitle className="text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    Password reset instructions have been sent to your email.
                                </AlertDescription>
                            </Alert>

                            <Link to="/login">
                                <Button className="w-full" variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Send Reset Link
                            </Button>

                            <Link to="/login">
                                <Button type="button" className="w-full" variant="ghost">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
