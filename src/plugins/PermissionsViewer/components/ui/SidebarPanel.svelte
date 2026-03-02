<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        width?: string;
        ariaLabel?: string;
        search?: Snippet;
        children: Snippet;
    }

    const {
        width = "240px",
        ariaLabel = "Sidebar",
        search,
        children
    }: Props = $props();
</script>

<aside class="ui-sidebar" style:--ui-sidebar-width={width} aria-label={ariaLabel}>
    <div class="ui-sidebar-search">
        {@render search?.()}
    </div>
    <div class="ui-sidebar-body">
        {@render children()}
    </div>
</aside>

<style>
    .ui-sidebar {
        display: flex;
        flex-direction: column;
        width: var(--ui-sidebar-width);
        background: var(--ui-panel-surface, #2b2d31);
        border-right: 1px solid var(--ui-border, #1e1f22);
    }

    .ui-sidebar-search {
        padding: 12px;
        border-bottom: 1px solid var(--ui-border, #1e1f22);
    }

    .ui-sidebar-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-border, #1e1f22) transparent;
    }

    @media (max-width: 768px) {
        .ui-sidebar {
            width: 100%;
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid var(--ui-border, #1e1f22);
        }

        .ui-sidebar-body {
            display: flex;
            gap: 4px;
            overflow-x: auto;
            overflow-y: hidden;
        }
    }
</style>
