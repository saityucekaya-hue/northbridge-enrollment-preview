export type IdentityDraft = {
  legalName: string;
  frontFileName: string;
  backFileName: string;
};

export type IdentityPreviewResult =
  | { status: 'matched'; message: string }
  | { status: 'mismatch'; message: string };

/** Design-only stand-in for a future authenticated verification API. No image data is inspected or sent. */
export async function previewIdentityMatch(draft: IdentityDraft): Promise<IdentityPreviewResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 550));
  if (/mismatch/i.test(draft.frontFileName + ' ' + draft.backFileName)) {
    return { status: 'mismatch', message: 'We could not match your details. Check the photos and name, then try again.' };
  }
  if (!draft.legalName.trim()) {
    return { status: 'mismatch', message: 'Add your full legal name before checking the ID.' };
  }
  return { status: 'matched', message: 'Your details are ready for university review.' };
}
