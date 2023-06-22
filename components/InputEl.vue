<template>
<input
  :value="modelValue" :id="id" :type="type" :inputmode="inputmode" :autocomplete="!!autocomplete" :min="min" :max="max" :disabled="!!disabled" :placeholder="placeholder" :name="name"
  @focus="$emit('focus')" @blur="$emit('blur')"
  @input="event => $emit('update:modelValue', event.target.value)"
  @change="event => $emit('update:modelValue', event.target.value)" style="outline: none" />
</template>
<script>
// @group Elements
export default {
  props: ['id', 'modelValue', 'label', 'placeholder', 'type', 'inputmode', 'autocomplete', 'color', 'disabled', 'min', 'max', 'reactive', 'name'],
  emits: ['update:modelValue', 'focus', 'blur']
}
</script>
