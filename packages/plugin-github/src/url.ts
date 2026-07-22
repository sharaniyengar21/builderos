export function parseGithubRepoUrl(input: string): { owner: string; repo: string } {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");

  const patterns = [
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)$/i,
    /^(?:www\.)?github\.com\/([^/]+)\/([^/]+)$/i,
    /^([^/\s]+)\/([^/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      if (owner && repo) return { owner, repo };
    }
  }

  throw new Error(`Could not parse a GitHub owner/repo from "${input}"`);
}
