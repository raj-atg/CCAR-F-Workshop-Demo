# Running Claude Code through an LLM gateway

Some participants reach Claude Code through a LiteLLM gateway rather than a direct `claude.ai` or Anthropic Console login. This repo works identically either way — nothing in the app or the `.claude/` layer changes. This file is for the gateway path specifically.

**There is no `claude login` step.** If you're on a gateway, forget OAuth entirely — you authenticate with environment variables instead.

## Required environment variables

| Variable | Value | Notes |
| --- | --- | --- |
| `ANTHROPIC_BASE_URL` | Your proxy's URL | e.g. `https://litellm.yourcompany.example` |
| `ANTHROPIC_AUTH_TOKEN` | Your gateway key | **Not** `ANTHROPIC_API_KEY` — see below |
| `ANTHROPIC_API_KEY` | Leave unset | A stray value here makes Claude Code fall back to direct Anthropic auth and silently bypass the proxy — including its billing. |

Set these in your shell profile, your terminal session, or the `env` block of `~/.claude/settings.json` — **not** a project `.env` file. Claude Code does not read `.env` files from the project directory. VS Code users: use the `claude-code.env` setting block instead of a `.env` file.

A skeleton for `~/.claude/settings.json` (or `.claude/settings.local.json` if you want it project-scoped):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-litellm-proxy.example",
    "ANTHROPIC_AUTH_TOKEN": "your-gateway-key"
  }
}
```

This repo's own `.claude/settings.json` intentionally leaves its `env` block absent so direct-login users are unaffected — add the block above to a personal, non-committed settings file instead.

## Model names

`claude --model <name>` must match an alias in the proxy's `model_list`, not the canonical Anthropic model string (`claude-sonnet-5`, etc). Ask your instructor for the actual aliases and fill in the table below before the workshop:

| Anthropic model | Your gateway's alias |
| --- | --- |
| Sonnet 5 | *(fill in)* |
| Opus 4.8 | *(fill in)* |
| Haiku 4.5 | *(fill in)* |

## Pre-flight check

Before opening Claude Code, confirm the proxy itself is reachable so an auth failure surfaces now rather than mid-lab:

```
curl -s -X POST "$ANTHROPIC_BASE_URL/v1/messages" \
  -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"<your-alias>","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'
```

A successful response (even a short one) means auth and routing are both correct.

## MCP interaction

Tool search is disabled by default when `ANTHROPIC_BASE_URL` points at a non-first-party host, since most proxies don't forward `tool_reference` blocks. This means the `inventory` server's tools load upfront in your context instead of being deferred and searched on demand — harmless here since it's only three tools, but worth knowing the behavior differs from the docs' default description. Set `ENABLE_TOOL_SEARCH=true` to force deferred loading if your specific proxy does support it.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Connection refused / timeout | Proxy unreachable — check `ANTHROPIC_BASE_URL` and your network/VPN. |
| 401 / 403 on every request | Token mismatch — confirm `ANTHROPIC_AUTH_TOKEN` matches what the proxy expects, and that `ANTHROPIC_API_KEY` is unset. |
| "model not found" style error | The `--model` value has no matching entry in the proxy's `model_list` — use the alias table above, not the canonical model name. |

## What's unaffected

Everything client-side behaves identically regardless of how you authenticate: CLAUDE.md files, `.claude/rules/`, `@import`, `/memory`, `/compact`, commands, skills, plan mode, `--resume`, `--fork-session`, built-in tools, hooks, agents, and MCP configuration. That's the bulk of this workshop — the gateway only changes how the very first request gets authenticated.
