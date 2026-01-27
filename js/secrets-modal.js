// Secrets Tree Modal Functions

function openAuthSecretsModal(clusterId, authId) {
    const cluster = clusters.find(c => c.id === clusterId);
    const auth = cluster?.secretManager?.authentications?.find(a => a.id === authId);

    if (!auth) {
        alert('Authentication not found');
        return;
    }

    const modal = document.getElementById('secretsTreeModal');
    const title = document.getElementById('secretsTreeModalTitle');
    const container = document.getElementById('secretsTreeContainer');

    const typeName = auth.type === 'aws-secrets-manager' ? 'AWS Secrets Manager' :
                     auth.type === 'aws-parameter-store' ? 'AWS Parameter Store' : 'GCP Secret Manager';

    title.textContent = `Secrets - ${cluster.secretManager?.name || 'Secret Manager'} (${typeName})`;
    container.innerHTML = renderSecretsTree(auth.secrets || []);
    modal.classList.add('active');
}

// Legacy function
function openSecretsTreeModal(smId) {
    console.log('openSecretsTreeModal called - use openAuthSecretsModal instead');
}

function closeSecretsTreeModal() {
    const modal = document.getElementById('secretsTreeModal');
    modal.classList.remove('active');
}

function renderSecretsTree(secrets) {
    if (!secrets || secrets.length === 0) {
        return '<div class="tree-empty">No secrets available in this Secret Manager</div>';
    }

    let html = '';
    secrets.forEach((secret, index) => {
        const isJson = secret.keys !== null && Array.isArray(secret.keys);
        const nodeId = `secret-node-${index}`;

        if (isJson) {
            html += `
                <div class="tree-node">
                    <div class="tree-node-header" onclick="toggleTreeNode('${nodeId}')">
                        <span class="tree-toggle" id="toggle-${nodeId}">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </span>
                        <span class="tree-icon json">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h8M8 8h4"></path>
                            </svg>
                        </span>
                        <span class="tree-label">${secret.name}</span>
                        <span class="tree-badge json">JSON (${secret.keys.length} keys)</span>
                    </div>
                    <div class="tree-children" id="children-${nodeId}">
                        ${renderTreeKeys(secret.keys)}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="tree-node">
                    <div class="tree-node-header" style="cursor: default;">
                        <span class="tree-toggle hidden">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </span>
                        <span class="tree-icon string">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                            </svg>
                        </span>
                        <span class="tree-label">${secret.name}</span>
                        <span class="tree-badge string">String</span>
                    </div>
                </div>
            `;
        }
    });

    return html;
}

function renderTreeKeys(keys) {
    if (!keys || keys.length === 0) {
        return '<div class="tree-empty">No keys</div>';
    }

    let html = '';
    keys.forEach(key => {
        html += `
            <div class="tree-leaf">
                <span class="tree-icon key">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                </span>
                <span class="tree-key-name">${key}</span>
            </div>
        `;
    });

    return html;
}

function toggleTreeNode(nodeId) {
    const toggle = document.getElementById(`toggle-${nodeId}`);
    const children = document.getElementById(`children-${nodeId}`);
    const header = toggle.closest('.tree-node-header');

    toggle.classList.toggle('expanded');
    children.classList.toggle('expanded');
    header.classList.toggle('expanded');
}
