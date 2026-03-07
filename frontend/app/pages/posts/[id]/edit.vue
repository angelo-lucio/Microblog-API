<template>
  <div class="min-h-screen bg-slate-900 text-emerald-400 flex items-center justify-center p-4">
    <div class="border-4 border-cyan-500 bg-slate-800 p-8 w-full max-w-lg">
      <h2 class="text-2xl font-bold text-center mb-6 text-cyan-400 border-b-2 border-cyan-400 pb-2 font-mono">
        EDIT POST
      </h2>
      <form @submit.prevent="submit" class="space-y-4">
        <textarea
          v-model="content"
          rows="8"
          required
          class="w-full p-3 border-2 border-cyan-400 bg-slate-700 text-emerald-300 focus:outline-none font-mono"
        ></textarea>
        <button
          type="submit"
          class="w-full border-2 border-cyan-400 bg-cyan-900 hover:bg-cyan-800 py-2 font-bold text-cyan-300 font-mono"
        >
          SAVE CHANGES
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const { baseUrl, authFetch } = useApi();
const content = ref('');
const id = Number(route.params.id);

const loadPost = async () => {
  try {
    const found = await authFetch<any>(`${baseUrl}/posts/${id}`);
    content.value = found.content;
  } catch (e: any) {
    logger.error(e);
    router.push('/feed');
  }
};

const submit = async () => {
  try {
    await authFetch(`${baseUrl}/posts/${id}`, {
      method: 'PUT',
      body: { content: content.value },
    });
    router.push('/feed');
  } catch (e) {
    logger.error(e);
    alert('Failed to update post');
  }
};

onMounted(() => {
  if (!auth.isAuthenticated()) {
    router.push('/login');
    return;
  }
  loadPost();
});
</script>
