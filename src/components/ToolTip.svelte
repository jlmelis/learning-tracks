<script>
  export let text;
  export let active = false;
</script>

<style>
.tooltip {
  position: relative;
}

.tooltiptext {
  visibility: collapse; 
  position: absolute;
}

.tooltip .tooltiptext {
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  
  bottom: 125%;
  left: 50%;
  z-index: 1;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>

<div class:tooltip={active}>
  <slot></slot>
  <span class="tooltiptext">{text}</span>
</div>