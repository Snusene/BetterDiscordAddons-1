<script lang="ts">
    import SearchField from "./ui/SearchField.svelte";
    import SidebarPanel from "./ui/SidebarPanel.svelte";
    import type {PermissionableEntitySection} from "../types";

    interface Props {
        sections: PermissionableEntitySection[];
        roleSearch: string;
        activeTabId: string;
        onRoleSearch: (value: string) => void;
        onSelectTab: (tabId: string) => void;
    }

    const {
        sections,
        roleSearch,
        activeTabId,
        onRoleSearch,
        onSelectTab
    }: Props = $props();
</script>

<SidebarPanel width="240px" ariaLabel="Roles and users">
    {#snippet search()}
        <SearchField
            value={roleSearch}
            placeholder="Search roles..."
            ariaLabel="Search roles and users"
            onInput={onRoleSearch}
        />
    {/snippet}

    <div class="sidebar-roles" role="tablist" aria-label="Roles and users">
        {#if sections.length === 0}
            <div class="empty-state">No roles found</div>
        {:else}
            {#each sections as section (section.id)}
                <div class="sidebar-section">
                    <div class="sidebar-section-label">{section.label}</div>
                    {#each section.entities as entity (entity.id)}
                        <button
                            type="button"
                            class="sidebar-role"
                            class:active={entity.id === activeTabId}
                            role="tab"
                            aria-selected={entity.id === activeTabId}
                            onclick={() => onSelectTab(entity.id)}
                        >
                            {#if entity.avatarUrl}
                                <img class="role-avatar" src={entity.avatarUrl} alt="" />
                            {:else}
                                <span
                                    class="role-indicator"
                                    style:background-color={entity.color ?? "var(--pv-role-indicator-default)"}
                                ></span>
                            {/if}
                            <span class="role-name">{entity.name}</span>
                            {#if !entity.avatarUrl && entity.iconUrl}
                                <img class="role-trailing-icon" src={entity.iconUrl} alt="" />
                            {/if}
                        </button>
                    {/each}
                </div>
            {/each}
        {/if}
    </div>
</SidebarPanel>

<style>
    .sidebar-roles {
        width: 100%;
    }

    .sidebar-section {
        margin-bottom: 16px;
    }

    .sidebar-section:last-child {
        margin-bottom: 8px;
    }

    .sidebar-section-label {
        color: var(--pv-text-muted);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 8px 4px;
    }

    .sidebar-role {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin-bottom: 2px;
        padding: 8px 10px;
        border: none;
        border-radius: 4px;
        text-align: left;
        cursor: pointer;
        color: var(--pv-text-body);
        background: transparent;
    }

    .sidebar-role:hover {
        color: var(--pv-text-primary);
        background: var(--pv-bg-hover);
    }

    .sidebar-role.active {
        color: var(--pv-text-primary);
        background: var(--pv-bg-active);
    }

    .role-indicator,
    .role-avatar,
    .role-trailing-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
    }

    .role-avatar {
        width: 18px;
        height: 18px;
        object-fit: cover;
    }

    .role-trailing-icon {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        object-fit: cover;
        margin-left: auto;
    }

    .role-name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .empty-state {
        padding: 12px;
        font-size: 13px;
        color: var(--pv-text-muted);
    }

    @media (max-width: 768px) {
        .sidebar-section {
            display: flex;
            gap: 4px;
            margin-bottom: 0;
        }

        .sidebar-section-label {
            display: none;
        }

        .sidebar-role {
            flex-shrink: 0;
            width: auto;
        }
    }
</style>
