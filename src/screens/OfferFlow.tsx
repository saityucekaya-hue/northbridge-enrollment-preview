import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react';
import { sampleEmail, themes, validatePassword, type DemoState } from '../lib/demo';

export function ContactScreen({ state, onContinue }: { state: DemoState; onContinue: (email: string, phone: string) => void }) {
  const theme = themes[state.theme];
  const [email, setEmail] = useState(state.email || sampleEmail);
  const [phone, setPhone] = useState(state.phone);
  const [editEmail, setEditEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (phone.replace(/\D/g, '').length < 7) next.phone = 'Enter a phone number where the university can reach you.';
    const passwordError = validatePassword(password, confirmation);
    if (passwordError) next.password = passwordError;
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { document.getElementById(first === 'password' ? 'new-password' : `contact-${first}`)?.focus(); return; }
    onContinue(email, phone);
  }
  return <div className="flow-page contact-page"><div className="accepted-banner"><ShieldCheck size={28} aria-hidden="true" /><div><strong>Sample offer accepted, Jordan.</strong><span>Your choice is saved only in this browser preview. Let’s set up your account.</span></div></div><p className="flow-eyebrow">Contact & access</p><h1>How can we reach you?</h1><p className="lead">We’ll use this information to keep in touch about your application and next steps.</p><form className="contact-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="contact-email">Email address</label><div className="email-edit"><input id="contact-email" type="email" autoComplete="email" value={email} readOnly={!editEmail} onChange={(event) => setEmail(event.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined} /><button className="text-link" type="button" onClick={() => { setEditEmail(true); window.setTimeout(() => document.getElementById('contact-email')?.focus(), 0); }}>Change</button></div>{errors.email && <p id="contact-email-error" className="field-error" role="alert">{errors.email}</p>}</div>
      <div className="field"><label htmlFor="contact-phone">Phone number</label><div className="phone-field"><span>+1</span><input id="contact-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 415 555 0123" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'contact-phone-error' : 'phone-hint'} /></div><p id="phone-hint" className="field-hint">Only for important updates about your application.</p>{errors.phone && <p id="contact-phone-error" className="field-error" role="alert">{errors.phone}</p>}</div>
      <div className="auth-divider"><span>Choose how to sign in</span></div><div className="password-choice"><div className="choice-heading"><span className="selected-radio" /><div><strong>Create a password</strong><p>You’ll use this to access your account.</p></div></div><div className="field"><label htmlFor="new-password">Password</label><div className="password-wrap"><input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-hint'} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div><div className="field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} aria-invalid={!!errors.password} /></div><p id="password-hint" className="field-hint">Use 12 or more characters. You can paste from a password manager.</p>{errors.password && <p id="password-error" className="field-error" role="alert">{errors.password}</p>}</div>
      <p className="preview-disclosure"><Info size={17} aria-hidden="true" /> This preview validates your password locally, then discards it. No account is created.</p><button className="button button-primary full" type="submit">Continue <ArrowRight size={19} aria-hidden="true" /></button></form><p className="theme-detail">{theme.name} · Sample admitted-student journey</p></div>;
}

const interests = [
  { name: 'Clubs', image: '/interest-clubs.png' }, { name: 'Arts', image: '/interest-arts.png' },
  { name: 'Sports', image: '/interest-sports.png' }, { name: 'Quiet spaces', image: '/interest-quiet.png' },
];

export function CampusScreen({ state, onContinue }: { state: DemoState; onContinue: (interests: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(state.interests);
  function toggle(name: string) { setSelected((current) => current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]); }
  return <div className="flow-page campus-page"><p className="flow-eyebrow">Your {themes[state.theme].name} journey</p><h1>What kind of campus life feels like yours?</h1><p className="lead">Pick what interests you. This will not affect your offer.</p><div className="interest-grid">{interests.map(({ name, image }) => <button className={`interest-tile ${selected.includes(name) ? 'selected' : ''}`} type="button" key={name} aria-pressed={selected.includes(name)} onClick={() => toggle(name)}><img src={image} alt="" /><span className="interest-check">{selected.includes(name) && <Check size={18} aria-hidden="true" />}</span><strong>{name}</strong></button>)}</div><p className="optional-note"><Info size={18} aria-hidden="true" /> You can skip this step for now.</p><div className="flow-actions"><button className="text-link" type="button" onClick={() => onContinue([])}>Skip for now</button><button className="button button-primary" type="button" onClick={() => onContinue(selected)}>Continue <ArrowRight size={19} aria-hidden="true" /></button></div></div>;
}
