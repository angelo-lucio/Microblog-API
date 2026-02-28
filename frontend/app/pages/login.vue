<template>
  <div class="min-h-screen bg-slate-900 text-emerald-400 flex items-center justify-center p-4">
    <div class="border-4 border-cyan-500 bg-slate-800 p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6 text-cyan-400 border-b-2 border-cyan-400 pb-2 font-mono">
        LOGIN
      </h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-bold text-cyan-300 font-mono" for="username">USERNAME</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border-2 border-cyan-400 bg-slate-700 text-emerald-300 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-bold text-cyan-300 font-mono" for="password">PASSWORD</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="w-full px-3 py-2 border-2 border-cyan-400 bg-slate-700 text-emerald-300 focus:outline-none font-mono"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 text-xs text-emerald-300 font-bold font-mono hover:text-emerald-200"
            >
              {{ showPassword ? '[HIDE]' : '[SHOW]' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full border-2 border-cyan-400 bg-cyan-900 hover:bg-cyan-800 py-2 font-bold text-cyan-300 mt-4 font-mono"
        >
          LOGIN
        </button>
      </form>
      <p class="mt-6 text-center text-xs text-emerald-300 border-t-2 border-cyan-400 pt-4 font-mono">
        <NuxtLink to="/forgot" class="text-emerald-400 font-bold hover:text-emerald-300">
          [FORGOT PASSWORD]
        </NuxtLink>
      </p>
      <p class="mt-4 text-center text-xs text-cyan-300 border-t-2 border-emerald-400 pt-4 font-mono">
        No account?
        <NuxtLink to="/register" class="text-emerald-400 font-bold hover:text-emerald-300">
          [REGISTER]
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
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
