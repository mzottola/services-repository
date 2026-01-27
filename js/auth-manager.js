// Authentication CRUD functions

function openAddAuthModal() {
    if (!selectedSmClusterId) {
        alert('Please select a cluster first');
        return;
    }

    editingAuthId = null;
    const cluster = clusters.find(c => c.id === selectedSmClusterId);

    const modal = document.getElementById('secretManagerModal');
    const title = document.getElementById('secretManagerModalTitle');
    const nameInput = document.getElementById('smName');
    const nameSection = document.getElementById('smNameSection');
    const addAuthBtn = document.getElementById('addAuthEntryBtn');

    title.textContent = 'Add Authentication';
    nameInput.value = cluster?.secretManager?.name || cluster.name + ' Secrets';

    // Hide name section if SM already exists
    nameSection.style.display = cluster?.secretManager ? 'none' : 'block';
    // Hide "Add Another" button - user adds one auth at a time
    addAuthBtn.style.display = 'none';

    // Start with one empty auth entry
    currentAuthEntries = [{
        id: `auth_temp_${++authEntryCounter}`,
        type: '',
        authMode: ''
    }];
    renderAuthEntries();
    modal.classList.add('active');
}

function openEditAuthModal(clusterId, authId) {
    editingAuthId = authId;
    const cluster = clusters.find(c => c.id === clusterId);
    const auth = cluster?.secretManager?.authentications?.find(a => a.id === authId);

    if (!auth) {
        alert('Authentication not found');
        return;
    }

    const modal = document.getElementById('secretManagerModal');
    const title = document.getElementById('secretManagerModalTitle');
    const nameSection = document.getElementById('smNameSection');
    const addAuthBtn = document.getElementById('addAuthEntryBtn');

    title.textContent = 'Edit Authentication';
    nameSection.style.display = 'none';
    addAuthBtn.style.display = 'none';

    currentAuthEntries = [{...auth}];
    renderAuthEntries();
    modal.classList.add('active');
}

function deleteAuthentication(clusterId, authId) {
    if (!confirm('Are you sure you want to delete this authentication?')) {
        return;
    }

    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster?.secretManager) {
        cluster.secretManager.authentications = cluster.secretManager.authentications.filter(a => a.id !== authId);
    }

    renderSmClusterContent();
    renderSmClusterList();
}

// Legacy function - kept for compatibility
function openSecretManagerModal(smId = null) {
    openAddAuthModal();
}

function closeSecretManagerModal() {
    const modal = document.getElementById('secretManagerModal');
    modal.classList.remove('active');
    editingAuthId = null;
    currentAuthEntries = [];
    document.getElementById('smName').disabled = false;
}

function addAuthEntry() {
    const newAuth = {
        id: `auth_temp_${++authEntryCounter}`,
        type: '',
        authMode: ''
    };
    currentAuthEntries.push(newAuth);
    renderAuthEntries();
}

function removeAuthEntry(authId) {
    currentAuthEntries = currentAuthEntries.filter(a => a.id !== authId);
    renderAuthEntries();
}

function handleAuthTypeChange(authId, newType) {
    const auth = currentAuthEntries.find(a => a.id === authId);
    if (auth) {
        auth.type = newType;
        auth.authMode = '';
        delete auth.roleArn;
        delete auth.accessKey;
        delete auth.secretKey;
        delete auth.region;
        delete auth.jsonCredentials;
    }
    renderAuthEntries();
}

function handleAuthModeChange(authId, newMode) {
    const auth = currentAuthEntries.find(a => a.id === authId);
    if (auth) {
        auth.authMode = newMode;
        delete auth.roleArn;
        delete auth.accessKey;
        delete auth.secretKey;
        delete auth.region;
        delete auth.jsonCredentials;
    }
    renderAuthEntries();
}

function updateAuthField(authId, field, value) {
    const auth = currentAuthEntries.find(a => a.id === authId);
    if (auth) {
        auth[field] = value;
    }
    validateAuthWarning();
}

function validateAuthWarning() {
    const autoProviders = new Set();
    currentAuthEntries.forEach(a => {
        if (a.authMode === 'auto' && a.type) {
            const provider = getCloudProvider(a.type);
            if (provider) autoProviders.add(provider);
        }
    });

    const warning = document.getElementById('authWarning');
    if (autoProviders.size > 1) {
        warning.classList.add('show');
    } else {
        warning.classList.remove('show');
    }
}

function renderAuthEntries() {
    const container = document.getElementById('authEntriesContainer');

    if (currentAuthEntries.length === 0) {
        container.innerHTML = '<div class="no-auth-message">Configure authentication details below.</div>';
        validateAuthWarning();
        return;
    }

    container.innerHTML = currentAuthEntries.map((auth, index) => {
        const typeOptions = [
            { value: '', label: 'Select Type' },
            { value: 'aws-secrets-manager', label: 'AWS Secrets Manager' },
            { value: 'aws-parameter-store', label: 'AWS Parameter Store' },
            { value: 'gcp-secret-manager', label: 'GCP Secret Manager' }
        ];

        const authModeOptions = getAuthModeOptions(auth.type);

        let additionalFields = '';

        if (auth.authMode === 'role-arn') {
            additionalFields = `
                <div class="auth-entry-row">
                    <div class="auth-entry-field full-width">
                        <label>ARN Role</label>
                        <input type="text"
                            value="${auth.roleArn || ''}"
                            placeholder="arn:aws:iam::123456789012:role/MyRole"
                            onchange="updateAuthField('${auth.id}', 'roleArn', this.value)">
                    </div>
                </div>
            `;
        } else if (auth.authMode === 'static-credentials') {
            additionalFields = `
                <div class="auth-entry-row">
                    <div class="auth-entry-field">
                        <label>Access Key</label>
                        <input type="text"
                            value="${auth.accessKey || ''}"
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            onchange="updateAuthField('${auth.id}', 'accessKey', this.value)">
                    </div>
                    <div class="auth-entry-field">
                        <label>Region</label>
                        <input type="text"
                            value="${auth.region || ''}"
                            placeholder="us-east-1"
                            onchange="updateAuthField('${auth.id}', 'region', this.value)">
                    </div>
                </div>
                <div class="auth-entry-row">
                    <div class="auth-entry-field full-width">
                        <label>Secret Key</label>
                        <input type="password"
                            value="${auth.secretKey || ''}"
                            placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                            onchange="updateAuthField('${auth.id}', 'secretKey', this.value)">
                    </div>
                </div>
            `;
        } else if (auth.authMode === 'json-credentials') {
            additionalFields = `
                <div class="auth-entry-row">
                    <div class="auth-entry-field full-width">
                        <label>JSON Credentials</label>
                        <textarea
                            placeholder='{"type": "service_account", "project_id": "my-project", ...}'
                            onchange="updateAuthField('${auth.id}', 'jsonCredentials', this.value)">${auth.jsonCredentials || ''}</textarea>
                    </div>
                </div>
            `;
        }

        const showDeleteBtn = currentAuthEntries.length > 1;

        return `
            <div class="auth-entry" data-auth-id="${auth.id}">
                <div class="auth-entry-header">
                    <span class="auth-entry-title">${currentAuthEntries.length === 1 ? 'Authentication' : 'Authentication ' + (index + 1)}</span>
                    <button type="button" class="auth-entry-delete" onclick="removeAuthEntry('${auth.id}')" title="Remove" style="${showDeleteBtn ? '' : 'display: none;'}">
                        &times;
                    </button>
                </div>
                <div class="auth-entry-row">
                    <div class="auth-entry-field">
                        <label>Type</label>
                        <select onchange="handleAuthTypeChange('${auth.id}', this.value)">
                            ${typeOptions.map(opt => `<option value="${opt.value}" ${auth.type === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="auth-entry-field">
                        <label>Auth Mode</label>
                        <select onchange="handleAuthModeChange('${auth.id}', this.value)" ${!auth.type ? 'disabled' : ''}>
                            ${authModeOptions.map(opt => `<option value="${opt.value}" ${auth.authMode === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                ${additionalFields}
            </div>
        `;
    }).join('');

    validateAuthWarning();
}

function saveSecretManager() {
    const nameInput = document.getElementById('smName');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter a name for the Secret Manager');
        return;
    }

    if (currentAuthEntries.length === 0) {
        alert('Please add at least one authentication');
        return;
    }

    for (const auth of currentAuthEntries) {
        if (!auth.type) {
            alert('Please select a type for all authentications');
            return;
        }
        if (!auth.authMode) {
            alert('Please select an auth mode for all authentications');
            return;
        }
        if (auth.authMode === 'role-arn' && !auth.roleArn) {
            alert('Please enter an ARN Role for Role ARN authentication');
            return;
        }
        if (auth.authMode === 'static-credentials') {
            if (!auth.accessKey || !auth.secretKey || !auth.region) {
                alert('Please fill in all fields for Static Credentials authentication');
                return;
            }
        }
        if (auth.authMode === 'json-credentials' && !auth.jsonCredentials) {
            alert('Please enter JSON credentials for GCP authentication');
            return;
        }
    }

    const autoProviders = new Set();
    currentAuthEntries.forEach(a => {
        if (a.authMode === 'auto' && a.type) {
            const provider = getCloudProvider(a.type);
            if (provider) autoProviders.add(provider);
        }
    });
    if (autoProviders.size > 1) {
        alert('"Automatically Generated" uses the cluster\'s cloud account. You cannot mix AWS and GCP with automatic authentication.');
        return;
    }

    const cluster = clusters.find(c => c.id === selectedSmClusterId);
    if (!cluster) {
        alert('Please select a cluster first');
        return;
    }

    if (!cluster.secretManager) {
        cluster.secretManager = {
            id: `sm_${cluster.id}`,
            name: name,
            authentications: []
        };
    }

    if (editingAuthId) {
        const authIndex = cluster.secretManager.authentications.findIndex(a => a.id === editingAuthId);
        if (authIndex > -1) {
            cluster.secretManager.authentications[authIndex] = {
                ...currentAuthEntries[0],
                secrets: cluster.secretManager.authentications[authIndex].secrets || []
            };
        }
    } else {
        currentAuthEntries.forEach(auth => {
            cluster.secretManager.authentications.push({
                ...auth,
                id: `auth${++authEntryCounter}`,
                secrets: []
            });
        });
    }

    closeSecretManagerModal();
    renderSmClusterContent();
    renderSmClusterList();
    updateBulkModalSecretsManagers();
}

// Legacy function - no longer used
function deleteSecretManager(smId) {
    console.log('deleteSecretManager called - deprecated');
}

// DEPRECATED: renderSecretManagersTable
function renderSecretManagersTable() {
    console.log('renderSecretManagersTable called - deprecated, use renderSmClusterContent');
}
