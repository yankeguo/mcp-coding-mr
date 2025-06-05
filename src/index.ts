import axios from "axios";
import { z } from "zod";

export type MergeRequestRef = {
  team: string;
  proj: string;
  repo: string;
  id: string;
};

export function codingDecodeMergeRequestUrl(
  url: string,
): MergeRequestRef | null {
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

export async function codingInvoke(action: string, body: any) {
  const res = await axios.post("https://e.coding.net/open-api/", body, {
    params: { action },
    auth: {
      username: process.env.CODING_USERNAME || "",
      password: process.env.CODING_PASSWORD || "",
    },
  });
  if (!res.data) {
    throw new Error(
      `CODING Error: No Response: ${res.status} ${res.statusText}`,
    );
  }
  if (!res.data.Response) {
    throw new Error(
      `CODING Error: No Response: ${res.status} ${res.statusText} ${JSON.stringify(res.data, null, 2)}`,
    );
  }
  if (res.data.Response && res.data.Response.Error) {
    throw new Error(
      `CODING Error: ${res.data.Response.Error.Code} ${res.data.Response.Error.Message}`,
    );
  }
  return res.data.Response;
}

export async function codingDescribeMRFileDiffs({
  team,
  proj,
  repo,
  id,
}: MergeRequestRef) {
  const res = z
    .object({
      MergeRequestFileDiff: z.object({
        FileDiffs: z.array(
          z.object({
            ChangeType: z.string(),
            Path: z.string(),
          }),
        ),
      }),
    })
    .parse(
      await codingInvoke("DescribeMergeRequestFileDiff", {
        DepotPath: `${team}/${proj}/${repo}`,
        MergeId: id,
      }),
    );
  return res.MergeRequestFileDiff;
}

export async function codingDescribeMR({
  team,
  proj,
  repo,
  id,
}: MergeRequestRef) {
  const res = z
    .object({
      MergeRequestInfo: z.object({
        Title: z.string(),
        SourceBranch: z.string(),
        TargetBranch: z.string(),
        Describe: z.string(),
        Status: z.string(),
      }),
    })
    .parse(
      await codingInvoke("DescribeMergeRequest", {
        DepotPath: `${team}/${proj}/${repo}`,
        MergeId: id,
      }),
    );
  return res.MergeRequestInfo;
}
