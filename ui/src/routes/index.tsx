import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { ForgotPassword } from '../components/auth/ForgotPassword';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { LessonList } from '../components/lessons/LessonList';
import { LessonDetail } from '../components/lessons/LessonDetail';
import { LessonEditor } from '../components/lessons/LessonEditor';
import { Homepage } from '../components/home/Homepage';
import { useCurrentUser } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';

export function AppRoutes() {
    const { data: currentUser, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Homepage */}
            <Route path="/" element={<Homepage />} />

            {/* Auth Routes */}
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/dashboard" replace />} />
            <Route
                path="/forgot-password"
                element={!currentUser ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
            />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/dashboard"
                    element={currentUser?.role === 'admin' ? <Navigate to="/admin" replace /> : <UserDashboard />}
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requireAdmin>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/lessons" element={<LessonList />} />
                <Route path="/lessons/:id" element={<LessonDetail />} />
                <Route
                    path="/lessons/create"
                    element={
                        <ProtectedRoute requireAdmin>
                            <LessonEditor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/lessons/:id/edit"
                    element={
                        <ProtectedRoute requireAdmin>
                            <LessonEditor />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/'} replace />} />
        </Routes>
    );
}
