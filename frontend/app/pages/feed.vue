<template>
  <div class="min-h-screen bg-slate-900 text-emerald-400 p-6">
    <div class="max-w-2xl mx-auto">
      <div class="border-4 border-emerald-500 bg-slate-800 p-6 mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-cyan-400 font-mono">FEED</h1>
          <NuxtLink to="/posts/create" class="border-2 border-emerald-400 bg-emerald-900 hover:bg-emerald-800 px-4 py-2 text-emerald-300 font-mono font-bold text-sm">
            [NEW POST]
          </NuxtLink>
        </div>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="p in posts"
          :key="p.id"
          class="border-2 border-emerald-400 bg-slate-800 p-4"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="whitespace-pre-wrap text-emerald-300 font-mono mb-2">{{ p.content }}</p>
              <div class="text-xs text-cyan-300 font-mono">
                [BY: {{ p.username }}]
              </div>
              
              <!-- Sentiment Display -->
              <div v-if="p.sentiment" class="mt-2 text-xs font-mono">
                <span v-if="p.sentiment === 'ok'" class="text-emerald-400 border border-emerald-400 px-2 py-1">[OK]</span>
                <span v-else class="text-yellow-500 border border-yellow-500 px-2 py-1">[FLAGGED: {{ p.sentiment }}]</span>
              </div>
            </div>
            
            <div v-if="user && user.id === p.userId" class="flex flex-col gap-2 ml-4">
              <NuxtLink :to="`/posts/${p.id}/edit`" class="border border-cyan-400 bg-cyan-900 hover:bg-cyan-800 px-2 py-1 text-cyan-300 text-xs font-mono">
                [EDIT]
              </NuxtLink>
              <button @click="deletePost(p.id)" class="border border-red-400 bg-red-900 hover:bg-red-800 px-2 py-1 text-red-300 text-xs font-mono">
                [DEL]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuth();
const { baseUrl, authFetch } = useApi();
const posts = ref<any[]>([]);
const user = ref(auth.getUser());

const fetchPosts = async () => {
  try {
    const result = await authFetch<any[]>(`${baseUrl}/posts`);
    posts.value = result;
  } catch (e) {
    console.error(e);
  }
};

const deletePost = async (id: number) => {
  if (!confirm('DELETE THIS POST?')) return;
  try {
    await authFetch(`${baseUrl}/posts/${id}`, { method: 'DELETE' });
    posts.value = posts.value.filter(p => p.id !== id);
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  if (!auth.isAuthenticated()) {
    router.push('/login');
    return;
  }
  fetchPosts();
});
</script>
