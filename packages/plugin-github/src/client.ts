export interface GithubRepoSnapshot {
  stars: number;
  forks: number;
  openIssues: number;
  openPrs: number;
  latestRelease: { tag: string; publishedAt: string; url: string } | null;
}

class GithubApiError extends Error {}

export async function verifyRepoAccess(owner: string, repo: string, token: string): Promise<void> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new GithubApiError(`GitHub rejected access to ${owner}/${repo} (HTTP ${response.status})`);
  }
}

const SNAPSHOT_QUERY = `
  query RepoSnapshot($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      stargazerCount
      forkCount
      openIssues: issues(states: OPEN) { totalCount }
      openPrs: pullRequests(states: OPEN) { totalCount }
      latestRelease {
        tagName
        publishedAt
        url
      }
    }
  }
`;

export async function fetchRepoSnapshot(owner: string, repo: string, token: string): Promise<GithubRepoSnapshot> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: SNAPSHOT_QUERY, variables: { owner, repo } }),
  });

  if (!response.ok) {
    throw new GithubApiError(`GitHub GraphQL request failed (HTTP ${response.status})`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new GithubApiError(json.errors[0]?.message ?? "GitHub GraphQL returned an error");
  }

  const repository = json.data?.repository;
  if (!repository) {
    throw new GithubApiError(`Repository ${owner}/${repo} not found`);
  }

  return {
    stars: repository.stargazerCount,
    forks: repository.forkCount,
    openIssues: repository.openIssues.totalCount,
    openPrs: repository.openPrs.totalCount,
    latestRelease: repository.latestRelease
      ? {
          tag: repository.latestRelease.tagName,
          publishedAt: repository.latestRelease.publishedAt,
          url: repository.latestRelease.url,
        }
      : null,
  };
}
