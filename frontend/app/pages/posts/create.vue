<template>
  <div class="min-h-screen bg-slate-900 text-emerald-400 flex items-center justify-center p-4">
    <div class="border-4 border-emerald-500 bg-slate-800 p-8 w-full max-w-lg">
      <h2 class="text-2xl font-bold text-center mb-6 text-cyan-400 border-b-2 border-emerald-400 pb-2 font-mono">
        CREATE POST
      </h2>
      <form @submit.prevent="submit" class="space-y-4">
        <textarea
          v-model="content"
          rows="8"
          required
          class="w-full p-3 border-2 border-emerald-400 bg-slate-700 text-emerald-300 focus:outline-none font-mono"
          placeholder="What's on your mind?"
        ></textarea>
        <button
          type="submit"
          class="w-full border-2 border-emerald-400 bg-emerald-900 hover:bg-emerald-800 py-2 font-bold text-emerald-300 font-mono"
        >
          PUBLISH
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const content = ref('');
const router = useRouter();
const { baseUrl, authFetch } = useApi();

const submit = async () => {
  try {
    await authFetch(`${baseUrl}/posts`, {
      method: 'POST',
      body: { content: content.value },
    });
    router.push('/feed');
  } catch (e) {
    console.error(e);
    alert('Failed to create post');
  }
};

onMounted(() => {
  if (!auth.isAuthenticated()) {
    router.push('/login');
  }
});
</script>
