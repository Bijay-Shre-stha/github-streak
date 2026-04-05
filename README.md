# GitHub Streak Counter

A modern, full-stack Next.js application that calculates and displays your GitHub contribution streak stats. You can use this app to generate beautiful, highly accurate contribution streak badges and embed them directly into your GitHub README.

## Motivation

Existing GitHub streak tracking tools often fall short by only measuring public contributions, completely ignoring the hard work developers put into private repositories. This can be highly frustrating when your "streak" drops to zero despite you coding every single day. I built this GitHub Streak Counter to overcome that limitation—it accurately measures **all** your activity, including your private commit history, ensuring your true dedication and daily coding efforts are properly recognized.

## Features

- **Accurate Streak Calculation**: Utilizes the GitHub GraphQL API to fetch user contribution data and accurately determine the current and longest streaks.
- **Beautiful UI**: Designed with Tailwind CSS v4, featuring smooth transitions, dynamic background gradients, and dark mode support.
- **Debounced Search**: A seamless user experience with debounced username searching, displaying loading states and error handling elegantly.
- **Customizable Themes**: Multiple carefully tuned themes (Default, Emerald, Ocean, Sunset, Midnight, Monochrome, Neon) to customize your streak display.
- **Embeddable Badges**: (Planned/Available) easily generate URLs to embed SVG/PNG badges directly into your `README.md` on GitHub.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: GitHub GraphQL API

## Getting Started

### Prerequisites

You will need a GitHub Personal Access Token to authenticate with the GitHub API. 

1. Go to your GitHub Settings > Developer Settings > Personal access tokens.
2. Generate a new token (classic or fine-grained) with `read:user` and `repo` (if you want to include private contributions) permissions.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/github-streak.git
   cd github-streak
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your GitHub token:
   ```env
   GITHUB_TOKEN=your_personal_access_token_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Embedding in your README

*To be configured based on your deployment URL.*

Once deployed, you can add your streak stats to your GitHub README by using an image tag pointing to the API route:

```markdown
[![GitHub Streak](https://your-deployment-url.com/api/streak-image?username=yourusername&theme=default)](https://your-deployment-url.com/)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
