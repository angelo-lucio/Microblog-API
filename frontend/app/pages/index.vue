<template>
  <div class="min-h-screen bg-slate-900 text-emerald-400 flex flex-col items-center justify-center p-6">
    <div class="border-4 border-emerald-500 bg-slate-800 p-12 w-full max-w-2xl">
      <h1 class="text-4xl font-bold mb-6 text-center text-cyan-400 font-mono">
        MICROBLOG
      </h1>
      <p class="mb-8 text-center font-mono text-emerald-300">
        A retro social network. Log in or register to get started.
      </p>
      <div class="space-y-4">
        <NuxtLink
          to="/login"
          class="block border-2 border-emerald-400 bg-slate-700 hover:bg-slate-600 py-4 px-4 text-center text-emerald-300 font-bold text-lg font-mono"
        >
          [LOGIN]
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="block border-2 border-cyan-400 bg-slate-700 hover:bg-slate-600 py-4 px-4 text-center text-cyan-300 font-bold text-lg font-mono"
        >
          [REGISTER]
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const auth = useAuth();
const router = useRouter();

onMounted(() => {
  if (auth.isAuthenticated()) {
    router.push("/feed");
  }
});
</script>
