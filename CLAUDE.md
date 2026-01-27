# CLAUDE.md - POC Secrets Manager Import UI

## Purpose

This is a **throwaway POC repository** for demonstrating user flows for a secrets import feature. The goal is to mock up a basic webpage showing user paths based on specs to be implemented later.

**No clean code / clean architecture principles required.** This code won't be maintained - it's purely for visualization and validation of user workflows.

## Running

Open `index.html` in a browser. No build step required.

> Legacy: `secret-importer.html` contains the original single-file version (kept for reference).

---

## Project Structure

```
/
├── index.html              # Main HTML structure (views, modals, no logic)
├── css/
│   ├── base.css            # Reset, typography, view sections, empty states
│   ├── layout.css          # Sidebar, main wrapper, content cards, responsive
│   ├── components.css      # Buttons, forms, tables, badges, checkboxes
│   ├── modals.css          # Modal overlay, header/body/footer, bulk tables
│   ├── cluster.css         # Cluster layout, sidebar list, tree view
│   └── auth.css            # Authentication entries, cards, warnings
└── js/
    ├── data.js             # Mock data + global state variables
    ├── utils.js            # Pure helper functions (no DOM manipulation)
    ├── views.js            # View switching logic (showView)
    ├── cluster-manager.js  # Cluster list rendering, link SM modal
    ├── auth-manager.js     # Authentication CRUD (add/edit/delete/save)
    ├── secrets-modal.js    # Secrets tree modal (show secrets per auth)
    └── import-secrets.js   # Import table, bulk import modals, validation
```

---

## File Responsibilities

### HTML (`index.html`)

Contains only:
- Sidebar menu structure
- View sections (empty-state, import-secrets, manage-secret-managers, link-clusters)
- Modal HTML templates
- CSS/JS file imports (order matters for JS)

### CSS Files

| File | Responsibility |
|------|----------------|
| `base.css` | Reset, body, `.view-section`, empty states, validation errors |
| `layout.css` | `.sidebar`, `.main-wrapper`, `.content-card`, `.header`, `.actions`, responsive breakpoints |
| `components.css` | Form elements, tables, all button types, badges, checkboxes |
| `modals.css` | `.modal-overlay`, `.modal`, `.modal-header/body/footer`, `.bulk-table` |
| `cluster.css` | `.cluster-layout`, `.cluster-item`, `.tree-*` classes |
| `auth.css` | `.auth-entry`, `.auth-card`, `.auth-warning`, `.sm-card`, `.configure-sm-btn` |

### JavaScript Files

| File | Responsibility | Key Functions |
|------|----------------|---------------|
| `data.js` | Mock data, global state | `clusters[]`, `selectedSmClusterId`, `currentAuthEntries[]`, etc. |
| `utils.js` | Pure helpers (no DOM) | `getAllSecretManagers()`, `findSecretManager()`, `getSecretsForSM()`, `getCloudProvider()`, `getAuthModeOptions()` |
| `views.js` | View switching | `showView(viewId)` |
| `cluster-manager.js` | Cluster UI | `renderSmClusterList()`, `renderSmClusterContent()`, `selectSmCluster()`, link modal functions |
| `auth-manager.js` | Auth CRUD | `openAddAuthModal()`, `openEditAuthModal()`, `deleteAuthentication()`, `saveSecretManager()`, `renderAuthEntries()` |
| `secrets-modal.js` | Secrets tree | `openAuthSecretsModal()`, `renderSecretsTree()`, `toggleTreeNode()` |
| `import-secrets.js` | Import table | `addRow()`, `handleSecretsManagerChange()`, `validateTargetKeys()`, bulk import functions, `save()` |

---

## Data Model

### Cluster Structure (ONE cluster = ONE Secret Manager)

```javascript
const clusters = [
    {
        id: 'cluster-prod',
        name: 'Cluster Prod',
        secretManager: {                    // Single object, NOT array
            id: 'sm1',
            name: 'Production Secrets',
            authentications: [              // Multiple auth methods per SM
                {
                    id: 'auth1',
                    type: 'aws-secrets-manager',  // or 'aws-parameter-store', 'gcp-secret-manager'
                    authMode: 'role-arn',         // or 'auto', 'static-credentials', 'json-credentials'
                    roleArn: 'arn:aws:iam::...',  // type-specific fields
                    secrets: [                    // Secrets stored per authentication
                        { name: '/prod/app/db', keys: ['host', 'port'] },  // JSON secret
                        { name: '/prod/app/api-key', keys: null }          // String secret
                    ]
                }
            ]
        }
    }
];
```

### Authentication Types & Modes

| Type | Auth Modes | Additional Fields |
|------|------------|-------------------|
| `aws-secrets-manager` | `auto`, `role-arn`, `static-credentials` | `roleArn` or `accessKey`/`secretKey`/`region` |
| `aws-parameter-store` | `auto`, `role-arn`, `static-credentials` | Same as above |
| `gcp-secret-manager` | `auto`, `json-credentials` | `jsonCredentials` (textarea) |

### Validation Rules

- **"Auto" auth constraint**: Can use "Automatically Generated" for multiple AWS types (same cloud), but NOT AWS + GCP together
- **Target keys**: Must be unique across all import rows
- **File paths**: Must start with `/`

---

## Core User Flows

### 1. Manage Secret Managers (per Cluster)

1. User clicks "Manage Secret Managers" in sidebar
2. Cluster list appears on left
3. User selects a cluster → shows its authentications
4. User clicks "Add Authentication" → modal opens
5. User selects Type + Auth Mode → additional fields appear
6. Save adds the auth to the cluster's single Secret Manager

### 2. Import Secrets

1. User clicks "Import Secrets" in sidebar
2. Can add rows manually OR use bulk import
3. **Manual**: Select SM → Secret → Import Type → Target Key
4. **Bulk JSON Keys**: Select SM → JSON Secret → checkbox keys to import
5. **Bulk Raw-Text**: Select SM → checkbox all secrets to import as env vars or files

### 3. Show Secrets (per Authentication)

1. In Manage Secret Managers view, each auth card has "Show Secrets" button
2. Opens tree modal showing secrets for that specific authentication
3. JSON secrets are expandable to show keys

---

## Making Changes

### Adding a New Cloud Provider

1. **`js/data.js`**: Add sample data with new type
2. **`js/utils.js`**: Update `getCloudProvider()` and `getAuthModeOptions()`
3. **`js/auth-manager.js`**: Add fields in `renderAuthEntries()` for new auth modes
4. **`css/auth.css`**: Add `.auth-type-badge.new-provider` style

### Adding a New View

1. **`index.html`**: Add `<div id="new-view" class="view-section">` and menu item
2. **`js/views.js`**: Add case in `showView()` function
3. **Create new JS file** if logic is substantial, add to `index.html` imports

### Modifying Modal Behavior

- Modal HTML templates are in `index.html`
- Open/close/save logic is in the relevant JS file (e.g., `auth-manager.js` for auth modal)
- Modal styles are in `css/modals.css`

### Styling Changes

- Component-level styles → `css/components.css`
- Layout changes → `css/layout.css`
- Modal appearance → `css/modals.css`
- Cluster/tree specific → `css/cluster.css`
- Auth cards/entries → `css/auth.css`

---

## Global State Variables (`js/data.js`)

| Variable | Purpose |
|----------|---------|
| `clusters` | Main data store |
| `selectedClusterId` | Currently selected cluster in link-clusters view |
| `selectedSmClusterId` | Currently selected cluster in manage-SM view |
| `rowCounter` | Auto-increment for import table row IDs |
| `importConfigs` | Stores config data for each import row |
| `authEntryCounter` | Auto-increment for auth entry IDs |
| `editingAuthId` | ID of auth being edited (null if adding new) |
| `currentAuthEntries` | Temp storage for auth entries in modal |

---

## Import Order (JS files)

The order in `index.html` matters due to dependencies:

1. `data.js` - Defines `clusters` and state variables
2. `utils.js` - Helper functions used by other files
3. `views.js` - View switching (uses renderSmClusterList from cluster-manager)
4. `cluster-manager.js` - Uses utils functions
5. `auth-manager.js` - Uses utils, updates cluster-manager views
6. `secrets-modal.js` - Uses utils
7. `import-secrets.js` - Uses utils, runs DOMContentLoaded init
