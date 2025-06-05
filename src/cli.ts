import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  codingDecodeMergeRequestUrl,
  codingDescribeMR,
  codingDescribeMRFileDiffs,
} from ".";

const server = new McpServer({
  name: "CODING MR",
  version: "0.1.0",
  description: "A simple MCP server for CODING MR (Merge Request) API",
});

server.tool(
  "coding_mr_describe",
  "Describe a CODING MR (Merge Request)",
  {
    url: z.string().describe("The URL of the CODING MR (Merge Request)"),
  },
  async ({ url }) => {
    const mrRef = codingDecodeMergeRequestUrl(url);

    if (!mrRef) {
      return {
        isError: true,
        content: [{ type: "text", text: "Invalid URL" }],
      };
    }

    try {
      const mr = await codingDescribeMR(mrRef);
      const fileDiffs = await codingDescribeMRFileDiffs(mrRef);

      const description = `# Merge Request: ${mr.Title}

**Project:** ${mrRef.proj}/${mrRef.repo}
**MR ID:** ${mrRef.id}
**Status:** ${mr.Status}
**Source Branch:** ${mr.SourceBranch}
**Target Branch:** ${mr.TargetBranch}

## Description
${mr.Describe}

## File Changes
${fileDiffs.FileDiffs.map((diff) => `- ${diff.ChangeType}: ${diff.Path}`).join("\n")}

**Total files changed:** ${fileDiffs.FileDiffs.length}`;

      return {
        content: [{ type: "text", text: description }],
      };
    } catch (e: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${e.message}` }],
      };
    }
  },
);

// Start receiving messages on stdin and sending messages on stdout
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
