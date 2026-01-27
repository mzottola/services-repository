// Utility helper functions

// Get all secret managers across all clusters (for dropdowns etc.)
function getAllSecretManagers() {
    const allSMs = [];
    clusters.forEach(cluster => {
        if (cluster.secretManager) {
            allSMs.push({
                ...cluster.secretManager,
                clusterId: cluster.id,
                clusterName: cluster.name
            });
        }
    });
    return allSMs;
}

// Find a secret manager by ID across all clusters
function findSecretManager(smId) {
    for (const cluster of clusters) {
        if (cluster.secretManager && cluster.secretManager.id === smId) {
            return { sm: cluster.secretManager, cluster };
        }
    }
    return null;
}

// Get all secrets for a secret manager (across all authentications)
function getSecretsForSM(sm) {
    const allSecrets = [];
    (sm.authentications || []).forEach(auth => {
        (auth.secrets || []).forEach(secret => {
            allSecrets.push({
                ...secret,
                authId: auth.id,
                authType: auth.type
            });
        });
    });
    return allSecrets;
}

// Get cloud provider from type
function getCloudProvider(type) {
    if (type === 'aws-secrets-manager' || type === 'aws-parameter-store') {
        return 'aws';
    } else if (type === 'gcp-secret-manager') {
        return 'gcp';
    }
    return null;
}

// Get auth mode options based on type
function getAuthModeOptions(type) {
    if (type === 'aws-secrets-manager' || type === 'aws-parameter-store') {
        return [
            { value: '', label: 'Select Auth Mode' },
            { value: 'auto', label: 'Automatically Generated (Cluster Account)' },
            { value: 'role-arn', label: 'Role ARN' },
            { value: 'static-credentials', label: 'Static Credentials' }
        ];
    } else if (type === 'gcp-secret-manager') {
        return [
            { value: '', label: 'Select Auth Mode' },
            { value: 'auto', label: 'Automatically Generated (Cluster Account)' },
            { value: 'json-credentials', label: 'JSON Credentials File' }
        ];
    }
    return [{ value: '', label: 'Select type first' }];
}

// Format refresh interval for display
function formatRefreshInterval(interval) {
    const labels = {
        '1min': '1 minute',
        '5min': '5 minutes',
        '15min': '15 minutes',
        '30min': '30 minutes',
        '1h': '1 hour',
        '2h': '2 hours',
        '4h': '4 hours',
        '8h': '8 hours',
        '24h': '24 hours'
    };
    return labels[interval] || interval;
}

// Generate target key from secret name
function generateTargetKeyFromSecretName(secretName) {
    const parts = secretName.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.toUpperCase().replace(/-/g, '_');
}

// Get all authentications from the Staging cluster (for import secrets view)
function getStagingAuthentications() {
    const stagingCluster = clusters.find(c => c.id === 'cluster-staging');
    if (!stagingCluster || !stagingCluster.secretManager) {
        return [];
    }
    return (stagingCluster.secretManager.authentications || []).map(auth => ({
        ...auth,
        clusterId: stagingCluster.id,
        clusterName: stagingCluster.name
    }));
}

// Get secrets for a specific authentication
function getSecretsForAuth(authId) {
    for (const cluster of clusters) {
        if (cluster.secretManager && cluster.secretManager.authentications) {
            const auth = cluster.secretManager.authentications.find(a => a.id === authId);
            if (auth) {
                return auth.secrets || [];
            }
        }
    }
    return [];
}

// Find authentication by ID
function findAuthentication(authId) {
    for (const cluster of clusters) {
        if (cluster.secretManager && cluster.secretManager.authentications) {
            const auth = cluster.secretManager.authentications.find(a => a.id === authId);
            if (auth) {
                return { auth, cluster };
            }
        }
    }
    return null;
}

// Get authentication display name
function getAuthDisplayName(auth) {
    const typeLabels = {
        'aws-secrets-manager': 'AWS Secrets Manager',
        'aws-parameter-store': 'AWS Parameter Store',
        'gcp-secret-manager': 'GCP Secret Manager'
    };
    return typeLabels[auth.type] || auth.type;
}
