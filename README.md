## TD Studios VIP Room (Next.js + Builder.io)

### 1) Configure
```bash
cp .env.example .env.local
# edit values
```

- Get `BUILDER_PUBLIC_KEY` from Builder.io > Account > API Keys
- Set `VIP_CODES` as a comma-separated list.

### 2) Run
```bash
pnpm i # or npm i or yarn
pnpm dev
```
Open http://localhost:3000/vip-access, enter a code, get redirected into `/vip`.

### 3) Protect more routes
- All `/vip` and `/viproom` paths are gated by `middleware.ts`.
- To gate additional paths, update `PROTECTED_PREFIXES` and `config.matcher`.

### 4) Builder content
- Create a Page in Builder with URL `/vip` and publish. It renders inside the card on `/vip`.

### 5) Deploy
- Set the same env vars in Vercel.
- Ensure your domain uses HTTPS since the cookie is `secure: true`.

### Notes
- This is code-based access. For per-user auth, swap to Supabase/Clerk later. For now it's fast and works.
