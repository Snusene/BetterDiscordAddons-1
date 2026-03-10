<script lang="ts">
    import type {Snippet} from "svelte";
    import {fade, scale} from "svelte/transition";

    interface Props {
        ariaLabel: string;
        maxWidth?: string;
        height?: string;
        onBackdropClick?: () => void;
        header?: Snippet;
        children: Snippet;
    }

    const {
        ariaLabel,
        maxWidth = "900px",
        height = "60vh",
        onBackdropClick,
        header,
        children
    }: Props = $props();

    function handleBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            onBackdropClick?.();
        }
    }
</script>

<div class="ui-modal-backdrop" role="presentation" transition:fade={{ duration: 200 }} onclick={handleBackdropClick}>
    <div class="ui-modal" transition:scale={{ duration: 200 }} role="dialog" aria-modal="true" aria-label={ariaLabel} style:--ui-modal-max-width={maxWidth} style:--ui-modal-height={height}>
        {@render header?.()}
        <div class="ui-modal-content">
            {@render children()}
        </div>
    </div>
</div>

<style>
    .ui-modal-backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: var(--ui-modal-backdrop, rgba(0, 0, 0, 0.85));
    }

    .ui-modal {
        display: flex;
        flex-direction: column;
        width: min(var(--ui-modal-max-width), 100%);
        height: var(--ui-modal-height);
        border-radius: 8px;
        overflow: hidden;
        background: var(--ui-modal-surface, #313338);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }

    .ui-modal-content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        .ui-modal {
            max-height: 95vh;
        }

        .ui-modal-content {
            flex-direction: column;
        }
    }
</style>
