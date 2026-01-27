// Import Secrets functionality

// Target Key Validation
function validateTargetKeys() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const targetKeyMap = new Map();

    rows.forEach(row => {
        const targetInput = row.cells[3].querySelector('input[type="text"]');
        if (targetInput && !targetInput.disabled) {
            const value = targetInput.value.trim();
            if (value) {
                if (!targetKeyMap.has(value)) {
                    targetKeyMap.set(value, []);
                }
                targetKeyMap.get(value).push(targetInput);
            }
        }
    });

    rows.forEach(row => {
        const targetInput = row.cells[3].querySelector('input[type="text"]');
        const errorDiv = row.cells[3].querySelector('.duplicate-error');
        if (targetInput && !targetInput.disabled) {
            targetInput.classList.remove('duplicate');
            if (errorDiv) {
                errorDiv.classList.remove('show');
            }
        }
    });

    targetKeyMap.forEach((inputs, key) => {
        if (inputs.length > 1) {
            inputs.forEach(input => {
                input.classList.add('duplicate');
                const errorDiv = input.parentElement.querySelector('.duplicate-error');
                if (errorDiv) {
                    errorDiv.classList.add('show');
                }
            });
        }
    });
}

function getImportedTargetKeys() {
    const importedKeys = new Set();
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const targetInput = row.cells[3].querySelector('input');
        if (targetInput && targetInput.value.trim()) {
            importedKeys.add(targetInput.value.trim());
        }
    });

    return importedKeys;
}

// Main Table Functions
function addRow() {
    const rowId = `row-${rowCounter++}`;
    const tbody = document.getElementById('tableBody');

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td>
            <select onchange="handleSecretsSourceChange('${rowId}')">
                <option value="">Select Secrets Source</option>
                ${getStagingAuthentications().map(auth => `<option value="${auth.id}">${getAuthDisplayName(auth)}</option>`).join('')}
            </select>
        </td>
        <td>
            <select disabled onchange="handleSecretChange('${rowId}')">
                <option value="">Select Secret</option>
            </select>
        </td>
        <td>
            <select disabled onchange="handleImportTypeChange('${rowId}')">
                <option value="">Select Type</option>
                <option value="env">Env var</option>
                <option value="file">File</option>
            </select>
        </td>
        <td>
            <input type="text" placeholder="e.g., DATABASE_URL" disabled oninput="validateTargetKeys()">
            <div class="duplicate-error">Duplicate target key</div>
        </td>
        <td>
            <input type="text" class="file-path-input" placeholder="e.g., /etc/secrets/config.json" disabled>
        </td>
        <td>
            <span class="scope-label">SERVICE</span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow('${rowId}')">Delete</button>
        </td>
    `;

    tbody.appendChild(tr);
    importConfigs.push({ rowId, config: {} });
}

function handleSecretsSourceChange(rowId) {
    const row = document.getElementById(rowId);
    const authSelect = row.cells[0].querySelector('select');
    const secretSelect = row.cells[1].querySelector('select');
    const typeSelect = row.cells[2].querySelector('select');
    const targetInput = row.cells[3].querySelector('input');
    const filePathInput = row.cells[4].querySelector('.file-path-input');

    const authResult = findAuthentication(authSelect.value);

    const currentSecretName = secretSelect.value;
    const currentImportType = typeSelect.value;

    secretSelect.innerHTML = '<option value="">Select Secret</option>';
    typeSelect.value = '';
    typeSelect.disabled = true;
    targetInput.value = '';
    targetInput.disabled = true;
    filePathInput.value = '';
    filePathInput.disabled = true;

    if (authResult) {
        const allSecrets = getSecretsForAuth(authResult.auth.id);
        allSecrets.forEach(secret => {
            const option = document.createElement('option');
            option.value = secret.name;
            option.textContent = secret.name;
            if (secret.name === currentSecretName) {
                option.selected = true;
            }
            secretSelect.appendChild(option);
        });
        secretSelect.disabled = false;

        if (currentSecretName && secretSelect.value === currentSecretName) {
            handleSecretChange(rowId);
            if (currentImportType) {
                typeSelect.value = currentImportType;
                handleImportTypeChange(rowId);
            }
        }
    }

    updateConfig(rowId, 'authenticationId', authSelect.value);
}

function handleSecretChange(rowId) {
    const row = document.getElementById(rowId);
    const secretSelect = row.cells[1].querySelector('select');
    const typeSelect = row.cells[2].querySelector('select');
    const targetInput = row.cells[3].querySelector('input');

    typeSelect.innerHTML = '<option value="">Select Type</option>';
    typeSelect.innerHTML += '<option value="env">Env var</option>';
    typeSelect.innerHTML += '<option value="file">File</option>';

    targetInput.value = '';
    targetInput.disabled = true;

    typeSelect.disabled = false;
    typeSelect.value = '';

    updateConfig(rowId, 'secretName', secretSelect.value);
}

function handleImportTypeChange(rowId) {
    const row = document.getElementById(rowId);
    const typeSelect = row.cells[2].querySelector('select');
    const targetInput = row.cells[3].querySelector('input[type="text"]:not(.file-path-input)');
    const filePathInput = row.cells[4].querySelector('.file-path-input');

    targetInput.disabled = false;

    const importType = typeSelect.value;

    if (importType === 'env') {
        targetInput.placeholder = 'e.g., DATABASE_URL';
        filePathInput.disabled = true;
        filePathInput.value = '';
    } else if (importType === 'file') {
        targetInput.placeholder = 'e.g., config_file';
        filePathInput.disabled = false;
    }

    updateConfig(rowId, 'importType', importType);
}

function deleteRow(rowId) {
    const row = document.getElementById(rowId);
    row.remove();

    const index = importConfigs.findIndex(ic => ic.rowId === rowId);
    if (index > -1) {
        importConfigs.splice(index, 1);
    }
}

function updateConfig(rowId, field, value) {
    const config = importConfigs.find(ic => ic.rowId === rowId);
    if (config) {
        config.config[field] = value;
    }
}

function collectRowData(rowId) {
    const row = document.getElementById(rowId);
    const authSelect = row.cells[0].querySelector('select');
    const secretSelect = row.cells[1].querySelector('select');
    const typeSelect = row.cells[2].querySelector('select');
    const targetInput = row.cells[3].querySelector('input[type="text"]:not(.file-path-input)');
    const filePathInput = row.cells[4].querySelector('.file-path-input');

    const data = {
        authenticationId: authSelect.value,
        authenticationName: authSelect.options[authSelect.selectedIndex]?.text || '',
        secretName: secretSelect.value,
        importType: typeSelect.value,
        targetKey: targetInput.value,
        scope: 'SERVICE'
    };

    if (typeSelect.value === 'file' && filePathInput) {
        data.filePath = filePathInput.value;
    }

    return data;
}

function validateRow(data) {
    const errors = [];

    if (!data.authenticationId) errors.push('Secrets Source is required');
    if (!data.secretName) errors.push('Secret Name is required');
    if (!data.importType) errors.push('Import Type is required');
    if (!data.targetKey) errors.push('Target Key is required');
    if (data.importType === 'file' && !data.filePath) errors.push('File path is required for File import type');

    if (data.importType === 'file' && data.filePath && !data.filePath.startsWith('/')) {
        errors.push('File path must start with /');
    }

    return errors;
}

function save() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('Please add at least one secret import configuration');
        return;
    }

    const hasDuplicates = tbody.querySelector('input[type="text"].duplicate');
    if (hasDuplicates) {
        alert('⚠️ Cannot save: You have duplicate Target Keys. Please ensure all Target Keys are unique.');
        return;
    }

    const configurations = [];
    let hasErrors = false;

    rows.forEach(row => {
        const rowId = row.id;
        const data = collectRowData(rowId);
        const errors = validateRow(data);

        if (errors.length > 0) {
            hasErrors = true;
            alert(`Row validation errors:\n${errors.join('\n')}`);
            return;
        }

        configurations.push(data);
    });

    if (hasErrors) return;

    console.log('Saving configurations:', configurations);
    alert(`Successfully configured ${configurations.length} secret import(s)!\n\nCheck the console for the full configuration.`);
}

function cancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        window.location.reload();
    }
}

// Bulk Import Modal Functions
function updateBulkModalSecretsManagers() {
    const bulkSMSelect = document.getElementById('bulkSecretsManager');
    const allSMs = getAllSecretManagers();
    if (bulkSMSelect) {
        bulkSMSelect.innerHTML = '<option value="">Select Secrets Manager</option>';
        allSMs.forEach(sm => {
            const option = document.createElement('option');
            option.value = sm.id;
            option.textContent = `${sm.name} (${sm.clusterName})`;
            bulkSMSelect.appendChild(option);
        });
    }
}

function openBulkImportModal() {
    const modal = document.getElementById('bulkImportModal');
    modal.classList.add('active');

    document.getElementById('bulkSecretsManager').value = '';
    document.getElementById('bulkSecretName').value = '';
    document.getElementById('bulkSecretName').disabled = true;
    document.getElementById('bulkKeysContainer').style.display = 'none';
    document.getElementById('bulkConfirmBtn').disabled = true;
}

function closeBulkImportModal() {
    const modal = document.getElementById('bulkImportModal');
    modal.classList.remove('active');
}

function handleBulkSecretsManagerChange() {
    const smSelect = document.getElementById('bulkSecretsManager');
    const secretSelect = document.getElementById('bulkSecretName');
    const keysContainer = document.getElementById('bulkKeysContainer');
    const confirmBtn = document.getElementById('bulkConfirmBtn');

    const selectedSM = findSecretManager(smSelect.value)?.sm;

    secretSelect.innerHTML = '<option value="">Select Secret</option>';
    keysContainer.style.display = 'none';
    confirmBtn.disabled = true;

    if (selectedSM) {
        const allSecrets = getSecretsForSM(selectedSM);
        allSecrets
            .filter(secret => secret.keys !== null && secret.keys.length > 0)
            .forEach(secret => {
                const option = document.createElement('option');
                option.value = secret.name;
                option.textContent = secret.name;
                option.dataset.keys = JSON.stringify(secret.keys);
                secretSelect.appendChild(option);
            });
        secretSelect.disabled = false;
    } else {
        secretSelect.disabled = true;
    }
}

function handleBulkSecretChange() {
    const secretSelect = document.getElementById('bulkSecretName');
    const keysContainer = document.getElementById('bulkKeysContainer');
    const keysTableBody = document.getElementById('bulkKeysTableBody');
    const confirmBtn = document.getElementById('bulkConfirmBtn');

    const selectedOption = secretSelect.options[secretSelect.selectedIndex];
    const keys = JSON.parse(selectedOption.dataset.keys || '[]');

    if (keys.length > 0) {
        keysTableBody.innerHTML = '';

        const importedTargetKeys = getImportedTargetKeys();

        keys.forEach((key, index) => {
            const defaultTargetKey = key.toUpperCase();
            const isAlreadyImported = importedTargetKeys.has(defaultTargetKey);

            const tr = document.createElement('tr');
            if (isAlreadyImported) {
                tr.classList.add('disabled');
            }
            tr.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" id="key-${index}" ${isAlreadyImported ? '' : 'checked'} ${isAlreadyImported ? 'disabled' : ''} onchange="updateBulkConfirmButton()">
                </td>
                <td>
                    <span class="key-label">${key}</span>
                    ${isAlreadyImported ? '<span style="color: #e53e3e; font-size: 12px; margin-left: 8px;">(Target key already used)</span>' : ''}
                </td>
                <td>
                    <input type="text" value="${defaultTargetKey}" data-key="${key}" id="target-${index}" ${isAlreadyImported ? 'disabled' : ''} ${isAlreadyImported ? 'style="background: #f7fafc; color: #a0aec0;"' : ''} oninput="checkBulkTargetKeyConflict(${index})">
                </td>
            `;
            keysTableBody.appendChild(tr);
        });

        keysContainer.style.display = 'block';
        updateBulkConfirmButton();
        updateSelectAllCheckbox();
    } else {
        keysContainer.style.display = 'none';
        confirmBtn.disabled = true;
    }
}

function checkBulkTargetKeyConflict(index) {
    const targetInput = document.getElementById(`target-${index}`);
    const checkbox = document.getElementById(`key-${index}`);
    const tr = targetInput.closest('tr');
    const errorSpan = tr.querySelector('td:nth-child(2) span[style*="color: #e53e3e"]');

    if (!targetInput || targetInput.disabled) return;

    const newTargetKey = targetInput.value.trim();
    const importedTargetKeys = getImportedTargetKeys();

    const hasConflict = importedTargetKeys.has(newTargetKey);

    if (hasConflict) {
        checkbox.disabled = true;
        checkbox.checked = false;
        targetInput.disabled = true;
        targetInput.style.background = '#f7fafc';
        targetInput.style.color = '#a0aec0';
        tr.classList.add('disabled');

        if (!errorSpan) {
            const keyLabel = tr.querySelector('.key-label');
            keyLabel.insertAdjacentHTML('afterend', '<span style="color: #e53e3e; font-size: 12px; margin-left: 8px;">(Target key already used)</span>');
        }
    } else {
        checkbox.disabled = false;
        checkbox.checked = true;
        targetInput.disabled = false;
        targetInput.style.background = '';
        targetInput.style.color = '';
        tr.classList.remove('disabled');

        if (errorSpan) {
            errorSpan.remove();
        }
    }

    updateBulkConfirmButton();
    updateSelectAllCheckbox();
}

function updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('#bulkKeysTableBody input[type="checkbox"]:not([disabled])');
    const selectAllCheckbox = document.getElementById('selectAllKeys');

    if (checkboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.disabled = true;
        return;
    }

    selectAllCheckbox.disabled = false;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const someChecked = Array.from(checkboxes).some(cb => cb.checked);

    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

function toggleAllKeys() {
    const selectAll = document.getElementById('selectAllKeys');
    const checkboxes = document.querySelectorAll('#bulkKeysTableBody input[type="checkbox"]:not([disabled])');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });

    updateBulkConfirmButton();
}

function updateBulkConfirmButton() {
    const checkboxes = document.querySelectorAll('#bulkKeysTableBody input[type="checkbox"]:not([disabled])');
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    const confirmBtn = document.getElementById('bulkConfirmBtn');

    confirmBtn.disabled = !anyChecked;

    updateSelectAllCheckbox();
}

function confirmBulkImport() {
    const smSelect = document.getElementById('bulkSecretsManager');
    const secretSelect = document.getElementById('bulkSecretName');
    const checkboxes = document.querySelectorAll('#bulkKeysTableBody input[type="checkbox"]');

    const selectedSM = findSecretManager(smSelect.value)?.sm;
    const smName = selectedSM ? selectedSM.name : '';
    const secretName = secretSelect.value;

    let importedCount = 0;

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            const targetInput = document.getElementById(`target-${index}`);
            const originalKey = targetInput.dataset.key;
            const targetKey = targetInput.value.trim();

            if (targetKey) {
                addBulkImportRow(smSelect.value, smName, secretName, originalKey, targetKey);
                importedCount++;
            }
        }
    });

    closeBulkImportModal();
    validateTargetKeys();
}

function addBulkImportRow(smId, smName, secretName, jsonKey, targetKey) {
    const rowId = `row-${rowCounter++}`;
    const tbody = document.getElementById('tableBody');

    const selectedSM = findSecretManager(smId)?.sm;
    const allSecrets = selectedSM ? getSecretsForSM(selectedSM) : [];
    const selectedSecret = allSecrets.find(s => s.name === secretName);
    const secretKeys = selectedSecret ? selectedSecret.keys : [];

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td>
            <select disabled>
                <option value="${smId}" selected>${smName}</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="${secretName}" selected>${secretName}</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="json-key" selected>JSON Key → ENV_VAR</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="${jsonKey}" selected>${jsonKey}</option>
            </select>
        </td>
        <td>
            <input type="text" value="${targetKey}" oninput="validateTargetKeys()">
            <div class="duplicate-error">Duplicate target key</div>
        </td>
        <td>
            <input type="text" class="file-path-input" placeholder="e.g., /etc/secrets/config.json" disabled>
        </td>
        <td>
            <span class="scope-label">SERVICE</span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow('${rowId}')">Delete</button>
        </td>
    `;

    tbody.appendChild(tr);

    importConfigs.push({
        rowId,
        config: {
            secretsManagerId: smId,
            secretName: secretName,
            importType: 'json-key',
            jsonKey: jsonKey,
            scope: 'SERVICE',
            targetKey: targetKey
        }
    });
}

// Bulk String Import Modal Functions
function openBulkStringImportModal() {
    const modal = document.getElementById('bulkStringImportModal');
    modal.classList.add('active');

    const smSelect = document.getElementById('bulkStringSecretsManager');
    smSelect.innerHTML = '<option value="">Select Secrets Manager</option>';
    getAllSecretManagers().forEach(sm => {
        const option = document.createElement('option');
        option.value = sm.id;
        option.textContent = sm.name;
        smSelect.appendChild(option);
    });

    document.getElementById('bulkStringSecretsContainer').style.display = 'none';
    document.getElementById('bulkStringConfirmBtn').disabled = true;
}

function closeBulkStringImportModal() {
    const modal = document.getElementById('bulkStringImportModal');
    modal.classList.remove('active');
}

function handleBulkStringSecretsManagerChange() {
    const smSelect = document.getElementById('bulkStringSecretsManager');
    const secretsContainer = document.getElementById('bulkStringSecretsContainer');
    const tableBody = document.getElementById('bulkStringSecretsTableBody');
    const confirmBtn = document.getElementById('bulkStringConfirmBtn');

    const selectedSM = findSecretManager(smSelect.value)?.sm;

    if (!selectedSM) {
        secretsContainer.style.display = 'none';
        confirmBtn.disabled = true;
        return;
    }

    const allSecrets = getSecretsForSM(selectedSM);

    if (allSecrets.length === 0) {
        secretsContainer.style.display = 'none';
        confirmBtn.disabled = true;
        alert('No secrets found in this Secret Manager.');
        return;
    }

    const importedSecrets = getImportedStringSecrets(smSelect.value);

    tableBody.innerHTML = '';
    allSecrets.forEach((secret, index) => {
        const isAlreadyImported = importedSecrets.has(secret.name);
        const defaultTargetKey = generateTargetKeyFromSecretName(secret.name);
        const isJson = secret.keys !== null && Array.isArray(secret.keys);
        const typeBadge = isJson
            ? '<span class="tree-badge json" style="font-size: 10px; margin-left: 8px;">JSON</span>'
            : '<span class="tree-badge string" style="font-size: 10px; margin-left: 8px;">RAW-TEXT</span>';

        const tr = document.createElement('tr');
        if (isAlreadyImported) {
            tr.classList.add('disabled');
        }
        tr.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" id="string-secret-${index}" ${isAlreadyImported ? '' : 'checked'} ${isAlreadyImported ? 'disabled' : ''} onchange="updateBulkStringConfirmButton()">
            </td>
            <td>
                <span style="font-size: 14px;">${secret.name}</span>${typeBadge}
                ${isAlreadyImported ? '<span style="color: #e53e3e; font-size: 12px; margin-left: 8px;">(Already imported)</span>' : ''}
            </td>
            <td>
                <select id="string-import-type-${index}" onchange="handleBulkStringImportTypeChange(${index})" ${isAlreadyImported ? 'disabled' : ''}>
                    <option value="env" selected>Env Var</option>
                    <option value="file">File</option>
                </select>
            </td>
            <td>
                <input type="text" value="${defaultTargetKey}" data-secret-name="${secret.name}" id="string-target-${index}" ${isAlreadyImported ? 'disabled' : ''} ${isAlreadyImported ? 'style="background: #f7fafc; color: #a0aec0;"' : ''}>
            </td>
            <td>
                <input type="text" id="string-filepath-${index}" placeholder="/path/to/file" disabled style="background: #f7fafc; color: #a0aec0;">
            </td>
        `;
        tableBody.appendChild(tr);
    });

    secretsContainer.style.display = 'block';
    updateBulkStringConfirmButton();
    updateSelectAllStringSecretsCheckbox();
}

function handleBulkStringImportTypeChange(index) {
    const importTypeSelect = document.getElementById(`string-import-type-${index}`);
    const filePathInput = document.getElementById(`string-filepath-${index}`);
    const targetInput = document.getElementById(`string-target-${index}`);

    if (importTypeSelect.value === 'file') {
        filePathInput.disabled = false;
        filePathInput.style.background = '';
        filePathInput.style.color = '';
        targetInput.placeholder = 'e.g., config_file';
    } else {
        filePathInput.disabled = true;
        filePathInput.style.background = '#f7fafc';
        filePathInput.style.color = '#a0aec0';
        filePathInput.value = '';
        targetInput.placeholder = 'e.g., DATABASE_URL';
    }
}

function getImportedStringSecrets(smId) {
    const imported = new Set();
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const smSelect = row.cells[0].querySelector('select');
        const secretSelect = row.cells[1].querySelector('select');
        const typeSelect = row.cells[2].querySelector('select');

        if (smSelect && secretSelect && typeSelect) {
            const rowSmId = smSelect.value;
            const secretName = secretSelect.value;
            const importType = typeSelect.value;

            if (rowSmId === smId && (importType === 'string' || importType === 'json-file')) {
                imported.add(secretName);
            }
        }
    });

    return imported;
}

function toggleAllStringSecrets() {
    const selectAll = document.getElementById('selectAllStringSecrets');
    const checkboxes = document.querySelectorAll('#bulkStringSecretsTableBody input[type="checkbox"]:not([disabled])');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });

    updateBulkStringConfirmButton();
}

function updateSelectAllStringSecretsCheckbox() {
    const checkboxes = document.querySelectorAll('#bulkStringSecretsTableBody input[type="checkbox"]:not([disabled])');
    const selectAllCheckbox = document.getElementById('selectAllStringSecrets');

    if (checkboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.disabled = true;
        return;
    }

    selectAllCheckbox.disabled = false;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const someChecked = Array.from(checkboxes).some(cb => cb.checked);

    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

function updateBulkStringConfirmButton() {
    const checkboxes = document.querySelectorAll('#bulkStringSecretsTableBody input[type="checkbox"]:not([disabled])');
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    const confirmBtn = document.getElementById('bulkStringConfirmBtn');

    confirmBtn.disabled = !anyChecked;
    updateSelectAllStringSecretsCheckbox();
}

function confirmBulkStringImport() {
    const smSelect = document.getElementById('bulkStringSecretsManager');
    const tableBody = document.getElementById('bulkStringSecretsTableBody');
    const rows = tableBody.querySelectorAll('tr');

    const selectedSM = findSecretManager(smSelect.value)?.sm;
    const smName = selectedSM ? selectedSM.name : '';
    const smId = smSelect.value;

    let importedCount = 0;

    rows.forEach((row, index) => {
        const checkbox = document.getElementById(`string-secret-${index}`);
        const targetInput = document.getElementById(`string-target-${index}`);
        const importTypeSelect = document.getElementById(`string-import-type-${index}`);
        const filePathInput = document.getElementById(`string-filepath-${index}`);

        if (checkbox && checkbox.checked && targetInput) {
            const secretName = targetInput.dataset.secretName;
            const targetKey = targetInput.value.trim();
            const importType = importTypeSelect ? importTypeSelect.value : 'env';
            const filePath = filePathInput ? filePathInput.value.trim() : '';

            if (targetKey) {
                addBulkStringImportRow(smId, smName, secretName, targetKey, importType, filePath);
                importedCount++;
            }
        }
    });

    closeBulkStringImportModal();
    validateTargetKeys();
}

function addBulkStringImportRow(smId, smName, secretName, targetKey, importType, filePath) {
    const rowId = `row-${rowCounter++}`;
    const tbody = document.getElementById('tableBody');

    const isFile = importType === 'file';
    const importTypeLabel = isFile ? 'JSON → File' : 'String → ENV_VAR';
    const importTypeValue = isFile ? 'json-file' : 'string';

    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td>
            <select disabled>
                <option value="${smId}" selected>${smName}</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="${secretName}" selected>${secretName}</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="${importTypeValue}" selected>${importTypeLabel}</option>
            </select>
        </td>
        <td>
            <select disabled>
                <option value="">N/A</option>
            </select>
        </td>
        <td>
            <input type="text" value="${targetKey}" oninput="validateTargetKeys()">
            <div class="duplicate-error">Duplicate target key</div>
        </td>
        <td>
            <input type="text" class="file-path-input" value="${filePath}" placeholder="e.g., /etc/secrets/config.json" ${isFile ? '' : 'disabled'}>
        </td>
        <td>
            <span class="scope-label">SERVICE</span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow('${rowId}')">Delete</button>
        </td>
    `;

    tbody.appendChild(tr);

    importConfigs.push({
        rowId,
        config: {
            secretsManagerId: smId,
            secretName: secretName,
            importType: importTypeValue,
            jsonKey: null,
            scope: 'SERVICE',
            targetKey: targetKey,
            filePath: isFile ? filePath : null
        }
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const bulkSMSelect = document.getElementById('bulkSecretsManager');
    getAllSecretManagers().forEach(sm => {
        const option = document.createElement('option');
        option.value = sm.id;
        option.textContent = sm.name;
        bulkSMSelect.appendChild(option);
    });
});
