import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
  name: "CODING MR",
  version: "0.1.0",
  description: "A simple MCP server for CODING MR (Merge Request) API",
});

async function codingInvoke(action: string, body: any) {
  const { data } = await axios.post("https://e.coding.net/open-api/", body, {
    params: { action },
    auth: {
      username: process.env.CODING_USERNAME || "",
      password: process.env.CODING_PASSWORD || "",
    },
  });
  return data;
}

async function codingDescribeMRFileDiffs(
  project_name: string,
  repo_name: string,
  mr_id: string,
) {
  const { Response: res } = z
    .object({
      Response: z.object({
        MergeRequestFileDiff: z.object({
          FileDiffs: z.array(
            z.object({
              ChangeType: z.string(),
              Path: z.string(),
            }),
          ),
        }),
      }),
    })
    .parse(
      await codingInvoke("DescribeMergeRequestFileDiff", {
        DepotPath: `${project_name}/${repo_name}`,
        MergeId: mr_id,
      }),
    );
  return res.MergeRequestFileDiff;
}

async function codingDescribeMR(
  project_name: string,
  repo_name: string,
  mr_id: string,
) {
  const { Response: res } = z
    .object({
      Response: z.object({
        MergeReqInfo: z.object({
          Title: z.string(),
          SourceBranch: z.string(),
          TargetBranch: z.string(),
          Describe: z.string(),
          Status: z.string(),
        }),
      }),
    })
    .parse(
      await codingInvoke("DescribeMergeReqInfo", {
        DepotPath: `${project_name}/${repo_name}`,
        MergeId: mr_id,
      }),
    );
  return res.MergeReqInfo;
}

server.resource(
  "coding_mr",
  new ResourceTemplate("coding_mr://{project_name}/{repo_name}/{mr_id}", {
    list: undefined,
  }),
  async (uri, { project_name, repo_name, mr_id }) => {
    const mr = await codingDescribeMR(
      project_name as string,
      repo_name as string,
      mr_id as string,
    );
    const fileDiffs = await codingDescribeMRFileDiffs(
      project_name as string,
      repo_name as string,
      mr_id as string,
    );

    const description = `# Merge Request: ${mr.Title}

**Project:** ${project_name}/${repo_name}
**MR ID:** ${mr_id}
**Status:** ${mr.Status}
**Source Branch:** ${mr.SourceBranch}
**Target Branch:** ${mr.TargetBranch}

## Description
${mr.Describe}

## File Changes
${fileDiffs.FileDiffs.map((diff) => `- ${diff.ChangeType}: ${diff.Path}`).join("\n")}

**Total files changed:** ${fileDiffs.FileDiffs.length}`;

    return {
      contents: [
        {
          uri: uri.href,
          text: description,
        },
      ],
    };
  },
);

// Start receiving messages on stdin and sending messages on stdout
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
