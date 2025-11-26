# CLAUDE.md - AI Assistant Guide for TD Studios VIP Room

## Project Overview

**TD Studios VIP Room** is a Next.js 14+ application that provides code-based access control to exclusive VIP content powered by Builder.io CMS. The application features a simple authentication flow using access codes stored in environment variables.

### Tech Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.9.2
- **CMS**: Builder.io React SDK 5.0.0
- **Validation**: Zod 3.23.8
- **Runtime**: Node.js
- **Deployment**: Docker + Nginx (production) / Vercel-compatible

### Key Features
- Code-based VIP access control
- Session management with HTTP-only cookies
- Builder.io headless CMS integration
- ISR (Incremental Static Regeneration) for content
- Middleware-based route protection
- Secure cookie handling with configurable domain

---

## Repository Structure

```
theviproom/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   └── vip/
│   │       ├── login/route.ts    # VIP code validation & session creation
│   │       └── logout/route.ts   # Session termination
│   ├── vip/                      # Protected VIP content area
│   │   └── page.tsx              # Builder.io content renderer
│   ├── vip-access/               # Public access code entry
│   │   └── page.tsx              # Login form (client component)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Public landing page
├── lib/                          # Shared utilities
│   ├── cookies.ts                # Cookie getter utility
│   ├── env.ts                    # Environment validation & exports
│   └── session.ts                # Session management functions
├── middleware.ts                 # Route protection middleware
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
├── deploy.sh                     # Production deployment script
├── Dockerfile                    # Container image definition
├── docker-compose.yml            # Docker orchestration
├── nginx.conf                    # Production web server config
├── index.html                    # Legacy static files
├── styles.css                    # Legacy static styles
└── script.js                     # Legacy static scripts
```

**Note**: The project contains both a Next.js application and legacy static HTML files. The Next.js app is the primary application. The static files (index.html, styles.css, script.js) appear to be from a previous implementation and are used in the Docker deployment.

---

## Architecture & Key Patterns

### 1. Authentication Flow

```
User visits /vip → Middleware checks cookie → No session? → Redirect to /vip-access
                                           ↓
                                     Has session? → Allow access
```

**Implementation Details**:
- **Cookie Name**: Configurable via `VIP_COOKIE_NAME` (default: `td_vip`)
- **Cookie Value**: Simple flag `"1"` indicates valid session
- **Cookie Settings**: `httpOnly: true`, `sameSite: "lax"`, `secure: true`
- **Session Duration**: Configurable via `VIP_SESSION_MINUTES` (default: 1440 = 24 hours)

### 2. Environment Configuration

All environment variables are validated using Zod schemas in `lib/env.ts`:

```typescript
// Required variables
BUILDER_PUBLIC_KEY    // Builder.io API key
VIP_CODES            // Comma-separated access codes

// Optional variables
VIP_COOKIE_NAME      // Cookie name (default: td_vip)
VIP_COOKIE_DOMAIN    // Cookie domain override
VIP_SESSION_MINUTES  // Session duration (default: 1440)
```

**Key Pattern**: Environment variables are parsed once at startup and exported as typed constants. Access codes are stored in a `Set` for O(1) lookup and normalized to lowercase.

### 3. Middleware Route Protection

**File**: `middleware.ts`

Protected route prefixes:
- `/vip`
- `/vip/`
- `/viproom`
- `/viproom/`

**Important**: The `config.matcher` must be kept in sync with `PROTECTED_PREFIXES`. Currently:
```typescript
matcher: ["/vip/:path*", "/viproom/:path*"]
```

### 4. Builder.io Integration

**Pattern**: Server-side content fetching with ISR

```typescript
// In app/vip/page.tsx
export const revalidate = 30; // Revalidate every 30 seconds

const content = await builder.get("page", { url: "/vip" }).toPromise();
```

**Content Management**:
1. Create pages in Builder.io dashboard
2. Set page URL to `/vip` (or other protected routes)
3. Content automatically renders via `<BuilderComponent />`
4. ISR ensures content updates within 30 seconds

---

## Development Workflows

### Initial Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Configure required variables
# Edit .env.local with:
# - BUILDER_PUBLIC_KEY (from Builder.io > Account > API Keys)
# - VIP_CODES (comma-separated, case-insensitive)

# 3. Install dependencies
npm install
# or: pnpm install, yarn install

# 4. Start development server
npm run dev
```

### Development Server
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled for all file changes
- **Environment**: `.env.local` takes precedence

### Testing Access Flow

1. Visit http://localhost:3000/vip → Should redirect to /vip-access
2. Enter a valid code from `VIP_CODES`
3. Should redirect back to /vip with session cookie
4. Visit /vip again → Should access directly (no redirect)

### Adding New Protected Routes

1. **Update middleware.ts**:
   ```typescript
   const PROTECTED_PREFIXES = ["/vip", "/vip/", "/viproom", "/viproom/", "/new-route"];

   export const config = {
     matcher: ["/vip/:path*", "/viproom/:path*", "/new-route/:path*"],
   };
   ```

2. **Create the route**: Add files in `app/new-route/`

3. **Test protection**: Visit route without session → Should redirect to /vip-access

---

## Code Conventions & Best Practices

### TypeScript Usage
- **Strict Mode**: Disabled (`strict: false` in tsconfig.json)
- **Type Imports**: Use `import type` for type-only imports
- **Any Types**: Acceptable but prefer inference where possible

### Component Patterns

**Server Components (default)**:
```typescript
// app/vip/page.tsx
export default async function VipPage() {
  const content = await builder.get("page", { url: "/vip" }).toPromise();
  // ...
}
```

**Client Components (when needed)**:
```typescript
// app/vip-access/page.tsx
"use client";
import { useState } from "react";
```

Use client components for:
- Form handling & user input
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect, etc.)

### API Route Patterns

**Request Handling**:
```typescript
export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  // Validate and respond
}
```

**Response Patterns**:
```typescript
// Success
return NextResponse.json({ ok: true });

// Error
return NextResponse.json({ message: "Invalid code" }, { status: 401 });
```

### Session Management

**Always use the helper functions**:
```typescript
import { setVipSession, clearVipSession } from "@/lib/session";
import { getVipCookie } from "@/lib/cookies";

// Set session (in API routes)
await setVipSession();

// Clear session
await clearVipSession();

// Check session (server components)
const cookie = await getVipCookie();
const hasSession = cookie === "1";
```

### Environment Access

**Never access process.env directly in application code**. Always use the validated exports from `lib/env.ts`:

```typescript
import { env, VIP_CODES, VIP_COOKIE_NAME } from "@/lib/env";

// Check if code is valid
const isValid = VIP_CODES.has(code.toLowerCase());

// Use cookie name
const cookie = req.cookies.get(VIP_COOKIE_NAME);
```

---

## Security Considerations

### Current Security Model

1. **Code-Based Access**: Simple shared secrets for VIP access
2. **Cookie Security**: HTTP-only, secure, SameSite=lax
3. **No User Tracking**: Sessions don't identify individual users
4. **No Rate Limiting**: Consider adding if abuse is a concern
5. **HTTPS Required**: Cookies have `secure: true` flag

### Known Limitations

- **Shared Codes**: All users with a code share the same access level
- **No Revocation**: No way to invalidate specific sessions
- **No Audit Trail**: No logging of who accessed what
- **Simple Session**: Cookie value is just "1" (could be more sophisticated)

### Future Auth Considerations

The README notes: "For per-user auth, swap to Supabase/Clerk later."

If implementing user-based auth:
1. Replace `VIP_CODES` with user database lookup
2. Store user ID in session cookie (or use JWT)
3. Add logout functionality that clears user session
4. Implement proper session management with DB

---

## Builder.io Integration Guide

### Setup

1. **Get API Key**: Builder.io dashboard → Account → API Keys
2. **Add to Environment**: Set `BUILDER_PUBLIC_KEY` in `.env.local`
3. **Initialize**: SDK is initialized in `app/vip/page.tsx`

### Creating Content

1. In Builder.io dashboard, create a new **Page**
2. Set the page **URL** to `/vip` (or the route you want to populate)
3. Design the page using Builder's visual editor
4. **Publish** the page
5. Content appears automatically in the app (within 30s due to ISR)

### Content Fetching Pattern

```typescript
// Server component
const content = await builder.get("page", { url: "/vip" }).toPromise();

// Render
{content ? (
  <BuilderComponent model="page" content={content} />
) : (
  <div>No content found</div>
)}
```

### Customizing Content Model

To use different Builder.io models:
1. Change the model name in `builder.get()`:
   ```typescript
   const content = await builder.get("your-model-name", { url: "/vip" });
   ```
2. Update the `<BuilderComponent model="your-model-name" />` prop

### ISR Configuration

```typescript
export const revalidate = 30; // Seconds between revalidation
```

Adjust this value based on:
- **Lower (10-15s)**: Frequently updated content
- **Higher (60-300s)**: Stable content, reduce API calls
- **0**: Disable ISR (always static)
- **false**: Disable static generation (always dynamic)

---

## Deployment

### Development
```bash
npm run dev        # Start dev server on :3000
```

### Production Build
```bash
npm run build      # Create optimized build
npm run start      # Start production server
```

### Docker Deployment

The project includes Docker configuration for production deployment:

**Build & Run**:
```bash
docker build -t viproom:latest .
docker run -d -p 8080:80 --name viproom viproom:latest
```

**Docker Compose**:
```bash
docker-compose up -d
```

**Environment Variables in Docker**:
Add to `docker-compose.yml`:
```yaml
environment:
  - BUILDER_PUBLIC_KEY=${BUILDER_PUBLIC_KEY}
  - VIP_CODES=${VIP_CODES}
  - VIP_COOKIE_NAME=td_vip
  - VIP_SESSION_MINUTES=1440
```

### Automated Deployment Script

**File**: `deploy.sh`

Deploys to TD Studios production server (td-core-01):
```bash
./deploy.sh
```

**What it does**:
1. Creates deployment package (tar.gz)
2. Uploads to server via SCP
3. Extracts files on server
4. Builds Docker image
5. Stops old container
6. Starts new container
7. Updates Caddy reverse proxy configuration
8. Runs health checks

**Production URL**: https://www.tdstudiosdigital.com

### Vercel Deployment

The app is Vercel-compatible:
1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

**Important**: Ensure production domain uses HTTPS (required for secure cookies)

---

## Common Development Tasks

### Adding a New VIP Code

1. **Local Development**:
   Edit `.env.local`:
   ```
   VIP_CODES=GOLD-ALPHA-2025,CABANA-777,TD-VIP,NEW-CODE
   ```

2. **Production**:
   Update environment variable in deployment platform (Vercel, server env, etc.)

3. **No Code Changes Needed**: Codes are read from environment at runtime

### Removing a VIP Code

Simply remove it from the `VIP_CODES` list. Existing sessions remain valid until expiration.

### Changing Session Duration

Update `VIP_SESSION_MINUTES` in environment:
```
VIP_SESSION_MINUTES=2880  # 48 hours
```

### Adding a Logout Button to Any Page

```typescript
<form action="/api/vip/logout" method="post">
  <button type="submit">Logout</button>
</form>
```

### Checking if User Has Session (Server Component)

```typescript
import { getVipCookie } from "@/lib/cookies";

export default async function MyPage() {
  const hasSession = (await getVipCookie()) === "1";

  return <div>{hasSession ? "VIP User" : "Guest"}</div>;
}
```

### Checking if User Has Session (Client Component)

```typescript
"use client";
import { useEffect, useState } from "react";

export default function MyComponent() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    fetch("/api/vip/check-session")
      .then(r => r.json())
      .then(data => setHasSession(data.hasSession));
  }, []);

  // Note: You'd need to create /api/vip/check-session route first
}
```

### Customizing Protected Routes

**To protect a new route**:
1. Add prefix to `PROTECTED_PREFIXES` in `middleware.ts`
2. Add matcher pattern to `config.matcher`

**Example** - Protect `/premium`:
```typescript
const PROTECTED_PREFIXES = ["/vip", "/vip/", "/viproom", "/viproom/", "/premium", "/premium/"];

export const config = {
  matcher: ["/vip/:path*", "/viproom/:path*", "/premium/:path*"],
};
```

### Debugging Middleware Issues

**Check if middleware is running**:
```typescript
export function middleware(req: NextRequest) {
  console.log("[MIDDLEWARE]", req.nextUrl.pathname);
  // ... rest of code
}
```

**Check cookie value**:
```typescript
const cookie = req.cookies.get(VIP_COOKIE_NAME);
console.log("[COOKIE]", cookie?.value);
```

**Common Issues**:
- Matcher pattern doesn't match route
- Cookie domain mismatch (localhost vs production domain)
- Secure flag requires HTTPS (fails on HTTP in production)

---

## File-Specific Notes

### `lib/env.ts`
- **Single Source of Truth**: All environment access goes through here
- **Validation**: Uses Zod schema to validate at startup
- **Fails Fast**: Invalid env causes startup failure (good for catching misconfigurations)
- **Exports**: Use named exports (`VIP_CODES`, `VIP_COOKIE_NAME`) not the `env` object directly

### `middleware.ts`
- **Runs on Edge Runtime**: Keep logic lightweight
- **No Database Access**: Can't use async database calls here
- **Cookie Checking Only**: Just checks if cookie exists/matches
- **Sync with Matcher**: `PROTECTED_PREFIXES` and `config.matcher` must align

### `app/vip/page.tsx`
- **Server Component**: Fetches Builder.io content server-side
- **ISR Enabled**: `revalidate: 30` for automatic content updates
- **Async by Default**: Can directly await API calls
- **No User Interaction**: Pure rendering, no forms or event handlers

### `app/vip-access/page.tsx`
- **Client Component**: Required for form handling and state
- **Next URL Redirect**: Supports `?next=/vip/some-page` redirect after login
- **Error Handling**: Displays API error messages to user
- **Loading State**: Disables button while checking code

---

## Testing Guidelines

### Manual Testing Checklist

- [ ] Visit /vip without session → Redirects to /vip-access
- [ ] Enter invalid code → Shows error message
- [ ] Enter valid code → Redirects to /vip
- [ ] Visit /vip with session → Direct access (no redirect)
- [ ] Click logout → Clears session, redirects
- [ ] Session persists after browser close (if within expiration)
- [ ] Session expires after configured duration
- [ ] Builder.io content renders correctly
- [ ] ISR updates content within 30 seconds

### Testing in Production

**Health Check**:
```bash
curl -f https://www.tdstudiosdigital.com/health
```

**Check Container Status**:
```bash
docker ps --filter "name=viproom"
```

**View Container Logs**:
```bash
docker logs -f viproom
```

---

## Troubleshooting

### "Invalid code" Error When Code Should Work

**Possible Causes**:
1. Code has leading/trailing spaces in `.env` file
2. Code case doesn't match (codes are case-insensitive, but check for typos)
3. `.env.local` not being read (Next.js caches env vars)
4. Production environment variables not set correctly

**Solutions**:
- Restart dev server after changing `.env.local`
- Check `VIP_CODES` has no extra spaces: `CODE1,CODE2` not `CODE1, CODE2`
- In server component, add debug log: `console.log([...VIP_CODES])`

### Middleware Not Protecting Routes

**Check**:
1. Route matches a pattern in `config.matcher`
2. Middleware file is at project root (not in `app/` directory)
3. No typos in `PROTECTED_PREFIXES`
4. Dev server was restarted after middleware changes

### Builder.io Content Not Showing

**Check**:
1. `BUILDER_PUBLIC_KEY` is set correctly
2. Page URL in Builder.io matches the fetched URL exactly (`/vip`)
3. Page is **Published** in Builder.io (not just saved as draft)
4. Wait 30 seconds for ISR revalidation
5. Check Builder.io API quota/limits

**Debug**:
```typescript
const content = await builder.get("page", { url: "/vip" }).toPromise();
console.log("Builder content:", content); // Should be an object, not null
```

### Cookies Not Being Set

**Check**:
1. Production uses HTTPS (required for `secure: true`)
2. Cookie domain matches your domain (or leave unset for auto)
3. Browser isn't blocking cookies
4. SameSite policy isn't too strict

**Debug** (in API route):
```typescript
await setVipSession();
const jar = await cookies();
console.log("Set cookie:", jar.get(VIP_COOKIE_NAME));
```

### Session Not Persisting

**Check**:
1. Session duration: `VIP_SESSION_MINUTES` in env
2. Cookie expiration is being set correctly
3. Browser isn't in private/incognito mode
4. No conflicting cookie-clearing browser extensions

---

## Performance Optimization

### Current Optimizations
- **ISR**: Content cached and revalidated every 30s
- **Server Components**: Most components are server-rendered
- **Edge Middleware**: Fast cookie checking at edge
- **Static Assets**: CSS/JS are static and cacheable

### Potential Improvements
1. **Caching Strategy**: Add cache headers for static assets
2. **Image Optimization**: Use Next.js Image component if Builder.io content includes images
3. **Bundle Size**: Analyze with `npm run build` and optimize imports
4. **Database**: If adding user auth, use connection pooling and indexes
5. **CDN**: Deploy behind Cloudflare or similar for global edge caching

---

## Migration Notes

### From Static HTML to Next.js

The project contains legacy static files (`index.html`, `styles.css`, `script.js`). These are:
- Used in Docker deployment (served via Nginx)
- Potentially outdated compared to Next.js app
- Should be kept in sync if both are active
- Can be removed if Next.js app fully replaces static site

### Future Enhancements

Per README, consider:
1. **User-Based Auth**: Supabase or Clerk for per-user authentication
2. **Database**: Store sessions, user profiles, access logs
3. **Admin Panel**: Manage codes, view analytics
4. **Rate Limiting**: Prevent brute-force code guessing
5. **Audit Logs**: Track who accessed what and when
6. **Multi-Tier Access**: Different codes grant different permissions
7. **Time-Limited Codes**: Codes that expire after certain date
8. **Usage Limits**: Limit how many times a code can be used

---

## Contact & Resources

### Project Information
- **Repository**: theviproom
- **Primary Branch**: `claude/claude-md-mifqpfnsdxjzifan-014phxz9isWZGC7fFMVxdWyy`
- **Production Domain**: www.tdstudiosdigital.com
- **Organization**: TD Studios

### External Documentation
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Builder.io React SDK](https://www.builder.io/c/docs/developers)
- [Zod Validation](https://zod.dev)

### Development Scripts
```json
{
  "dev": "next dev",       // Development server
  "build": "next build",   // Production build
  "start": "next start"    // Production server
}
```

---

## Quick Reference

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BUILDER_PUBLIC_KEY` | Yes | - | Builder.io API key |
| `VIP_CODES` | Yes | - | Comma-separated access codes |
| `VIP_COOKIE_NAME` | No | `td_vip` | Session cookie name |
| `VIP_COOKIE_DOMAIN` | No | - | Cookie domain override |
| `VIP_SESSION_MINUTES` | No | `1440` | Session duration (24 hours) |

### Key Files for AI Assistants
- `lib/env.ts` - Environment configuration
- `middleware.ts` - Route protection logic
- `lib/session.ts` - Session management
- `app/api/vip/login/route.ts` - Authentication endpoint
- `app/vip/page.tsx` - Protected content page
- `.env.example` - Environment template

### Protected Routes
- `/vip` and `/vip/*`
- `/viproom` and `/viproom/*`

### Public Routes
- `/` - Landing page
- `/vip-access` - Login page
- `/api/vip/login` - Auth endpoint
- `/api/vip/logout` - Logout endpoint

---

*Last Updated: 2025-11-26*
*Generated for AI Assistant Context*
