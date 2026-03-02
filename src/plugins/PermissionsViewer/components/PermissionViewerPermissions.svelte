<script lang="ts">
    import PermissionStatusIcon from "./PermissionStatusIcon.svelte";
    import SearchField from "./ui/SearchField.svelte";
    import type {
        PermissionCategoryDefinition,
        PermissionStatus,
        PermissionableEntity
    } from "../types";

    interface VisiblePermission {
        id: string;
        name: string;
        description: string;
        status: PermissionStatus;
    }

    interface VisibleCategory {
        name: string;
        permissions: VisiblePermission[];
    }

    interface Props {
        categories: PermissionCategoryDefinition[];
        activeEntity?: PermissionableEntity;
        permissionSearch: string;
        onPermissionSearch: (value: string) => void;
    }

    const {
        categories,
        activeEntity,
        permissionSearch,
        onPermissionSearch
    }: Props = $props();

    const visibleCategories = $derived.by((): VisibleCategory[] => {
        const search = permissionSearch.trim().toLowerCase();
        const permissions = activeEntity?.permissions ?? {};

        return categories
            .map((category) => {
                const categoryPermissions = category.permissions
                    .filter((permission) => {
                        if (!search) {
                            return true;
                        }

                        const permissionName = permission.name.toLowerCase();
                        const permissionDescription = permission.description.toLowerCase();
                        return permissionName.includes(search) || permissionDescription.includes(search);
                    })
                    .map((permission): VisiblePermission => ({
                        ...permission,
                        status: permissions[permission.id] ?? "neutral"
                    }));

                return {
                    name: category.name,
                    permissions: categoryPermissions
                };
            })
            .filter((category) => category.permissions.length > 0);
    });

    function getStatusLabel(status: PermissionStatus): string {
        if (status === "allowed") {
            return "Allowed";
        }

        if (status === "denied") {
            return "Denied";
        }

        return "Neutral";
    }
</script>

<div class="main-content">
    <div class="content-search">
        <SearchField
            value={permissionSearch}
            placeholder="Search permissions..."
            ariaLabel="Search permissions"
            withSearchIcon={true}
            onInput={onPermissionSearch}
        />
    </div>

    <div class="main-body">
        {#if !activeEntity}
            <div class="empty-state">No role data available</div>
        {:else if visibleCategories.length === 0}
            <div class="empty-state">No permissions match this search</div>
        {:else}
            {#each visibleCategories as category (category.name)}
                <section class="permission-category">
                    <h3 class="category-header">{category.name}</h3>
                    <div class="permission-list">
                        {#each category.permissions as permission (permission.id)}
                            <div class="permission-item">
                                <div class="permission-info">
                                    <div class="permission-icon permission-status {permission.status}">
                                        <PermissionStatusIcon status={permission.status} />
                                    </div>
                                    <div class="permission-details">
                                        <div class="permission-name">{permission.name}</div>
                                        <div class="permission-description">{permission.description}</div>
                                    </div>
                                </div>
                                <div class="permission-badge permission-status {permission.status}">
                                    <PermissionStatusIcon status={permission.status} />
                                    {getStatusLabel(permission.status)}
                                </div>
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        {/if}
    </div>
</div>

<style>
    .main-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
    }

    .content-search {
        padding: 12px 20px;
        background: var(--pv-bg-panel);
        border-bottom: 1px solid var(--pv-border);
    }

    .main-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-border, #1e1f22) transparent;
    }

    .permission-category {
        margin-bottom: 24px;
    }

    .permission-category:last-child {
        margin-bottom: 0;
    }

    .category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--pv-text-muted);
    }

    .category-header::after {
        content: "";
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, #3f4147, transparent);
    }

    .permission-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .permission-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 14px;
        border-radius: 4px;
        background: var(--pv-bg-panel);
    }

    .permission-item:hover {
        background: var(--pv-bg-hover);
    }

    .permission-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;
    }

    .permission-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-top: 2px;
    }

    .permission-details {
        min-width: 0;
    }

    .permission-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--pv-text-primary);
    }

    .permission-description {
        font-size: 12px;
        line-height: 1.4;
        color: var(--pv-text-muted);
    }

    .permission-status {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
    }

    .permission-status.allowed {
        color: var(--pv-status-allowed);
        background: color-mix(in srgb, var(--pv-status-allowed) 12%, transparent);
    }

    .permission-status.denied {
        color: var(--pv-status-denied);
        background: color-mix(in srgb, var(--pv-status-denied) 12%, transparent);
    }

    .permission-status.neutral {
        color: var(--pv-status-neutral);
        background: color-mix(in srgb, var(--pv-status-neutral) 12%, transparent);
    }

    .permission-badge {
        width: 82px;
    }

    .empty-state {
        padding: 12px;
        font-size: 13px;
        color: var(--pv-text-muted);
    }

    @media (max-width: 768px) {
        .permission-item {
            flex-direction: column;
            align-items: flex-start;
        }

        .permission-item .permission-status {
            width: 100%;
            justify-content: center;
        }
    }
</style>
