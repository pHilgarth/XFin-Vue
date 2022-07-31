<template>
  <div class="design-elements">
    <AtomHeadline tag="h1" text="Design-Elements" />
    <hr />
    <AtomHeadline tag="h3" text="Buttons" />
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
import AtomHeadline from '@/components/atoms/AtomHeadline';

export default {
  components: {
    AtomHeadline,
    AtomButton,
  },
}
</script>