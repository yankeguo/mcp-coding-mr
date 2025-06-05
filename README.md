# mcp-coding-mr

A simple MCP server for CODING MR API

## Usage

### Manual Setup

**Command**

```shell
npx @yankeguo/mcp-coding-mr
```

**Environment Variables**

- `CODING_USERNAME`
- `CODING_PASSWORD`

### JSON Config

```json
{
  "mcpServers": {
    "coding-mr": {
      "name": "coding-mr",
      "type": "stdio",
      "command": "npx",
      "args": ["@yankeguo/mcp-coding-mr@latest"],
      "env": {
        "CODING_USERNAME": "xxxxxx",
        "CODING_PASSWORD": "xxxxxx"
      }
    }
  }
}
```

## Credits

GUO YANKE, MIT License
