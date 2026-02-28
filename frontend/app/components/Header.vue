<template>
  <header class="border-b-4 border-emerald-500 bg-slate-800 text-emerald-400">
    <div class="max-w-6xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold font-mono text-cyan-400">[MICROBLOG]</h1>
          <span
            v-if="auth.isAuthenticated() && user"
            class="text-sm font-mono text-emerald-300 border border-emerald-400 px-2 py-1"
          >
            USER: {{ user.username }}
          </span>
        </div>
        <nav class="space-x-2 font-mono">
          <NuxtLink v-if="!auth.isAuthenticated()" to="/login" class="border-2 border-emerald-400 px-3 py-1 hover:bg-emerald-900">
            [LOGIN]
          </NuxtLink>
          <NuxtLink v-if="!auth.isAuthenticated()" to="/register" class="border-2 border-cyan-400 px-3 py-1 hover:bg-cyan-900">
            [REGISTER]
          </NuxtLink>
          <NuxtLink v-if="auth.isAuthenticated()" to="/feed" class="border-2 border-emerald-400 px-3 py-1 hover:bg-emerald-900">
            [FEED]
          </NuxtLink>
          <NuxtLink v-if="auth.isAuthenticated()" to="/posts/create" class="border-2 border-cyan-400 px-3 py-1 hover:bg-cyan-900">
            [POST]
          </NuxtLink>
          <button
            v-if="auth.isAuthenticated()"
            @click="handleLogout"
            class="border-2 border-red-400 px-3 py-1 hover:bg-red-900 text-red-300"
          >
            [EXIT]
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useRouter } from "vue-router";
import { computed } from "vue";

const auth = useAuth();
const router = useRouter();
const user = computed(() => auth.getUser());

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>
