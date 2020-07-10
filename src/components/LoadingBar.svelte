<script>
  import { isLoading } from '../stores';
</script>

{#if $isLoading}
    <progress class="progress is-small is-primary" max="100">15%</progress>
{/if}

<style>
  progress {
    position: absolute;
    bottom: 0;
  }
</style>