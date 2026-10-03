# GitHub Streak Counter

A Next.js app that shows a GitHub user's current streak, longest streak and total contributions, and generates an SVG streak card you can embed in your GitHub README.

Live site: <https://github-streak-bijay-shre-stha.vercel.app>

## Motivation

Many streak tools only count public contributions, so a streak can drop to zero even when someone codes every day in private repositories. This project reads the GitHub contribution calendar through the GraphQL API, which includes private contributions **when GitHub exposes them** (see [Private contributions](#private-contributions)).

## Features

- **Streak stats**: current streak, longest streak, total contributions, active days, average per day and best day.
- **README card**: an SVG image at `/api/streak-image`, with a "Copy README Markdown" button on every result.
- **Profile pages**: shareable `/<username>` pages (for example `/torvalds?theme=radical`) with per-user metadata.
- **Compare mode**: put two users side by side with a winner for each metric. You can share the link (`/?mode=compare&userA=a&userB=b`).
- **Custom leaderboards**: rank up to 10 usernames. The list lives in the URL (`/leaderboard?users=a,b,c`), so nothing is stored on a server.
- **Theme gallery**: preview every theme with your own stats at `/themes`.
- **Recent searches**: saved only in your browser's localStorage, and you can clear them.
- **API playground**: try the endpoints at `/api-playground`.

## Themes

`default`, `github`, `radical`, `tokyonight`, `dracula`, `react`

## Embedding in your README

```markdown
[![GitHub Streak](https://github-streak-bijay-shre-stha.vercel.app/api/streak-image?username=YOUR_USERNAME&theme=radical)](https://github-streak-bijay-shre-stha.vercel.app/YOUR_USERNAME?theme=radical)
```

Use `/api/streak-stats-image` instead of `/api/streak-image` for a taller card with extra stats. Images are cached for up to one hour.

## Routes

| Route | Description |
| --- | --- |
| `/` | Search and compare (`?username=`, `?mode=compare&userA=&userB=`, `?theme=`) |
| `/<username>` | Profile page (`?theme=`) |
| `/leaderboard` | Custom leaderboard (`?users=a,b,c`) |
| `/themes` | Theme gallery (`?username=`) |
| `/api-playground` | Interactive API tester |

### API

| Endpoint | Params | Returns |
| --- | --- | --- |
| `GET /api/streak` | `username`, optional `variant=extended` | JSON streak stats |
| `GET /api/streak-compare` | `userA`, `userB` | JSON comparison with `diff` and `leaders` |
| `GET /api/profile` | `username` | JSON public profile (`email` is always `null`) |
| `GET /api/streak-image` | `username`, optional `theme` | SVG card |
| `GET /api/streak-stats-image` | `username`, optional `theme` | SVG card with extended stats |

Errors are JSON `{ error, code }` (plain text for the image routes):

- `400`: `MISSING_USERNAME`, `INVALID_USERNAME`, `INVALID_THEME`, `MISSING_USERS`, `INVALID_USER_A`/`INVALID_USER_B`, or `SAME_USER`.
- `404`: `NOT_FOUND`. Compare responses also include `missingUsers`.
- `429`: `RATE_LIMITED` (60 requests per minute per IP) or `UPSTREAM_RATE_LIMITED` (GitHub's limit). Both include a `Retry-After` header.
- `502`/`500`: GitHub or server errors.

## How streaks are calculated

- Dates are UTC calendar dates from GitHub's contribution calendar.
- A streak is a run of consecutive days with at least one contribution.
- If today has no contributions yet, a streak that reached yesterday still counts as current.

The rules are covered by tests in `lib/streak.test.ts`.

## Private contributions

Private contributions are counted only when one of these is true:

1. The user turned on **Include private contributions on my profile** in GitHub settings. GitHub then reports them as anonymous counts.
2. The server's `GITHUB_TOKEN` belongs to someone who can see those contributions.

Otherwise only public contributions are counted.

## Getting started

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | yes | GitHub personal access token used for GraphQL requests. A token with no scopes is enough for public data. Add `repo` only if you want the token owner's private contributions to count. |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL used in share links, README snippets and metadata. Defaults to `https://github-streak-bijay-shre-stha.vercel.app`. Set it when you deploy your own copy. |

Create `.env.local`:

```env
GITHUB_TOKEN=your_personal_access_token_here
NEXT_PUBLIC_SITE_URL=https://your-deployment.example.com
```

### Run locally

```bash
git clone https://github.com/Bijay-Shre-stha/github-streak.git
cd github-streak
npm install
npm run dev
```

Open <http://localhost:3000>.

### Scripts

```bash
npm test -- --run   # unit + API route tests (Vitest)
npm run lint
npm run build
```

## Limitations

- Rate limiting is in memory and applies per server instance, so it is not shared across serverless instances.
- Each lookup makes one GitHub GraphQL request per contribution year. Users with long histories use more of the token's GitHub rate limit.

## Contributing

Contributions are welcome. Please open a pull request.

## License

MIT
