<script>
    
    export let id; 
    export let name;
    export let description;
    export let active;

</script>

<style>
    .summary {
        margin-top: 10px;
        cursor: pointer;
    }

    .desription {
        margin-left: 10px;
        font-style: italic;
    }

    .active {
        color: cornflowerblue;
    }

</style>

<div class="summary" class:active on:click> 
    <div>
        <span>{name}</span>
    </div>
    <div class="desription">
        {description}
    </div>
    
</div>