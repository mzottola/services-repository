// Mock data - Clusters with Secret Managers

const clusters = [
    {
        id: 'cluster-prod',
        name: 'Cluster Prod',
        secretManager: {
            id: 'sm1',
            name: 'Production Secrets',
            authentications: [
                {
                    id: 'auth1',
                    type: 'aws-secrets-manager',
                    authMode: 'role-arn',
                    roleArn: 'arn:aws:iam::123456789012:role/ProdSecretsRole',
                    secrets: [
                        { name: '/prod/app1/database-cluster', keys: ['host', 'port', 'username', 'password', 'database_name', 'ssl_mode'] },
                        { name: '/prod/app1/external-apis', keys: ['stripe_api_key', 'stripe_webhook_secret', 'sendgrid_api_key', 'twilio_account_sid'] },
                        { name: '/prod/app1/redis-connection', keys: null },
                        { name: '/prod/app1/jwt-secret', keys: null },
                        { name: '/prod/app1/aws-services', keys: ['s3_bucket_name', 's3_access_key', 's3_secret_key', 's3_region'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'cluster-staging',
        name: 'Cluster Staging',
        secretManager: {
            id: 'sm2',
            name: 'Staging Secrets',
            authentications: [
                {
                    id: 'auth2',
                    type: 'aws-secrets-manager',
                    authMode: 'auto',
                    secrets: [
                        { name: '/dev/app1/database', keys: ['host', 'port', 'username', 'password', 'database_name'] },
                        { name: '/dev/app1/oauth-providers', keys: ['google_client_id', 'google_client_secret', 'github_client_id', 'github_client_secret'] },
                        { name: '/dev/app1/db-url', keys: null },
                        { name: '/dev/app1/redis-url', keys: null }
                    ]
                },
                {
                    id: 'auth3',
                    type: 'gcp-secret-manager',
                    authMode: 'json-credentials',
                    jsonCredentials: '{\n  "type": "service_account",\n  "project_id": "my-project-dev",\n  "private_key_id": "abc123"\n}',
                    secrets: [
                        { name: 'projects/my-project-dev/secrets/api-key', keys: null },
                        { name: 'projects/my-project-dev/secrets/db-config', keys: ['host', 'port', 'username', 'password'] },
                        { name: 'projects/my-project-dev/secrets/feature-flags', keys: ['flag1', 'flag2', 'flag3'] }
                    ]
                },
                {
                    id: 'auth4',
                    type: 'aws-parameter-store',
                    authMode: 'static-credentials',
                    accessKey: 'AKIAIOSFODNN7EXAMPLE',
                    secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                    region: 'us-east-1',
                    secrets: [
                        { name: '/staging/microservices-config', keys: ['api_gateway_url', 'auth_service_url', 'payment_service_url'] },
                        { name: '/staging/monitoring-tools', keys: ['grafana_api_key', 'prometheus_endpoint', 'sentry_dsn'] },
                        { name: '/staging/external-api', keys: null },
                        { name: '/staging/cache-url', keys: null }
                    ]
                }
            ]
        }
    }
];

// Global state variables
let selectedClusterId = null;
let selectedSmClusterId = null;
let rowCounter = 0;
const importConfigs = [];
let authEntryCounter = 10;
let editingAuthId = null;
let currentAuthEntries = [];
