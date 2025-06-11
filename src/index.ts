import axios from "axios";
import { z } from "zod";

export type MergeRequestRef = {
  team: string;
  proj: string;
  repo: string;
  id: string;
};

export function decodeMergeRequestUrl(url: string): MergeRequestRef | null {
  // Early return for empty/invalid input
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const u = new URL(url);

    // Extract team name from hostname
    const hostParts = u.hostname.split(".");
    const team = hostParts[0];
    if (!team) {
      return null;
    }

    // Use regex to match the expected path pattern more efficiently
    // Pattern: /p/{project_name}/d/{repo_name}/git/merge/{mr_id}
    const pathRegex = /^\/p\/([^\/]+)\/d\/([^\/]+)\/git\/merge\/([^\/]+)$/;
    const match = u.pathname.match(pathRegex);

    if (!match) {
      return null;
    }

    const [, proj, repo, id] = match;

    // Validate that all extracted parts are non-empty
    if (!proj || !repo || !id) {
      return null;
    }

    return {
      team: team,
      proj: proj,
      repo: repo,
      id: id,
    };
  } catch {
    // Return null for any URL parsing errors
    return null;
  }
}
