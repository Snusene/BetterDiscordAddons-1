<script lang="ts">
    interface Props {
        title: string;
        subtitle?: string;
        avatarUrl?: string;
        avatarFallback?: string;
        closeLabel?: string;
        onClose: () => void;
    }

    const {
        title,
        subtitle = "",
        avatarUrl,
        avatarFallback = "#",
        closeLabel = "Close",
        onClose
    }: Props = $props();
</script>

<div class="ui-modal-header">
    <div class="ui-header-title">
        {#if avatarUrl}
            <img class="ui-header-avatar" src={avatarUrl} alt="" />
        {:else}
            <div class="ui-header-fallback" aria-hidden="true">{avatarFallback}</div>
        {/if}

        <div class="ui-header-text">
            <h2>{title}</h2>
            {#if subtitle}
                <p>{subtitle}</p>
            {/if}
        </div>
    </div>

    <button type="button" class="ui-close-button" aria-label={closeLabel} onclick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
        </svg>
    </button>
</div>

<style>
    .ui-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--ui-panel-surface, #2b2d31);
        border-bottom: 1px solid var(--ui-border, #1e1f22);
    }

    .ui-header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
    }

    .ui-header-avatar,
    .ui-header-fallback {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .ui-header-avatar {
        object-fit: cover;
    }

    .ui-header-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: var(--ui-text-primary, #f2f3f5);
        background: var(--ui-header-fallback-bg, linear-gradient(135deg, #5865f2, #7289da));
    }

    .ui-header-text {
        min-width: 0;
    }

    .ui-header-text h2 {
        font-size: 20px;
        font-weight: 600;
        line-height: 1.2;
        color: var(--ui-text-primary, #f2f3f5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ui-header-text p {
        margin: 2px 0 0 0;
        font-size: 13px;
        color: var(--ui-text-secondary, #b5bac1);
    }

    .ui-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--ui-text-secondary, #b5bac1);
        cursor: pointer;
    }

    .ui-close-button:hover {
        color: var(--ui-text-body, #dbdee1);
        background: var(--ui-hover-soft, #3f4147);
    }
</style>
