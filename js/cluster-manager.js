// Cluster management functions

// SM View - Cluster List Rendering
function renderSmClusterList() {
    const container = document.getElementById('smClusterList');
    container.innerHTML = clusters.map(cluster => {
        const authCount = cluster.secretManager?.authentications?.length || 0;
        return `
            <div class="cluster-item ${selectedSmClusterId === cluster.id ? 'active' : ''}"
                 onclick="selectSmCluster('${cluster.id}')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                </svg>
                <span>${cluster.name}</span>
                <span class="cluster-sm-count">${authCount} auth${authCount !== 1 ? 's' : ''}</span>
            </div>
        `;
    }).join('');
}

function selectSmCluster(clusterId) {
    selectedSmClusterId = clusterId;
    renderSmClusterList();
    renderSmClusterContent();
}

function renderSmClusterContent() {
    const container = document.getElementById('smClusterContent');
    const cluster = clusters.find(c => c.id === selectedSmClusterId);

    if (!cluster) {
        container.innerHTML = `
            <div class="no-clusters-selected">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p>Select a cluster from the left to configure its authentications</p>
            </div>
        `;
        return;
    }

    const sm = cluster.secretManager;
    const authCards = (sm?.authentications || []).map(auth => {
        const typeName = auth.type === 'aws-secrets-manager' ? 'AWS Secrets Manager' :
                         auth.type === 'aws-parameter-store' ? 'AWS Parameter Store' : 'GCP Secret Manager';
        const modeName = auth.authMode === 'auto' ? 'Automatically Generated' :
                         auth.authMode === 'role-arn' ? 'Role ARN' :
                         auth.authMode === 'static-credentials' ? 'Static Credentials' : 'JSON Credentials';

        return `
            <div class="auth-card">
                <div class="auth-card-header">
                    <div class="auth-card-info">
                        <span class="auth-card-type">${typeName}</span>
                        <span class="auth-card-mode">${modeName}</span>
                    </div>
                    <div class="auth-card-actions">
                        <button class="auth-card-btn show-secrets" onclick="openAuthSecretsModal('${cluster.id}', '${auth.id}')">
                            Show Secrets
                        </button>
                        <button class="auth-card-btn" onclick="openEditAuthModal('${cluster.id}', '${auth.id}')">
                            Edit
                        </button>
                        <button class="auth-card-btn delete" onclick="deleteAuthentication('${cluster.id}', '${auth.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="cluster-content-card">
            <div class="cluster-header">
                <h3>${cluster.name}</h3>
                <span style="font-size: 14px; color: #718096;">${sm?.name || 'Secret Manager'}</span>
            </div>
            <div class="cluster-body">
                <button class="configure-sm-btn" onclick="openAddAuthModal()">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Authentication
                </button>

                ${authCards ? `
                    <div class="sm-cards-container">
                        ${authCards}
                    </div>
                ` : `
                    <div class="no-sm-message">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        <p>No authentications configured for this cluster yet.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Link Clusters View Functions
function renderClusterList() {
    const container = document.getElementById('clusterList');
    container.innerHTML = '';

    clusters.forEach(cluster => {
        const div = document.createElement('div');
        div.className = `cluster-item ${selectedClusterId === cluster.id ? 'active' : ''}`;
        div.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
            </svg>
            ${cluster.name}
        `;
        div.addEventListener('click', () => selectCluster(cluster.id));
        container.appendChild(div);
    });
}

function selectCluster(clusterId) {
    selectedClusterId = clusterId;
    renderClusterList();
    renderClusterContent();
}

function renderClusterContent() {
    const container = document.getElementById('clusterContent');
    const cluster = clusters.find(c => c.id === selectedClusterId);

    if (!cluster) {
        container.innerHTML = `
            <div class="no-clusters-selected">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p>Select a cluster from the left to manage its linked Secret Managers</p>
            </div>
        `;
        return;
    }

    let tableContent = '';
    if (cluster.linkedSecretManagers.length === 0) {
        tableContent = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #a0aec0;">
                    No Secret Managers linked to this cluster yet.
                </td>
            </tr>
        `;
    } else {
        cluster.linkedSecretManagers.forEach(link => {
            const sm = findSecretManager(link.secretManagerId)?.sm;
            if (sm) {
                const authBadges = (sm.authentications || []).map(auth => {
                    let badgeClass = '';
                    let label = '';
                    if (auth.type === 'aws-secrets-manager') {
                        badgeClass = 'aws-sm';
                        label = 'AWS SM';
                    } else if (auth.type === 'aws-parameter-store') {
                        badgeClass = 'aws-ps';
                        label = 'AWS PS';
                    } else if (auth.type === 'gcp-secret-manager') {
                        badgeClass = 'gcp';
                        label = 'GCP';
                    }
                    if (auth.authMode === 'auto') {
                        badgeClass += ' auto';
                        label += ' (auto)';
                    }
                    return `<span class="auth-type-badge ${badgeClass}">${label}</span>`;
                }).join('');
                const authDisplay = authBadges || '<span style="color: #a0aec0;">-</span>';
                const servicesUsed = link.servicesUsed || 0;
                const isDisabled = servicesUsed > 0;
                tableContent += `
                    <tr>
                        <td><strong>${sm.name}</strong></td>
                        <td>${authDisplay}</td>
                        <td>${servicesUsed}</td>
                        <td>
                            <button class="unlink-btn" onclick="unlinkSecretManager('${cluster.id}', '${sm.id}')" ${isDisabled ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Unlink</button>
                        </td>
                    </tr>
                `;
            }
        });
    }

    container.innerHTML = `
        <div class="cluster-content-card">
            <div class="cluster-header">
                <h3>${cluster.name}</h3>
                <button class="link-sm-btn" onclick="openLinkSmModal()">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Link Secret Manager
                </button>
            </div>
            <div class="cluster-body">
                <table class="linked-sm-table">
                    <thead>
                        <tr>
                            <th>Secret Manager</th>
                            <th>Authentications</th>
                            <th>Services Used</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Link SM Modal Functions
function openLinkSmModal() {
    const modal = document.getElementById('linkSmModal');
    const select = document.getElementById('linkSmSelect');

    const cluster = clusters.find(c => c.id === selectedClusterId);
    const linkedIds = cluster ? cluster.linkedSecretManagers.map(l => l.secretManagerId) : [];

    select.innerHTML = '<option value="">Select Secret Manager</option>';
    getAllSecretManagers().forEach(sm => {
        if (!linkedIds.includes(sm.id)) {
            const option = document.createElement('option');
            option.value = sm.id;
            option.textContent = sm.name;
            select.appendChild(option);
        }
    });

    modal.classList.add('active');
}

function closeLinkSmModal() {
    const modal = document.getElementById('linkSmModal');
    modal.classList.remove('active');
}

function confirmLinkSm() {
    const select = document.getElementById('linkSmSelect');
    const smId = select.value;

    if (!smId) {
        alert('Please select a Secret Manager');
        return;
    }

    const cluster = clusters.find(c => c.id === selectedClusterId);
    if (cluster) {
        cluster.linkedSecretManagers.push({
            secretManagerId: smId,
            servicesUsed: 0
        });
    }

    closeLinkSmModal();
    renderClusterContent();
}

function unlinkSecretManager(clusterId, smId) {
    if (confirm('Are you sure you want to unlink this Secret Manager from the cluster?')) {
        const cluster = clusters.find(c => c.id === clusterId);
        if (cluster) {
            cluster.linkedSecretManagers = cluster.linkedSecretManagers.filter(
                l => l.secretManagerId !== smId
            );
            renderClusterContent();
        }
    }
}
