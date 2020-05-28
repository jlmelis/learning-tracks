<script> 
  export let name;
  export let description;
</script>

<div class="summary" on:click> 
  <div>
    <span>{name}</span>
  </div>
  <div class="desription">
    {description}
  </div>
</div>

<style>
  .summary {
    width: 100%;
    margin-top: 10px;
    cursor: pointer;
    user-select: none;
  }

  .desription {
    margin-left: 10px;
    font-style: italic;
  }
</style>