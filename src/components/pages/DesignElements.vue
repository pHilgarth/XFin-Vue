<template>
  <div class="design-elements">
    <h1>Design-Elements</h1>
    <hr />
    <h3>Buttons</h3>
    <br>
    <AtomButton type="primary" text="Primary Button" />
    <br><br>
    <AtomButton type="primary" text="Primary Button Disabled" disabled />
    <br><br>
    <AtomButton type="primary-small" text="Primary Button Small" />
    <br><br>
    <AtomButton type="cancel" text="Button Cancel" />
    <br><br>
    <AtomButton type="light" text="Button Light" />
    <br><br>
    <AtomButton type="light" text="Button Light Disabled" disabled />
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';

export default {
  components: {
    AtomButton,
  },
}
</script>