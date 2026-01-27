// View switching logic

function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active state from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected view
    if (viewId === 'import-secrets') {
        document.getElementById('import-secrets-view').classList.add('active');
        event.currentTarget.classList.add('active');
    } else if (viewId === 'manage-secret-managers') {
        document.getElementById('manage-secret-managers-view').classList.add('active');
        event.currentTarget.classList.add('active');
        renderSmClusterList();
    } else if (viewId === 'link-clusters') {
        document.getElementById('link-clusters-view').classList.add('active');
        event.currentTarget.classList.add('active');
        renderClusterList();
    } else {
        document.getElementById('empty-state').classList.add('active');
    }
}
