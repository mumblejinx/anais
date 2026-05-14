# Security Specification: ANAIS_V4.0 Terminal

## Data Invariants
1. All documents must belong to the authenticated user's ID.
2. The user must be verified with the email `mumblejinx@gmail.com`.
3. Timestamps must be server-validated.
4. User metrics (XP, LVL) cannot be directly modified by the user unless it matches a valid state transition (though for this app, we might allow the owner to update their own stats for simplification, but we'll try to lock down identity first).

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a profile with a different `userId`.
2. **Access Breach**: Attempt to read `/users/mumblejinx_uid` while logged in as `hacker@gmail.com`.
3. **Email Spoofing**: Log in with `mumblejinx@gmail.com` but with `email_verified: false`.
4. **ID Poisoning**: Use a document ID that is 2MB long.
5. **Shadow Update**: Add a hidden field `isAdmin: true` to a sync entry.
6. **Relational Leak**: Attempt to list all users' logs by querying the collection group.
7. **Timestamp Fraud**: Supply a `createdAt` date in the future from the client.
8. **Resource Exhaustion**: Send a `truth` string that is 1MB in size.
9. **State Shortcutting**: Manually incrementing LVL from 1 to 999.
10. **Orphaned Write**: Create a memory fragment without an existing user profile (relational check).
11. **PII Leak**: Read the private profile data of another user.
12. **Query trust**: Reading a collection without a `userId` filter.

## Security Test Runner (Draft Rules)
The rules will explicitly check for `request.auth.token.email == 'mumblejinx@gmail.com'` and `request.auth.token.email_verified == true`.
