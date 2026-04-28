# AGENT.md — Multilingual Feedback Analyzer API

This file is for AI coding agents (Claude Code, Cursor, Copilot Workspace, etc.) working autonomously in this repository. Read this before making any changes.

---

## What This Project Is

A production-grade REST API that analyzes customer feedback in Tamil, Sinhala, English, Singlish, and Tanglish (code-mixed text) using Google Gemini 2.5 Flash. Built with Node.js + TypeScript + Express + PostgreSQL + Prisma 7 + `@prisma/adapter-pg`.

The core differentiator: **no translation before classification**. Feedback is passed to Gemini raw, as-is, including mixed-script and Romanized South Asian text.

---

## Agent Behavior Rules

### Before Writing Any Code
1. Check the relevant service file first — business logic may already exist
2. Check `src/validators/` for existing Zod schemas before creating new ones
3. Read `prisma/schema.prisma` before touching any database-related code
4. Run `npm run lint` before and after changes to catch issues early

### Code Placement Rules
| What | Where |
|---|---|
| Business logic | `src/services/` only |
| Request/response handling | `src/controllers/` only |
| Route definitions | `src/routes/` only |
| Input validation schemas | `src/validators/` only |
| Reusable utilities | `src/utils/` only |
| Environment config | `src/config/env.ts` only |
| Shared Prisma client | `src/lib/prisma.ts` only |

**Never mix these layers.** Controllers call services. Services call each other or external APIs. Routes call controllers. Nothing else.

### What Agents Are Allowed To Do
- Add new service functions following existing patterns
- Add new endpoints (schema → service → controller → route → register in app.ts)
- Modify Zod schemas in `src/validators/`
- Write or update tests in `tests/`
- Update `prisma/schema.prisma` and generate migrations
- Fix bugs in existing service or controller files
- Improve error messages or logging
- Add new utility functions in `src/utils/`

### What Agents Must NOT Do
- Modify `src/config/env.ts` without explicit instruction
- Change the Gemini system prompt in `geminiService.ts` without running eval afterward
- Add new npm dependencies without explicit user approval
- Delete or rename existing files without explicit instruction
- Commit `.env` or any secrets
- Add `any` types — use `unknown` and narrow with type guards
- Put logic in route files
- Skip Zod validation on any new endpoint
- Bypass the global `errorHandler` middleware with try/catch that swallows errors silently

---

## Service Pattern — Follow This Exactly

```typescript
// src/services/exampleService.ts

import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

export async function doSomething(input: string): Promise<ResultType> {
  console.log('[doSomething] -> Starting with input length:', input.length);

  try {
    const result = await prisma.someModel.create({ data: { ... } });
    console.log('[doSomething] -> Completed successfully');
    return result;
  } catch (error) {
    console.error('[doSomething] -> Failed:', (error as Error).message);
    throw new AppError('Something went wrong', 500);
  }
}
```

Key rules:
- Log entry with `[FunctionName] -> Starting...`
- Log success with `[FunctionName] -> Completed...`
- Log errors with `[FunctionName] -> Failed:` + message
- Throw `AppError` — never throw raw `Error` from services
- Export functions individually — no class, no object, no `Service` suffix

---

## Controller Pattern — Follow This Exactly

```typescript
// src/controllers/exampleController.ts

import type { Request, Response } from 'express';
import { mySchema } from '../validators/myValidator';
import { doSomething } from '../services/exampleService';
import { catchAsync } from '../utils/catchAsync';

export const handleSomething = catchAsync(async (req: Request, res: Response) => {
  const data = mySchema.parse(req.body);         // validate — throws if invalid
  const result = await doSomething(data.input);  // delegate to service

  res.status(200).json({
    success: true,
    data: result,
  });
});
```

Key rules:
- Wrap with `catchAsync` — never use try/catch in controllers
- Validate with Zod `.parse()` as first step — before any logic
- Call one service function — no logic between validation and service call
- Respond with `{ success: true, data: ... }` shape

---

## Route Pattern

```typescript
// src/routes/exampleRoutes.ts

import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { handleSomething } from '../controllers/exampleController';

const router = Router();
router.post('/something', authenticate, handleSomething);
export default router;
```

Register in `src/app.ts`:
```typescript
import exampleRoutes from './routes/exampleRoutes';
app.use('/api/v1/example', exampleRoutes);
```

---

## Zod Validator Pattern

```typescript
// src/validators/exampleValidator.ts

import { z } from 'zod';

export const ExampleSchema = z.object({
  projectId: z.string().uuid(),
  text: z.string().min(1).max(5000),
});

export type ExampleInput = z.infer<typeof ExampleSchema>;
```

---

## Gemini Integration — Critical Rules

1. **Never translate feedback text before classification** — pass raw text including Singlish/Tanglish
2. **Always use structured output** — `response_mime_type: "application/json"` with schema
3. **Always set `temperature: 0.1`** — low for consistent classification
4. **Always set `thinkingBudget: 0` on Flash** — disables extended thinking, saves cost
5. **Always set `safetySettings: BLOCK_ONLY_HIGH`** — prevents over-blocking on South Asian language content
6. **Model routing must be preserved:**
   - Default: `gemini-2.5-flash`
   - 429 fallback: `gemini-2.5-flash-lite`
   - Low confidence (<0.6) retry: `gemini-2.5-pro`
7. **After any system prompt change** — note the change in a commit message with date and reason

---

## Prisma Rules (v7)

The `url` field is NOT in `prisma/schema.prisma`. It lives in `prisma.config.ts`.
The PrismaClient uses `@prisma/adapter-pg`. The singleton is at `src/lib/prisma.ts`.

After any schema change:
```bash
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

Never edit migration files manually.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "statusCode": 400
}
```

In development only, errors also include `stack`. Never expose stack in production.

---

## Success Response Format

```json
{ "success": true, "data": { ... } }
```

---

## Language / Sentiment / Theme Enum Values

**detectedLang:** `tamil | sinhala | english | tanglish | singlish | mixed_other | unknown`

**sentiment:** `positive | negative | neutral | mixed`

**themes:** `service | price | quality | delivery | staff | food | app_ux | billing | other`

For sarcastic feedback: `isSarcastic = true` and sentiment reflects **intended** meaning.

---

## Test File Pattern

```typescript
// tests/feedback.test.ts
import { describe, it, expect } from 'vitest';

describe('POST /api/v1/feedback/submit', () => {
  it('should analyze Singlish feedback correctly', async () => {
    const response = await request(app)
      .post('/api/v1/feedback/submit')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ projectId: testProjectId, text: 'Service eka super machan!' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.analysis.detectedLang).toBe('singlish');
  });
});
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/app.ts` | Express setup, middleware, route registration |
| `src/server.ts` | Entry point |
| `src/config/env.ts` | Zod-validated env config |
| `src/lib/prisma.ts` | Shared PrismaClient singleton (adapter-pg) |
| `src/services/geminiService.ts` | All Gemini API logic — critical file |
| `src/utils/AppError.ts` | Operational error class |
| `src/utils/catchAsync.ts` | Wraps async route handlers |
| `prisma/schema.prisma` | Single source of truth for DB schema |
| `prisma.config.ts` | Prisma 7 CLI datasource config |
| `eval/gold-set.json` | 200-example labeled test set for AI eval |

---

## When Uncertain

If a task is ambiguous or requires a decision that could affect architecture:
1. Do not guess — stop and ask the user
2. Prefer the simplest implementation that fits existing patterns
3. Do not introduce new libraries or patterns without approval
4. Check if a similar pattern already exists before inventing one
