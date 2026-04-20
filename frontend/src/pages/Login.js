import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('admin@college.edu');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-root">
            {/* Background blobs */}
            <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-blue-100/30 blur-[120px] -z-10 rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-1/4 h-1/4 bg-indigo-100/30 blur-[100px] -z-10 rounded-full pointer-events-none" />

            <main className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-gradient mb-4 shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-3xl icon-filled">school</span>
                    </div>
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">
                        Placement Console
                    </h1>
                    <p className="text-secondary font-medium tracking-wide text-sm">
                        Academic Architect
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-xl shadow-on-surface/5">
                    <h2 className="font-headline text-xl font-bold text-on-surface mb-8">Sign In</h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="login-email">
                                Email Address
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none transition-colors group-focus-within:text-primary">
                                    mail
                                </span>
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface-container-highest border-0 rounded-xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-outline transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-secondary" htmlFor="login-password">
                                    Password
                                </label>
                                <button type="button" className="text-xs font-semibold text-primary hover:text-primary-container transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none transition-colors group-focus-within:text-primary">
                                    lock
                                </span>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surface-container-highest border-0 rounded-xl py-3.5 pl-11 pr-12 text-on-surface placeholder:text-outline transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-2.5 px-1">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 rounded border-outline-variant accent-primary"
                            />
                            <label htmlFor="remember" className="text-sm font-medium text-on-surface-variant">
                                Remember this device
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-gradient text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-base tracking-wide disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-on-surface-variant text-sm font-medium">
                            New to Console?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 ml-1 transition-all">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decorative */}
                <div className="mt-10 flex justify-center items-center gap-5 opacity-40">
                    <div className="h-px w-10 bg-outline-variant" />
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <div className="w-2 h-2 rounded-full bg-tertiary" />
                    </div>
                    <div className="h-px w-10 bg-outline-variant" />
                </div>
                <footer className="mt-6 text-center text-outline text-[11px] font-medium tracking-widest uppercase">
                    © 2024 Placement Console • Secure Academic Access
                </footer>
            </main>
        </div>
    );
};

export default Login;
