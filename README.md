# mcp-coding-mr

A Model Context Protocol (MCP) server that provides integration with CODING.net Merge Request API, enabling AI assistants to interact with and describe merge requests.

## Installation

### Quick Start

```bash
npx @yankeguo/mcp-coding-mr
```

### Configuration

You'll need to provide your CODING.net credentials via environment variables:

- `CODING_USERNAME` - Your CODING.net username
- `CODING_PASSWORD` - Your CODING.net password

### MCP Client Configuration

Add the following configuration to your MCP client:

```json
{
  "mcpServers": {
    "coding-mr": {
      "name": "coding-mr",
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@yankeguo/mcp-coding-mr@latest"],
      "env": {
        "CODING_USERNAME": "your_username",
        "CODING_PASSWORD": "your_password"
      }
    }
  }
}
```

## Available Tools

### `coding_mr_describe`

Fetches and describes a CODING.net Merge Request with comprehensive details.

**Parameters:**

- `url` (string, required): The URL of the Merge Request to describe

**Example Usage:**

```
Describe the merge request at https://your-team.coding.net/p/project/d/repo/git/merge/123
```

## License

MIT License

## Author

GUO YANKE
