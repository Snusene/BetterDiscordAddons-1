<script lang="ts">
    import type {PermissionStatus} from "../types";

    interface Props {
        status: PermissionStatus;
    }

    const {status}: Props = $props();
</script>

{#if status === "allowed"}
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
{:else if status === "denied"}
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.68-4.9L16.9 18.32C15.55 19.37 13.85 20 12 20zm6.32-3.1L7.1 5.68C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.68 4.9z" />
    </svg>
{:else}
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 13H5v-2h14v2z" />
    </svg>
{/if}

<style>
    svg {
        width: 14px;
        height: 14px;
    }
</style>