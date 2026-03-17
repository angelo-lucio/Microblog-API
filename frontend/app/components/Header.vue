<template>
  <header
    class="relative border-b"
    :class="isLight ? 'border-sky-400/80 bg-sky-100/95 text-slate-800' : 'border-cyan-500/70 bg-slate-900/95 text-cyan-100'"
  >
    <div class="mx-auto w-full max-w-[1500px] px-4 py-3 md:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 md:gap-4">
          <h1 class="text-xl font-black tracking-widest md:text-2xl" :class="isLight ? 'text-sky-700' : 'text-cyan-300'">MICROBLOG ARENA</h1>
          <div
            v-if="loggedIn && user"
            class="flex items-center gap-2 border px-2 py-1"
            :class="isLight ? 'border-blue-300 bg-white/80' : 'border-emerald-400/80 bg-slate-800/90'"
          >
            <img
              :src="avatarUrl(user.username)"
              :alt="`Avatar ${user.username}`"
              class="h-8 w-8 border border-cyan-400 object-cover"
            />
            <span class="text-xs font-semibold uppercase tracking-wide md:text-sm" :class="isLight ? 'text-blue-700' : 'text-emerald-300'">
              {{ user.username }}
            </span>
          </div>
        </div>
        <nav class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider md:text-sm">
          <button
            @click="toggleTheme"
            class="border px-3 py-1"
            :class="isLight ? 'border-slate-400 bg-slate-200/80 text-slate-800 hover:bg-slate-100/90' : 'border-yellow-300 bg-yellow-900/30 text-yellow-200 hover:bg-yellow-800/50'"
          >
            {{ mode === 'dark' ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <div v-if="isLight" class="flex items-center gap-1 border border-blue-300/80 bg-white/70 px-1 py-1 text-[10px]">
            <button
              @click="setLightProfile('soft')"
              class="border px-2 py-[2px]"
              :class="profile === 'soft' ? 'border-blue-500 bg-blue-200 text-blue-900' : 'border-blue-300 bg-sky-50 text-blue-700 hover:bg-blue-100'"
            >
              Soft
            </button>
            <button
              @click="setLightProfile('medium')"
              class="border px-2 py-[2px]"
              :class="profile === 'medium' ? 'border-amber-500 bg-amber-200 text-amber-900' : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'"
            >
              Medium
            </button>
            <button
              @click="setLightProfile('bright')"
              class="border px-2 py-[2px]"
              :class="profile === 'bright' ? 'border-red-500 bg-red-200 text-red-900' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'"
            >
              Bright
            </button>
          </div>
          <NuxtLink
            v-if="!loggedIn"
            to="/login"
            class="border px-3 py-1"
            :class="isLight ? 'border-blue-400 bg-blue-100 text-blue-800 hover:bg-blue-200' : 'border-emerald-400 bg-emerald-900/30 hover:bg-emerald-800/50'"
          >
            Login
          </NuxtLink>
          <NuxtLink
            v-if="!loggedIn"
            to="/register"
            class="border px-3 py-1"
            :class="isLight ? 'border-yellow-400 bg-yellow-100 text-yellow-900 hover:bg-yellow-200' : 'border-cyan-400 bg-cyan-900/30 hover:bg-cyan-800/50'"
          >
            Register
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn"
            to="/feed"
            class="border px-3 py-1"
            :class="isLight ? 'border-green-400 bg-green-100 text-green-900 hover:bg-green-200' : 'border-emerald-400 bg-emerald-900/30 hover:bg-emerald-800/50'"
          >
            Feed
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn"
            to="/posts/create"
            class="border px-3 py-1"
            :class="isLight ? 'border-purple-400 bg-purple-100 text-purple-900 hover:bg-purple-200' : 'border-cyan-400 bg-cyan-900/30 hover:bg-cyan-800/50'"
          >
            New Post
          </NuxtLink>
          <button
            v-if="loggedIn"
            @click="handleLogout"
            class="border px-3 py-1"
            :class="isLight ? 'border-rose-300 bg-rose-100/80 text-rose-700 hover:bg-rose-50/90' : 'border-red-400 bg-red-900/30 text-red-200 hover:bg-red-800/50'"
          >
            Exit
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";
import { useRouter } from "vue-router";
import { computed } from "vue";

const auth = useAuth();
const { mode, isLight, profile, setLightProfile, toggleTheme } = useTheme();
const router = useRouter();

// Reactive: reads from the module-level singleton ref in useAuth
const user = computed(() => auth.getUser());
const loggedIn = computed(() => !!user.value);

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

const avatarUrl = (username: string) => {
  const safeSeed = encodeURIComponent(username || "pilot");
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${safeSeed}`;
};
</script>
