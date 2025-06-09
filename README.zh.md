# mcp-coding-mr

一个模型上下文协议（MCP）服务器，提供与 CODING.net 合并请求 API 的集成，使 AI 助手能够交互并描述合并请求。

## 安装

### 快速开始

```bash
npx @yankeguo/mcp-coding-mr
```

### 配置

您需要通过环境变量提供您的 CODING.net 凭据：

- `CODING_USERNAME` - 您的 CODING.net 用户名
- `CODING_PASSWORD` - 您的 CODING.net 密码

### MCP 客户端配置

将以下配置添加到您的 MCP 客户端：

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

## 可用工具

### `coding_mr_describe`

获取并描述 CODING.net 合并请求的详细信息。

**参数：**

- `url`（字符串，必需）：要描述的合并请求的 URL

**使用示例：**

```
描述位于 https://your-team.coding.net/p/project/d/repo/git/merge/123 的合并请求
```

## 许可证

MIT 许可证

## 作者

GUO YANKE
