<template>
  <div class="flex min-h-full items-center justify-center px-2 py-4 md:px-4 md:py-6">
    <section
      class="grid w-full max-w-5xl grid-cols-1 overflow-hidden border lg:grid-cols-2"
      :class="isLight ? 'border-sky-400/80 bg-white/85' : 'border-cyan-500/70 bg-slate-900/90'"
    >
      <div
        class="flex flex-col justify-between border-b p-6 lg:border-b-0 lg:border-r lg:p-8"
        :class="isLight ? 'border-sky-300 bg-gradient-to-br from-sky-100 via-cyan-100 to-blue-100' : 'border-cyan-800/60 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900'"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em]" :class="isLight ? 'text-sky-700' : 'text-cyan-300'">Arena Access</p>
          <h2 class="mt-2 text-3xl font-black uppercase tracking-wide" :class="isLight ? 'text-blue-900' : 'text-emerald-200'">Login</h2>
          <p class="mt-3 text-sm leading-relaxed" :class="isLight ? 'text-slate-700' : 'text-cyan-100/90'">Join the live timeline, publish posts and monitor AI moderation in real time.</p>
        </div>
        <div class="mt-6 border p-3" :class="isLight ? 'border-sky-300 bg-white/75' : 'border-cyan-700/60 bg-slate-950/60'">
          <p class="text-[11px] uppercase tracking-wider" :class="isLight ? 'text-sky-700' : 'text-cyan-300'">Status</p>
          <p class="mt-1 text-xs" :class="isLight ? 'text-slate-700' : 'text-emerald-200'">Secure session handshake enabled</p>
        </div>
      </div>

      <div class="p-6 lg:p-8">
        <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider" :class="isLight ? 'text-blue-700' : 'text-cyan-300'" for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full border px-3 py-2 text-sm outline-none placeholder:text-slate-500"
            :class="isLight ? 'border-sky-300 bg-white text-slate-800 focus:border-blue-400' : 'border-cyan-500 bg-slate-950/70 text-emerald-100 focus:border-emerald-400'"
            placeholder="Player tag"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider" :class="isLight ? 'text-blue-700' : 'text-cyan-300'" for="password">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="w-full border px-3 py-2 text-sm outline-none"
              :class="isLight ? 'border-sky-300 bg-white text-slate-800 focus:border-blue-400' : 'border-cyan-500 bg-slate-950/70 text-emerald-100 focus:border-emerald-400'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 px-3 text-[11px] font-semibold uppercase tracking-wide"
              :class="isLight ? 'text-blue-700 hover:text-blue-900' : 'text-emerald-300 hover:text-emerald-200'"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="mt-2 w-full border py-2 text-sm font-semibold uppercase tracking-wider"
          :class="isLight ? 'border-blue-400 bg-blue-100 text-blue-900 hover:bg-blue-200' : 'border-cyan-400 bg-cyan-900/40 text-cyan-200 hover:bg-cyan-800/60'"
        >
          Enter Arena
        </button>
      </form>
      <p class="mt-5 border-t pt-4 text-center text-xs uppercase tracking-wide" :class="isLight ? 'border-sky-200 text-slate-700' : 'border-cyan-800/70 text-emerald-300'">
        <NuxtLink to="/forgot" class="font-semibold" :class="isLight ? 'text-blue-700 hover:text-blue-900' : 'text-emerald-300 hover:text-emerald-200'">
          Forgot Password
        </NuxtLink>
      </p>
      <p class="mt-3 border-t pt-4 text-center text-xs" :class="isLight ? 'border-blue-200 text-slate-700' : 'border-emerald-800/70 text-cyan-200'">
        No account yet?
        <NuxtLink to="/register" class="ml-1 font-semibold uppercase tracking-wide" :class="isLight ? 'text-blue-700 hover:text-blue-900' : 'text-cyan-300 hover:text-cyan-200'">
          Register
        </NuxtLink>
      </p>
      </div>
    </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const { isLight } = useTheme();
const auth = useAuth();
const router = useRouter();

onMounted(() => {
  if (auth.isAuthenticated()) {
    router.push('/feed');
  }
});

const handleLogin = async () => {
  try {
    await auth.login(username.value, password.value);
    router.push('/feed');
  } catch (error: any) {
    alert(error.message || 'Login failed');
  }
};
</script>
