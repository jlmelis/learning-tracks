<script>
    export let name;
    export let description;
</script>

<style>
    .summary {
        margin-top: 10px;
    }

    .desription {
        margin-left: 10px;
        font-style: italic;
    }
</style>

<div class="summary" on:click> 
    <span>{name}</span>
    <div class="desription">
        {description}
    </div>
    
</div>