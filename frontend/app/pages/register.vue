<template>
  <div class="flex min-h-full items-center justify-center px-2 py-4 md:px-4 md:py-6">
    <section
      class="grid w-full max-w-5xl grid-cols-1 overflow-hidden border lg:grid-cols-2"
      :class="isLight ? 'border-blue-400/80 bg-white/85' : 'border-emerald-500/70 bg-slate-900/90'"
    >
      <div
        class="flex flex-col justify-between border-b p-6 lg:border-b-0 lg:border-r lg:p-8"
        :class="isLight ? 'border-blue-300 bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100' : 'border-emerald-800/60 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900'"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em]" :class="isLight ? 'text-blue-700' : 'text-emerald-300'">New Pilot</p>
          <h2 class="mt-2 text-3xl font-black uppercase tracking-wide" :class="isLight ? 'text-blue-900' : 'text-cyan-200'">Create Account</h2>
          <p class="mt-3 text-sm leading-relaxed" :class="isLight ? 'text-slate-700' : 'text-emerald-100/90'">Set your player identity and enter the Microblog Arena with AI-protected posting.</p>
        </div>
        <div class="mt-6 border p-3" :class="isLight ? 'border-blue-300 bg-white/75' : 'border-emerald-700/60 bg-slate-950/60'">
          <p class="text-[11px] uppercase tracking-wider" :class="isLight ? 'text-blue-700' : 'text-emerald-300'">Preview Avatar</p>
          <div class="mt-2 flex items-center gap-3">
            <img :src="avatarUrl" alt="Avatar preview" class="h-12 w-12 border object-cover" :class="isLight ? 'border-blue-400' : 'border-cyan-400'" />
            <p class="text-xs" :class="isLight ? 'text-slate-700' : 'text-cyan-200'">Theoretical profile image, can be replaced later with uploads.</p>
          </div>
        </div>
      </div>

      <div class="p-6 lg:p-8">
        <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider" :class="isLight ? 'text-blue-700' : 'text-emerald-300'" for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full border px-3 py-2 text-sm outline-none placeholder:text-slate-500"
            :class="isLight ? 'border-blue-300 bg-white text-slate-800 focus:border-blue-500' : 'border-emerald-500 bg-slate-950/70 text-emerald-100 focus:border-cyan-400'"
            placeholder="Choose a player tag"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider" :class="isLight ? 'text-blue-700' : 'text-emerald-300'" for="password">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="w-full border px-3 py-2 text-sm outline-none"
              :class="isLight ? 'border-blue-300 bg-white text-slate-800 focus:border-blue-500' : 'border-emerald-500 bg-slate-950/70 text-emerald-100 focus:border-cyan-400'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 px-3 text-[11px] font-semibold uppercase tracking-wide"
              :class="isLight ? 'text-blue-700 hover:text-blue-900' : 'text-cyan-300 hover:text-cyan-200'"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-emerald-300" for="confirmPassword">Confirm Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              class="w-full border px-3 py-2 text-sm outline-none"
              :class="confirmMismatch
                ? (isLight ? 'border-rose-400 bg-rose-100 text-rose-900' : 'border-red-400 bg-red-950/40 text-red-200')
                : (isLight ? 'border-blue-300 bg-white text-slate-800 focus:border-blue-500' : 'border-emerald-500 bg-slate-950/70 text-emerald-100 focus:border-cyan-400')"
            />
          </div>
          <p v-if="confirmMismatch" class="mt-1 text-xs font-semibold uppercase tracking-wide" :class="isLight ? 'text-rose-700' : 'text-red-300'">
            Passwords do not match
          </p>
        </div>

        <button
          type="submit"
          :disabled="confirmMismatch"
          class="mt-2 w-full border py-2 text-sm font-semibold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
          :class="isLight ? 'border-blue-400 bg-blue-100 text-blue-900 hover:bg-blue-200' : 'border-emerald-400 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60'"
        >
          Register Pilot
        </button>
      </form>
      <p class="mt-5 border-t pt-4 text-center text-xs" :class="isLight ? 'border-blue-200 text-slate-700' : 'border-emerald-800/70 text-emerald-300'">
        Already onboard?
        <NuxtLink to="/login" class="ml-1 font-semibold uppercase tracking-wide" :class="isLight ? 'text-blue-700 hover:text-blue-900' : 'text-cyan-300 hover:text-cyan-200'">
          Login
        </NuxtLink>
      </p>
      </div>
    </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';


const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const { isLight } = useTheme();
const auth = useAuth();
const router = useRouter();

const confirmMismatch = computed(
  () => confirmPassword.value.length > 0 && password.value !== confirmPassword.value
);

const avatarUrl = computed(() => {
  const seed = encodeURIComponent(username.value || 'new-pilot');
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
});

onMounted(() => {
  if (auth.isAuthenticated()) router.push('/feed');
});

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('[ERROR] Passwords do not match!');
    return;
  }
  try {
    await auth.register(username.value, password.value);
    router.push('/feed');
  } catch (error: any) {
    alert((error as any)?.data?.error || (error as any).message || 'Registration failed');
  }
};
</script>
