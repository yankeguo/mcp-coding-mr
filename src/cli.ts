#!/usr/bin/env node

import {
  Configuration as CodingConfiguration,
  DefaultApi as CodingAPI,
} from "@yankeguo/coding-node-client";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { decodeMergeRequestUrl } from ".";

const server = new McpServer({
  name: "CODING MR",
  version: "0.1.1",
  description: "A simple MCP server for CODING MR (Merge Request) API",
});

server.tool(
  "coding_mr_describe",
  "Describe a CODING MR (Merge Request)",
  {
    url: z.string().describe("The URL of the CODING MR (Merge Request)"),
  },
  async ({ url }) => {
    const coding = new CodingAPI(
      new CodingConfiguration({
        basePath: "https://e.coding.net/open-api",
        username: process.env.CODING_USERNAME || "",
        password: process.env.CODING_PASSWORD || "",
      }),
    );

    const mrRef = decodeMergeRequestUrl(url);

    if (!mrRef) {
      return {
        isError: true,
        content: [{ type: "text", text: "Invalid URL" }],
      };
    }

    try {
      const mrResp = await coding.describeMergeRequest({
        DepotPath: `${mrRef.team}/${mrRef.proj}/${mrRef.repo}`,
        MergeId: parseInt(mrRef.id),
      });

      const mr = mrResp.data.Response!.MergeRequestInfo!;

      const diffsResp = await coding.describeMergeRequestFileDiff({
        DepotPath: `${mrRef.team}/${mrRef.proj}/${mrRef.repo}`,
        MergeId: parseInt(mrRef.id),
      });

      const diffs = diffsResp.data.Response!.MergeRequestFileDiff!.FileDiffs!;

      const description = `# Merge Request: ${mr.Title}

**Project:** ${mrRef.proj}/${mrRef.repo}
**MR ID:** ${mrRef.id}
**Status:** ${mr.Status}
**Source Branch:** ${mr.SourceBranch}
**Target Branch:** ${mr.TargetBranch}

## Description
${mr.Describe}

## File Changes
${diffs.map((diff) => `- ${diff.ChangeType}: ${diff.Path}`).join("\n")}

**Total files changed:** ${diffs.length}`;

      return {
        content: [{ type: "text", text: description }],
      };
    } catch (e: any) {
      let errorMessage = e.message;

      // Use toJSON() method if available (for AxiosError)
      if (typeof e.toJSON === "function") {
        try {
          const errorJson = e.toJSON();
          errorMessage = JSON.stringify(errorJson, null, 2);
        } catch {
          // Fallback to original message if toJSON fails
          errorMessage = e.message;
        }
      }

      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
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
