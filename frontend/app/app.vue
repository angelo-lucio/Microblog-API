<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTheme } from "./composables/useTheme";

useTheme();
</script>

<style>
.theme-mode-dark .arena-stage {
  filter: none;
}

.theme-mode-light.light-profile-soft .arena-stage {
  filter: brightness(1.02) saturate(0.92) contrast(0.98);
}

.theme-mode-light.light-profile-medium .arena-stage {
  filter: brightness(1.08) saturate(1.08) contrast(1.02) hue-rotate(12deg);
}

.theme-mode-light.light-profile-bright .arena-stage {
  filter: brightness(1.1) saturate(1.08) contrast(1.01) hue-rotate(12deg);
}
</style>
