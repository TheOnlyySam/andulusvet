const headers = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff'
};

const content = `AL-ANDALUS VETERINARY GROUP
ACCOUNT AND DATA DELETION REQUEST

Last updated: September 8, 2026

This page applies to the Al-Andalus app by Al-Andalus Veterinary Group.

How to request account deletion

You can permanently delete your account directly in the Al-Andalus app:

1. Sign in to your account.
2. Open the Profile tab.
3. Scroll to Account Details.
4. Select Delete Account.
5. Review the warning and confirm Delete Account.

The signed-in account and associated personal data are deleted after confirmation. If you cannot access the app, contact Al-Andalus Veterinary Group through WhatsApp at +964 780 173 0506 for assistance recovering access or submitting a verified deletion request.

What data is deleted

When an account deletion request is verified, we delete or anonymize personal account data associated with the app account, including:

- account profile information, such as name, email address, phone number, and display name
- saved delivery/contact details
- pet and veterinary record data connected to the account
- uploaded animal images or files connected to the account, where technically available
- account-specific notifications and app records that are no longer required

What data may be retained

Some limited records may be retained when required for legal, financial, security, fraud-prevention, dispute-resolution, or operational compliance reasons. This may include order history, payment transaction identifiers, invoices, support communications, audit logs, and records needed to meet accounting or legal obligations.

Retention period

In-app account deletion is processed immediately after confirmation. Support-assisted requests are normally processed within 30 days. Limited retained records are kept only as long as required for legal, financial, security, or operational obligations, then deleted or anonymized when no longer needed.

Requesting deletion of some data without deleting your account

You can also request deletion or correction of some app data without deleting your account by contacting the same support channel above. Please describe the specific data you want deleted or corrected.
`;

Deno.serve((request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  return new Response(content, { status: 200, headers });
});
