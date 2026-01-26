# CLAUDE.md - POC Secrets Manager Import UI

## Purpose

This is a **throwaway POC repository** for demonstrating user flows for a secrets import feature. The goal is to mock up a basic webpage showing user paths based on specs to be implemented later.

**No clean code / clean architecture principles required.** This code won't be maintained - it's purely for visualization and validation of user workflows.

## Main File

### `secret-importer.html`

A single-page HTML app that demonstrates a UI for importing secrets from AWS Secrets Manager or AWS Parameter Store into an application.

### Core User Flows

1. **Manual Secret Import**: User adds rows one-by-one, selecting:
   - Secrets Manager (source)
   - Secret Name
   - Import Type (String→ENV, JSON Key→ENV, JSON→File)
   - JSON Key (if applicable)
   - Target Key (env var name or file identifier)
   - File Path (if JSON→File)
   - Scope (PROJECT, ENVIRONMENT, SERVICE)

2. **Bulk Import**: User imports multiple keys from a single JSON secret at once:
   - Select Secrets Manager + Secret
   - Checkbox select which keys to import
   - Auto-generates TARGET_KEY names (uppercase)
   - Already-used target keys are disabled

### Import Types

| Type | Description |
|------|-------------|
| `String → ENV_VAR` | Simple string secret becomes an environment variable |
| `JSON Key → ENV_VAR` | Extract one key from JSON secret, map to env var |
| `JSON → File` | Write entire JSON secret to a file path |

### Mock Data Structure

```javascript
secretsManagers = [
  {
    id: 'sm1',
    name: 'AWS Secrets Manager Prod',
    type: 'aws-secrets-manager',
    arnRole: 'arn:aws:iam::...',
    secrets: [
      { name: '/prod/app1/database', keys: ['host', 'port', ...] },  // JSON secret
      { name: '/prod/app1/redis-url', keys: null }  // String secret
    ]
  }
]
```

### Key Validation Rules

- Target keys must be unique across all rows
- Duplicates are visually highlighted (red border)
- Save is blocked if duplicates exist
- File paths must start with `/`

### UI Components

- Sidebar navigation (only "Import Secrets" active, "Manage Secret Managers" commented out)
- Main table for secret import configurations
- Bulk import modal with checkbox selection
- Secret Manager CRUD modal (partially implemented but commented out in nav)

## Running

Just open `secret-importer.html` in a browser. No build step required.
