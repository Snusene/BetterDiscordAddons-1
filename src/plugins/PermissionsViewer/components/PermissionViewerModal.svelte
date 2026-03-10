<script lang="ts">
    import ModalFrame from "./ui/ModalFrame.svelte";
    import PermissionViewerHeader from "./PermissionViewerHeader.svelte";
    import PermissionViewerPermissions from "./PermissionViewerPermissions.svelte";
    import PermissionViewerSidebar from "./PermissionViewerSidebar.svelte";
    import type {
        PermissionCategoryDefinition,
        PermissionableEntity,
        PermissionableEntitySection
    } from "../types";

    interface Props {
        title: string;
        subtitle?: string;
        avatarUrl?: string;
        onClose: () => void;
        categories: PermissionCategoryDefinition[];
        tabs: PermissionableEntity[];
        showNeutral?: boolean;
        onToggleShowNeutral?: (value: boolean) => void;
    }

    const {
        title,
        subtitle = "",
        avatarUrl,
        onClose,
        categories,
        tabs,
        showNeutral = true,
        onToggleShowNeutral
    }: Props = $props();

    let roleSearch = $state("");
    let permissionSearch = $state("");
    let activeTabId = $state("");

    const groupedSections = $derived.by((): PermissionableEntitySection[] => {
        //  && !entity.iconUrl
        const specialViews = tabs.filter((entity) => !entity.avatarUrl && entity.position == null);
        const serverRoles = tabs
        //  || entity.iconUrl
            .filter((entity) => !entity.avatarUrl && (entity.position != null))
            .slice()
            .sort((a, b) => (b.position ?? -1) - (a.position ?? -1));
        const users = tabs.filter((entity) => Boolean(entity.avatarUrl));

        const sections: PermissionableEntitySection[] = [];

        if (specialViews.length > 0) {
            sections.push({
                id: "special",
                label: "Special Views",
                entities: specialViews
            });
        }

        if (serverRoles.length > 0) {
            sections.push({
                id: "roles",
                label: "Server Roles",
                entities: serverRoles
            });
        }

        if (users.length > 0) {
            sections.push({
                id: "users",
                label: "Users",
                entities: users
            });
        }

        return sections;
    });

    const filteredSections = $derived.by((): PermissionableEntitySection[] => {
        const query = roleSearch.trim().toLowerCase();
        if (!query) {
            return groupedSections;
        }

        return groupedSections
            .map((section) => ({
                ...section,
                entities: section.entities.filter((entity) => entity.name.toLowerCase().includes(query))
            }))
            .filter((section) => section.entities.length > 0);
    });

    const flatEntities = $derived.by(() => groupedSections.flatMap((section) => section.entities));
    const activeEntity = $derived.by(() => flatEntities.find((entity) => entity.id === activeTabId) ?? flatEntities[0]);

    $effect(() => {
        if (!activeTabId && flatEntities.length > 0) {
            activeTabId = flatEntities[0].id;
            return;
        }

        if (activeTabId && !flatEntities.some((entity) => entity.id === activeTabId)) {
            activeTabId = flatEntities[0]?.id ?? "";
        }
    });

    function selectTab(tabId: string): void {
        activeTabId = tabId;
        // permissionSearch = "";
    }
</script>

<div class="permission-viewer">
    <ModalFrame ariaLabel={title} maxWidth="900px" height="60vh" onBackdropClick={onClose}>
        {#snippet header()}
            <PermissionViewerHeader
                {title}
                {subtitle}
                {avatarUrl}
                {onClose}
            />
        {/snippet}

        <PermissionViewerSidebar
            sections={filteredSections}
            {roleSearch}
            {activeTabId}
            onRoleSearch={(value: string) => {
                roleSearch = value;
            }}
            onSelectTab={selectTab}
        />

        <PermissionViewerPermissions
            {categories}
            {activeEntity}
            {permissionSearch}
            {showNeutral}
            {onToggleShowNeutral}
            onPermissionSearch={(value: string) => {
                permissionSearch = value;
            }}
        />
    </ModalFrame>
</div>

<style>
    .permission-viewer {
        --pv-bg-backdrop: rgba(0, 0, 0, 0.85);
        --pv-bg-modal: #313338;
        --pv-bg-panel: #2b2d31;
        --pv-bg-input: #1e1f22;
        --pv-bg-input-focus: #1a1b1e;
        --pv-bg-hover: #35373c;
        --pv-bg-active: #404249;
        --pv-border: #1e1f22;
        --pv-text-primary: #f2f3f5;
        --pv-text-body: #dbdee1;
        --pv-text-muted: #949ba4;
        --pv-status-allowed: #23a55a;
        --pv-status-denied: #f23f43;
        --pv-status-neutral: #949ba4;
        --pv-role-indicator-default: #949ba4;
        z-index: 1000;
    }

    .permission-viewer {
        --ui-modal-backdrop: var(--pv-bg-backdrop);
        --ui-modal-surface: var(--pv-bg-modal);
        --ui-panel-surface: var(--pv-bg-panel);
        --ui-border: var(--pv-border);
        --ui-text-primary: var(--pv-text-primary);
        --ui-text-secondary: #b5bac1;
        --ui-text-body: var(--pv-text-body);
        --ui-text-muted: var(--pv-text-muted);
        --ui-input-bg: var(--pv-bg-input);
        --ui-input-bg-focus: var(--pv-bg-input-focus);
        --ui-hover-soft: #3f4147;
        --ui-header-fallback-bg: linear-gradient(135deg, #5865f2, #7289da);
    }

    :global(.permission-viewer *) {
        box-sizing: border-box;
    }
</style>
