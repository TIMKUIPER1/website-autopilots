# Owner authentication acceptance

## Current live evidence — 2026-08-03

The exact Autopilots Supabase project has been inspected read-only:

- owner profile active: yes;
- legal-entity owner membership active: yes;
- Supabase Auth user linked: yes;
- verified TOTP factors: 0;
- active AAL2 application sessions: 0.

No identity, email address, token, factor identifier or secret is emitted by the
inspection. This is the expected safe pre-enrollment state: MFA policy is
configured, but no claim is made that the owner has completed MFA.

## User-owned acceptance journey

1. Open the managed Autopilots OS login page.
2. Enter the already authorized owner email address and request one login link.
3. Open that one-time link in the same trusted browser.
4. Enroll TOTP with the owner's authenticator app when prompted.
5. Enter the current six-digit code. The application must refuse to create a
   managed session unless Supabase returns AAL2.
6. Open Security Control and require the current session to show `MFA bewezen`.
7. Verify portfolio, one company view, Audit Trail and read-only monitoring;
   then log out and confirm the protected route redirects to login.
8. Repeat login with the enrolled factor and verify session restoration remains
   bound to the same legal entity and role.

## Pass conditions

- exactly one current active owner session is AAL2;
- no AAL1 managed session exists for the MFA-required profile;
- organization and brand scope are unchanged;
- logout invalidates the application session;
- no provider authorization, product connection or external write is enabled.

Sending the login link and enrolling TOTP are explicit user actions. They are
not performed by the control-plane build or by Work Authorization A automation.
