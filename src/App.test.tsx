import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { IdCardStudio } from './screens/IdCardStudio';
import { CollegeLifeTransition, collegeActivities } from './components/CollegeLifeTransition';
import { validateDocument, validatePassword } from './lib/demo';

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, '', '/sign-in');
  window.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function reachContact(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
  expect(screen.getByRole('heading', { name: 'Jordan, this is your offer.' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Accept sample offer/i }));
  expect(screen.getByRole('button', { name: /Continue with sample acceptance/i })).toBeDisabled();
  await user.click(screen.getByLabelText(/I have reviewed the sample offer, condition, deadline, and estimated costs/i));
  await user.click(screen.getByRole('button', { name: /Continue with sample acceptance/i }));
  expect(screen.getByRole('heading', { name: 'How can we reach you?' })).toBeInTheDocument();
}

async function reachCampus(user: ReturnType<typeof userEvent.setup>) {
  await reachContact(user);
  await user.type(screen.getByLabelText('Phone number'), '415 555 0123');
  await user.type(screen.getByLabelText('Password', { exact: true }), 'long-sample-password');
  await user.type(screen.getByLabelText('Confirm password'), 'long-sample-password');
  await user.click(screen.getByRole('button', { name: /^Continue$/i }));
  expect(screen.getByRole('heading', { name: 'What kind of campus life feels like yours?' })).toBeInTheDocument();
}

describe('offer-led sample journey', () => {
  it('moves from the invitation welcome through the full offer and acceptance to access setup', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/motion-concept');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Jordan, your next chapter starts here/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Preview of your conditional offer letter')).toHaveTextContent('Northbridge University');
    expect(screen.getByLabelText('Offer at a glance')).toHaveTextContent('BSc Computer Science');
    await user.click(screen.getByRole('button', { name: /Let’s go/i }));
    expect(screen.getByRole('heading', { name: /Your offer, Jordan/i })).toBeInTheDocument();
    const details = screen.getByRole('article', { name: 'Sample conditional offer details' });
    expect(within(details).getByRole('heading', { name: 'BSc Computer Science' })).toBeInTheDocument();
    expect(within(details).getByText('Autumn 2027')).toBeInTheDocument();
    expect(within(details).getByText('Final transcript required')).toBeInTheDocument();
    expect(within(details).getByText('15 June 2027')).toBeInTheDocument();
    expect(screen.getByText('$24,800')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('$26,000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View PDF/i })).toHaveAttribute('href', '/offer-letter-sample.pdf');
    const letterToggle = screen.getByRole('button', { name: /Your full offer letter/i });
    expect(letterToggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(letterToggle);
    expect(letterToggle).toHaveAttribute('aria-expanded', 'true');
    const letterDialog = screen.getByRole('dialog', { name: 'Read the full offer' });
    expect(within(letterDialog).getByRole('img', { name: /Complete one-page preview of the sample offer letter/i })).toHaveAttribute('src', '/offer-letter-sample-preview.png');
    expect(within(letterDialog).getByRole('link', { name: 'Download PDF' })).toHaveAttribute('download', 'Northbridge-offer-letter.pdf');
    expect(within(letterDialog).getByRole('button', { name: 'Close offer letter preview' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Read the full offer' })).not.toBeInTheDocument();
    expect(letterToggle).toHaveAttribute('aria-expanded', 'false');
    expect(letterToggle).toHaveFocus();
    expect(screen.getByLabelText('Illustrative diploma preview')).toBeInTheDocument();
    expect(screen.getByText(/Meek young men grow up in libraries/i)).toBeInTheDocument();
    expect(screen.getByText(/Ralph Waldo Emerson/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Accept offer/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Offer accepted!');
    expect(screen.getByRole('heading', { name: /College life loading/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Loading college life' })).toHaveAttribute('aria-valuenow', '13');
    await waitFor(() => expect(screen.getByRole('heading', { name: /How will you sign in next time/i })).toBeInTheDocument(), { timeout: 3000 });
  });

  it('shows the whole college life sequence and lets students continue', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    const { rerender } = render(<CollegeLifeTransition scene={0} onSkip={onSkip} />);
    expect(screen.getByText('Learning', { selector: '.college-life__scene-label strong' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Loading college life' })).toHaveAttribute('aria-valuenow', '13');
    for (const [scene, activity] of collegeActivities.entries()) {
      rerender(<CollegeLifeTransition scene={scene} onSkip={onSkip} />);
      expect(screen.getByText(activity.label, { selector: '.college-life__scene-label strong' })).toBeInTheDocument();
      const illustration = document.querySelector(`.student-scene[data-activity="${activity.kind}"]`);
      expect(illustration).toBeInTheDocument();
      expect(illustration?.querySelector('[data-role="student"]')).toBeInTheDocument();
    }
    expect(screen.getByRole('progressbar', { name: 'Loading college life' })).toHaveAttribute('aria-valuenow', '100');
    await user.click(screen.getByRole('button', { name: 'Continue to sign-in setup' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('lets students revisit unlocked steps and return without losing ID details', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/motion-concept');
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Let’s go/i }));
    const steps = screen.getByRole('navigation', { name: 'Enrollment steps' });
    expect(within(steps).getByRole('button', { name: /Your access/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Accept offer/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: /How will you sign in next time/i })).toBeInTheDocument(), { timeout: 3000 });
    await user.click(within(steps).getByRole('button', { name: /Your offer/i }));
    expect(screen.getByRole('heading', { name: /Your offer, Jordan/i })).toBeInTheDocument();
    await user.click(within(steps).getByRole('button', { name: /Your access/i }));
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Create your ID Card.' })).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByLabelText('Full legal name *').closest('.id-studio__identity-row')).toContainElement(screen.getByRole('button', { name: 'Choose profile photo' }));
    expect(screen.getByLabelText('Student ID card preview')).toHaveTextContent('Front & back preview');
    await user.type(screen.getByLabelText('Full legal name *'), 'Jordan Lee');
    await user.click(within(steps).getByRole('button', { name: /Your offer/i }));
    await user.click(within(steps).getByRole('button', { name: /Create your ID/i }));
    expect(screen.getByLabelText('Full legal name *')).toHaveValue('Jordan Lee');
  });

  it('requires a valid password to save and offers three simulated provider paths', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/motion-concept');
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Let’s go/i }));
    await user.click(screen.getByRole('button', { name: /Accept offer/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: /How will you sign in next time/i })).toBeInTheDocument(), { timeout: 3000 });
    const save = screen.getByRole('button', { name: /Save and continue/i });
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText('Create password'), 'shortpass');
    await user.type(screen.getByLabelText('Confirm password'), 'shortpass');
    expect(save).toBeEnabled();
    await user.click(save);
    expect(screen.getByLabelText('Create password')).toHaveFocus();
    expect(screen.getByText('3 more characters needed.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Create password'));
    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Create password'), 'long-sample-password');
    await user.type(screen.getByLabelText('Confirm password'), 'long-sample-password');
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Facebook' })).toBeInTheDocument();
    for (const provider of ['Google', 'Apple', 'Facebook']) {
      expect(screen.getByRole('button', { name: `Continue with ${provider}` }).querySelector('.journey__provider-logo svg')).toBeInTheDocument();
    }
    await user.click(save);
    expect(screen.getByRole('heading', { name: 'Create your ID Card.' })).toBeInTheDocument();
    const profile = screen.getByLabelText('Your student profile');
    expect(profile).toBeInTheDocument();
    expect(profile.querySelector('img')).toBeNull();
  }, 10_000);

  it('validates and checks the ID when Finish is clicked, celebrates, and opens both destinations', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('Image', class {
      naturalWidth = 800;
      naturalHeight = 1200;
      onload: (() => void) | null = null;
      set src(_value: string) { this.onload?.(); }
    });
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:portrait', revokeObjectURL: () => {} });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,portrait');
    window.history.replaceState({}, '', '/motion-concept');
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Let’s go/i }));
    await user.click(screen.getByRole('button', { name: /Accept offer/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument(), { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Create your ID Card.' })).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.queryByRole('button', { name: /Check my details/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    expect(screen.getByLabelText('Full legal name *')).toHaveFocus();
    expect(screen.getByText('Add and crop a profile photo.').closest('.id-studio__identity-row')).toBeInTheDocument();
    expect(screen.getByText('Add the front photo.').closest('.id-studio__document-choice')).toContainElement(screen.getByLabelText('Upload ID front'));
    expect(screen.getByText('Add the back photo.').closest('.id-studio__document-choice')).toContainElement(screen.getByLabelText('Upload ID back'));
    await user.type(screen.getByLabelText('Full legal name *'), 'Jordan Lee');
    expect(within(screen.getByLabelText('Student ID card preview')).getAllByText('Jordan Lee')).toHaveLength(2);
    expect(screen.queryByLabelText('I do not have a middle name')).not.toBeInTheDocument();
    await user.upload(screen.getByLabelText('Upload ID front'), new File(['front'], 'front.png', { type: 'image/png' }));
    await user.upload(screen.getByLabelText('Upload ID back'), new File(['back'], 'back.png', { type: 'image/png' }));
    await user.upload(screen.getByLabelText('Upload profile photo'), new File(['photo'], 'portrait.png', { type: 'image/png' }));
    const cropPreview = screen.getByLabelText(/Profile photo crop preview/i);
    const zoomControl = screen.getByRole('slider', { name: 'Zoom photo' });
    expect(zoomControl).toHaveValue('1.25');
    fireEvent.wheel(cropPreview, { deltaY: -120 });
    expect(zoomControl).toHaveValue('1.35');
    fireEvent.wheel(cropPreview, { deltaY: 120 });
    expect(zoomControl).toHaveValue('1.25');
    await user.click(screen.getByRole('button', { name: 'Save photo' }));
    const portraitInput = screen.getByLabelText('Upload profile photo');
    const chooserClick = vi.spyOn(portraitInput, 'click');
    await user.click(screen.getByRole('button', { name: 'Replace profile photo' }));
    expect(chooserClick).toHaveBeenCalledOnce();
    await user.upload(portraitInput, new File(['new photo'], 'new-portrait.png', { type: 'image/png' }));
    expect(screen.getByRole('dialog', { name: 'Edit profile photo' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save photo' }));
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    const celebration = await screen.findByRole('dialog', { name: 'Your first enrollment step is complete' });
    expect(celebration).toHaveTextContent('Nice one, Jordan!');
    expect(celebration.querySelector('.id-studio__success-mark')).not.toBeInTheDocument();
    const story = within(celebration).getByRole('img', { name: /Shareable story preview: My next chapter/i });
    expect(story).toBeInTheDocument();
    expect(story.querySelector('img')).toHaveAttribute('src', '/campus-northbridge.png');
    expect(story).toHaveTextContent('The gates are open');
    expect(within(celebration).queryByText('Jordan Lee')).not.toBeInTheDocument();
    expect(within(celebration).queryByText(/My next chapter starts here\. Excited for/i)).not.toBeInTheDocument();
    expect(within(celebration).queryByText(/No legal name, ID details/i)).not.toBeInTheDocument();
    expect(within(celebration).queryByText(/Share options opened/i)).not.toBeInTheDocument();
    expect(within(celebration).queryByRole('button', { name: 'Share image' })).not.toBeInTheDocument();
    expect(within(celebration).getByRole('button', { name: 'Download video' })).toBeInTheDocument();
    for (const platform of ['Instagram', 'LinkedIn', 'X', 'Facebook']) {
      expect(within(celebration).getByRole('link', { name: new RegExp(`Open ${platform} to share`) })).toBeInTheDocument();
    }
    await user.click(within(celebration).getByRole('button', { name: /Announcement 1:1/i }));
    const announcement = within(celebration).getByRole('img', { name: /Shareable announcement preview/i });
    expect(announcement).toHaveTextContent('I got accepted to');
    expect(announcement).toHaveTextContent('Northbridge University');
    await user.click(within(celebration).getByRole('button', { name: /Story 9:16/i }));
    expect(within(celebration).getByRole('img', { name: /Shareable story preview/i })).toBeInTheDocument();
    expect(within(celebration).getByRole('button', { name: 'See your pending enrollment tasks' }).querySelector('img')).toHaveAttribute('src', '/interest-quiet.png');
    expect(within(celebration).getByRole('button', { name: 'Explore campus opportunities & events' }).querySelector('img')).toHaveAttribute('src', '/campus-northbridge.png');
    await user.click(screen.getByRole('button', { name: /Explore campus opportunities & events/i }));
    expect(screen.getByRole('heading', { name: 'Moments to look forward to' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to ID card' }));
    await user.clear(screen.getByLabelText('Full legal name *'));
    await user.type(screen.getByLabelText('Full legal name *'), 'Asdfasdasdfasdsfasdfslasdhjgsldfjksdkfgdasf Example');
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    const longNameCelebration = await screen.findByRole('dialog', { name: 'Your first enrollment step is complete' });
    expect(longNameCelebration).toHaveTextContent('Nice one, Asdfasdasdfasd…!');
    await user.click(screen.getByRole('button', { name: /See your pending enrollment tasks/i }));
    expect(screen.getByRole('heading', { name: 'The next steps are yours.' })).toBeInTheDocument();
  }, 10_000);

  it('keeps Finish locked after a mismatch or a stale check, then allows a retry', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('Image', class {
      naturalWidth = 800;
      naturalHeight = 1200;
      onload: (() => void) | null = null;
      set src(_value: string) { this.onload?.(); }
    });
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:portrait', revokeObjectURL: () => {} });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,portrait');
    render(<IdCardStudio visible onBack={vi.fn()} onDestination={vi.fn()} />);
    await user.type(screen.getByLabelText('Full legal name *'), 'Jordan Avery Lee');
    await user.upload(screen.getByLabelText('Upload profile photo'), new File(['photo'], 'portrait.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: 'Save photo' }));
    await user.upload(screen.getByLabelText('Upload ID front'), new File(['front'], 'mismatch-front.png', { type: 'image/png' }));
    await user.upload(screen.getByLabelText('Upload ID back'), new File(['back'], 'back.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    await waitFor(() => expect(screen.getByText(/could not match your details/i)).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.queryByRole('dialog', { name: 'Your first enrollment step is complete' })).not.toBeInTheDocument();
    await user.upload(screen.getByLabelText('Upload ID front'), new File(['front'], 'front.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    await user.type(screen.getByLabelText('Full legal name *'), 'son');
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    expect(screen.queryByRole('dialog', { name: 'Your first enrollment step is complete' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Finish my ID card/i }));
    expect(await screen.findByRole('dialog', { name: 'Your first enrollment step is complete' })).toBeInTheDocument();
  });

  it('asks why before declining and restores focus when the decision dialog closes', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/motion-concept');
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Let’s go/i }));
    const trigger = screen.getByRole('button', { name: /Decline offer/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: /Before you go, are you sure/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yes, decline offer/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close decline dialog' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /Before you go/i })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByLabelText('The cost is a concern'));
    expect(screen.getByRole('button', { name: /Yes, decline offer/i })).toHaveClass('journey__button--danger');
    await user.click(screen.getByRole('button', { name: /Yes, decline offer/i }));
    expect(screen.getByRole('heading', { name: /Thank you for letting us know/i })).toBeInTheDocument();
  });

  it('keeps sign-in focused on the form and campus image', () => {
    render(<App />);
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Northbridge University campus in morning light/i })).toBeInTheDocument();
    expect(screen.queryByText('From your offer to what’s next.')).not.toBeInTheDocument();
  });

  it('shows complete illustrative costs and lets students reveal the future diploma', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
    const details = screen.getByRole('article', { name: 'Sample conditional offer details' });
    expect(within(details).getByText('Annual tuition')).toBeInTheDocument();
    expect(within(details).getByText('$24,800')).toBeInTheDocument();
    expect(within(details).getByText('$26,000')).toBeInTheDocument();
    expect(within(details).getByText(/Scholarship and aid are not yet confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /One step closer to your professional career/i })).toBeInTheDocument();
    expect(screen.getByText(/Illustrative diploma preview/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'See the campus' }));
    expect(screen.getByRole('button', { name: 'Preview sample diploma' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Preview sample diploma' }));
    expect(screen.getByRole('button', { name: 'See the campus' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps keyboard focus in the full offer dialog and restores it on close', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
    const trigger = screen.getByRole('button', { name: /Read full offer letter/i });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Close your full sample offer' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Back to your offer' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Your full sample offer' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('starts with the full offer, enforces review, then reaches enrollment and next steps', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
    await user.click(screen.getByRole('button', { name: /Read full offer letter/i }));
    const letter = screen.getByRole('dialog', { name: 'Your full sample offer' });
    expect(within(letter).getByText(/Submit your final transcript for review/i)).toBeInTheDocument();
    expect(within(letter).getByText(/Illustrative 2027–28 costs/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to your offer/i }));
    await user.click(screen.getByRole('button', { name: /Accept sample offer/i }));
    expect(screen.getByText(/tuition and fee estimate is \$26,000/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/I have reviewed the sample offer, condition, deadline, and estimated costs/i));
    await user.click(screen.getByRole('button', { name: /Continue with sample acceptance/i }));
    await user.type(screen.getByLabelText('Phone number'), '415 555 0123');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'long-sample-password');
    await user.type(screen.getByLabelText('Confirm password'), 'long-sample-password');
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    await user.click(screen.getByRole('button', { name: /Clubs/i }));
    expect(screen.getByRole('button', { name: /Clubs/i })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    await user.click(screen.getByRole('button', { name: /Start enrollment/i }));
    expect(screen.getByRole('heading', { name: 'Let’s get the easy items out of the way.' })).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Choose government ID file'), new File(['%PDF'], 'id.pdf', { type: 'application/pdf' }));
    expect(screen.getByText('id.pdf')).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Choose profile photo file'), new File(['photo'], 'portrait.jpg', { type: 'image/jpeg' }));
    expect(screen.getByText('portrait.jpg')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Continue to tasks/i }));
    expect(screen.getByRole('heading', { name: 'Thanks for getting started, Jordan.' })).toBeInTheDocument();
    expect(screen.getByText(/No place is reserved/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /View enrollment tasks/i }));
    expect(screen.getByText('Final transcript')).toBeInTheDocument();
    expect(screen.getAllByText('Selected locally · not submitted')).toHaveLength(2);
  });

  it('requires valid contact details and password, with focus on the first missing field', async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachContact(user);
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(screen.getByText(/Enter a phone number where the university can reach you/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Phone number')).toHaveFocus();
    await user.type(screen.getByLabelText('Phone number'), '415 555 0123');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'short');
    await user.type(screen.getByLabelText('Confirm password'), 'short');
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(screen.getByText('Use 12 or more characters.')).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { exact: true })).toHaveFocus();
  });

  it('lets students skip campus interests and defer enrollment without a reserved-place claim', async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachCampus(user);
    await user.click(screen.getByRole('button', { name: /Skip for now/i }));
    expect(screen.getByRole('heading', { name: 'Ready to start enrollment?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Maybe later/i }));
    expect(screen.getByRole('heading', { name: 'Your sample offer is saved, Jordan.' })).toBeInTheDocument();
    expect(screen.getByText(/place is not yet reserved/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Explore campus & events/i }));
    expect(screen.getByText(/sample destinations, not live events/i)).toBeInTheDocument();
  });

  it('supports the Audentra University theme with the same journey and no student SSO buttons', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Preview university'), 'audentra');
    await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
    expect(screen.getAllByText('Audentra University', { selector: 'strong' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Accept sample offer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Google|Microsoft|Apple/i })).not.toBeInTheDocument();
  });

  it('lets a student switch the sample university from the offer menu', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Explore as Jordan/i }));
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('navigation', { name: 'Preview menu' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('navigation', { name: 'Preview menu' })).getByRole('button', { name: 'Audentra' }));
    expect(screen.getByRole('heading', { name: 'Jordan, this is your offer.' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Preview menu' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Audentra University').length).toBeGreaterThan(0);
  });

  it('keeps document choices independent and requires re-selection after a page reload', async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await reachCampus(user);
    await user.click(screen.getByRole('button', { name: /Skip for now/i }));
    await user.click(screen.getByRole('button', { name: /Start enrollment/i }));
    await user.upload(screen.getByLabelText('Choose government ID file'), new File(['%PDF'], 'id.pdf', { type: 'application/pdf' }));
    expect(screen.getByText('id.pdf')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Profile photo' })).toHaveTextContent('Not added yet');
    view.unmount();
    render(<App />);
    expect(screen.getByRole('region', { name: 'Government ID card' })).toHaveTextContent('Choose again');
    expect(screen.getByText(/File contents are not saved in this demo/i)).toBeInTheDocument();
  });
});

describe('document rules', () => {
  it('applies distinct ID and profile-photo formats and size limits', () => {
    expect(validateDocument(new File(['x'], 'portrait.pdf'), 'profilePhoto')).toMatch(/JPG or PNG/);
    expect(validateDocument(new File(['x'], 'id.pdf'), 'governmentId')).toBeNull();
    expect(validateDocument(new File([], 'empty.jpg'), 'profilePhoto')).toMatch(/empty/);
    expect(validateDocument(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png'), 'profilePhoto')).toMatch(/10 MB/);
    expect(validatePassword('abcdefghijkl', 'different-value')).toMatch(/do not match/);
  });
});
