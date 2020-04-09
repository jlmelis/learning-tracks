<script> 
  export let name;
  export let description;
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
</style>

<div class="summary" on:click> 
  <div>
    <span>{name}</span>
  </div>
  <div class="desription">
    {description}
  </div>
</div>