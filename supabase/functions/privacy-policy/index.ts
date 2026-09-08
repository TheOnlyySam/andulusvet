const headers = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff'
};

const policy = `AL-ANDALUS VETERINARY GROUP
PRIVACY POLICY

Last updated: August 22, 2026

1. Introduction
This policy applies to the Al-Andalus app and related services. We use your data to provide shopping, ordering, vaccine-book, and account services. We do not sell personal data.

2. Data we collect
We may collect names, email addresses, phone numbers, location and account information; animal, veterinarian, vaccine, and deworming details; animal images; order and delivery details; payment status; account notifications; and operational error records required to run the service.

3. How data is used
Data is used to authenticate accounts, maintain veterinary records, process orders and payments, deliver account-specific notifications, provide support, prevent misuse, and improve reliability.

4. Payments
Card payments are processed by the Qi payment gateway. The app does not store full card numbers or security codes. We retain transaction identifiers, amounts, currency, payment status, and information needed to match payments to orders.

5. Service providers and sharing
Data may be processed by Supabase for authentication, database, and storage services; by Qi for payment processing; and by WhatsApp when a user chooses to send an order. Data is otherwise shared only to provide the service, protect legal rights, or comply with law.

6. Security and storage
We use account-based access controls, encrypted connections, and reputable hosting services. No electronic method is completely secure, but access is restricted according to operational need and administrative permissions.

7. Retention and deletion
We retain data while an account is active and as needed to provide services and meet financial or legal requirements. You may request deletion of your account and data. Limited records may be retained when required by law.

8. Your choices
You may review or correct information, disable notifications through device settings, and request account or data deletion. We may verify account ownership before completing sensitive requests.

9. Advertising ID
The Al-Andalus app does not use the Android Advertising ID and does not include advertising services.

10. Contact
For access, correction, or deletion requests, contact Al-Andalus Veterinary Group through official support channels or WhatsApp at +964 780 173 0506.
`;

Deno.serve((request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  return new Response(policy, { status: 200, headers });
});
