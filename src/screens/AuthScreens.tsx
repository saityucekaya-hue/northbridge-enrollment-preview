import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { sampleEmail, samplePassword, themes, type ThemeId } from '../lib/demo';

export function SignInScreen({ themeId, onDemoLogin, onInvitation }: { themeId: ThemeId; onDemoLogin: () => void; onInvitation: () => void }) {
  const theme = themes[themeId];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().toLowerCase() === sampleEmail && password === samplePassword) { setError(''); onDemoLogin(); }
    else { setError('This preview accepts only the sample account. Use “Explore as Jordan” below.'); document.getElementById('email')?.focus(); }
  }
  return <div className="auth-page"><section className="auth-main" aria-labelledby="signin-title">
    <p className="section-overline">Welcome back</p><h1 id="signin-title">Your next chapter starts here.</h1><p className="lead">Sign in to review your offer and take care of your next steps at {theme.name}.</p>
    <form className="auth-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={!!error} /></div><div className="field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" aria-invalid={!!error} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>{error && <p role="alert" className="field-error">{error}</p>}<button className="button button-primary full" type="submit">Sign in <ArrowRight size={18} aria-hidden="true" /></button></form>
    <div className="auth-divider"><span>or explore the preview</span></div><button className="button button-outline full" type="button" onClick={onDemoLogin}>Explore as Jordan <ArrowRight size={18} aria-hidden="true" /></button>
    <p className="helper-copy">Sample account: <strong>{sampleEmail}</strong> · Password: <strong>{samplePassword}</strong></p>
    <div className="invitation-note"><Mail size={20} aria-hidden="true" /><div><strong>Newly admitted?</strong> Your university will email you a one-time link to review your offer. <button className="text-link" type="button" onClick={onInvitation}>Preview that invitation <ArrowRight size={15} aria-hidden="true" /></button></div></div>
  </section><aside className="auth-story" aria-label={`${theme.name} campus photograph`}><img className="auth-art" src={theme.image} alt={`${theme.name} campus in morning light`} /></aside></div>;
}

export function InvitationScreen({ themeId, onContinue, onBack }: { themeId: ThemeId; onContinue: () => void; onBack: () => void }) {
  const theme = themes[themeId];
  return <div className="narrow-page invite-page"><div className="invite-icon"><Mail size={29} aria-hidden="true" /></div><h1>Jordan, your offer is ready.</h1><p className="lead">This one-time invitation would take you to your offer from {theme.name}. Review the terms before deciding.</p><div className="invitation-address"><span>Sample invitation for</span><strong>{sampleEmail}</strong></div><div className="info-block"><ShieldCheck size={22} aria-hidden="true" /><p>This is a preview. No email was sent, and this link is not a real invitation token.</p></div><button className="button button-primary" type="button" onClick={onContinue}>View your offer <ArrowRight size={18} aria-hidden="true" /></button><button className="text-link back-link" type="button" onClick={onBack}>Back to sign in</button></div>;
}
