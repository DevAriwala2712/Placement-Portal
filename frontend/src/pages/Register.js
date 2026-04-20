import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        name: '',
        branch: '',
        cgpa: '',
        skills: '',
        phone: '',
        address: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(formData);
        setLoading(false);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    const roleOptions = [
        { value: 'student', label: 'Student', icon: 'school' },
        { value: 'recruiter', label: 'Recruiter', icon: 'business_center' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
            {/* Background blobs */}
            <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-blue-100/30 blur-[120px] -z-10 rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-1/4 h-1/4 bg-indigo-100/30 blur-[100px] -z-10 rounded-full pointer-events-none" />

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl shadow-2xl shadow-on-surface/5 border border-outline-variant/10">
                {/* Left editorial panel */}
                <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-primary text-on-primary">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-800" />
                        {/* Grid texture */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 64px)'
                            }}
                        />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-14">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary icon-filled">architecture</span>
                            </div>
                            <span className="font-headline font-black tracking-widest uppercase text-xl">Placement Console</span>
                        </div>
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight leading-tight mb-5">
                            Architecting<br />Future Careers.
                        </h1>
                        <p className="text-on-primary/80 text-base leading-relaxed max-w-xs">
                            The premium console for elite institutions to manage placements, industry relations, and student success with precision.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                            <div className="flex -space-x-2">
                                {['👩‍💼', '👨‍💻', '👩‍🎓'].map((emoji, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border-2 border-white/30">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-on-primary/90">Trusted by 500+ Top Institutions</p>
                        </div>
                    </div>
                </div>

                {/* Right form */}
                <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-14 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-1">Create Account</h2>
                            <p className="text-secondary font-medium text-sm">Join the professional placement network today.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="reg-name">Full Name</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        id="reg-name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Johnathan Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-highest border-0 rounded-xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="reg-email">Work Email</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none group-focus-within:text-primary transition-colors">mail</span>
                                    <input
                                        id="reg-email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="j.doe@institution.edu"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-highest border-0 rounded-xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="reg-password">Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        id="reg-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-highest border-0 rounded-xl py-3.5 pl-11 pr-12 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors">
                                        <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-1.5">
                                <span className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">Your Role</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {roleOptions.map(({ value, label, icon }) => (
                                        <label key={value} className="relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="role"
                                                value={value}
                                                checked={formData.role === value}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="p-3.5 text-center rounded-xl bg-surface-container-highest border-2 border-transparent peer-checked:border-primary peer-checked:bg-blue-50 transition-all duration-200 hover:bg-surface-container-high">
                                                <span className="material-symbols-outlined block mb-1 text-secondary peer-checked:text-primary group-hover:text-primary transition-colors">{icon}</span>
                                                <span className="text-xs font-bold text-on-surface-variant block">{label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Student Extra Fields */}
                            {formData.role === 'student' && (
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">Branch</label>
                                        <input name="branch" required placeholder="e.g. CSE" value={formData.branch} onChange={handleChange}
                                            className="w-full bg-surface-container-highest border-0 rounded-xl py-3 px-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">CGPA</label>
                                        <input name="cgpa" type="number" step="0.01" min="0" max="10" required placeholder="8.5" value={formData.cgpa} onChange={handleChange}
                                            className="w-full bg-surface-container-highest border-0 rounded-xl py-3 px-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">Skills</label>
                                        <input name="skills" placeholder="React, Python, SQL…" value={formData.skills} onChange={handleChange}
                                            className="w-full bg-surface-container-highest border-0 rounded-xl py-3 px-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">Phone</label>
                                        <input name="phone" type="tel" placeholder="+91 9999999999" value={formData.phone} onChange={handleChange}
                                            className="w-full bg-surface-container-highest border-0 rounded-xl py-3 px-4 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
                                    </div>
                                </div>
                            )}

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
                                className="w-full bg-primary-gradient py-4 rounded-xl text-on-primary font-headline font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60"
                            >
                                {loading ? 'Creating account…' : (
                                    <>
                                        Create Account
                                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <p className="text-sm text-secondary font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary font-bold ml-1 hover:underline underline-offset-4">Sign In</Link>
                            </p>
                        </div>

                        <div className="mt-10 pt-6 border-t border-outline-variant/30 flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-outline">
                            <span>© 2024 Placement Console</span>
                            <div className="flex gap-4">
                                <button type="button" className="hover:text-primary transition-colors">Support</button>
                                <button type="button" className="hover:text-primary transition-colors">Privacy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
