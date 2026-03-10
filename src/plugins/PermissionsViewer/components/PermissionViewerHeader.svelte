<script lang="ts">
    import ModalHeader from "./ui/ModalHeader.svelte";

    interface Props {
        title: string;
        subtitle?: string;
        avatarUrl?: string;
        onClose: () => void;
    }

    const {
        title,
        subtitle = "",
        avatarUrl,
        onClose
    }: Props = $props();
</script>

<ModalHeader
    {title}
    {subtitle}
    {avatarUrl}
    avatarFallback="#"
    closeLabel="Close permission viewer"
    {onClose}
/>
