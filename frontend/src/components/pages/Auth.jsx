import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = mode === 'login' 
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password, role: 'member' };

            const data = mode === 'login'
                ? await login(payload)
                : await register(payload);

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80')",
                }}
            />
            <div className="absolute inset-0 bg-slate-950/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_40%)]" />

            <div className="relative z-10 flex min-h-screen items-center justify-center">
                <form onSubmit={submit} className="w-full max-w-md border border-slate-700/70 rounded-2xl p-8 bg-slate-900/75 backdrop-blur-xl shadow-[0_0_40px_rgba(15,23,42,0.8)] space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {mode === 'login' ? 'Sign in to manage your workspace.' : 'Join your task workspace.'}
                        </p>
                    </div>

                    {mode === 'signup' && (
                        <Input
                            label="Full Name"
                            required
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <Input
                        label="Password (5+ characters)"
                        type="password"
                        minLength={6}
                        required
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    {error && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    <Button type="submit" loading={loading} className="w-full mt-2">
                        {mode === 'login' ? 'Sign In' : 'Sign Up'}
                    </Button>

                    <button
                        type="button"
                        className="w-full text-center text-xs text-slate-300 hover:text-teal-400 pt-2 transition-colors"
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError('');
                        }}
                    >
                        {mode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
                    </button>
                </form>
            </div>
        </main>
    );
}