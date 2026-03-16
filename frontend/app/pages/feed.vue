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
              <!-- Post content -->
              <p class="whitespace-pre-wrap text-emerald-300 font-mono mb-3">{{ p.content }}</p>

              <!-- Meta info: owner name + IDs -->
              <div class="text-xs font-mono space-y-1 text-cyan-300 border-t border-slate-600 pt-2">
                <span class="mr-4">[POST #{{ p.id }}]</span>
                <span class="mr-4">[OWNER: {{ p.username || p.authorName || ('USER#' + p.userId) }}]</span>
                <span>[UID: {{ p.userId }}]</span>
              </div>

              <!-- Sentiment -->
              <div v-if="p.sentiment" class="mt-2 text-xs font-mono">
                <span v-if="p.sentiment === 'ok'" class="text-emerald-400 border border-emerald-400 px-2 py-1">[OK]</span>
                <span v-else class="text-yellow-500 border border-yellow-500 px-2 py-1">[FLAGGED: {{ p.sentiment }}]</span>
              </div>
            </div>

            <!-- Owner actions -->
            <div v-if="currentUser && currentUser.id === p.userId" class="flex flex-col gap-2 ml-4 shrink-0">
              <NuxtLink :to="`/posts/${p.id}/edit`" class="border border-cyan-400 bg-cyan-900 hover:bg-cyan-800 px-2 py-1 text-cyan-300 text-xs font-mono text-center">
                [EDIT]
              </NuxtLink>
              <button @click="deletePost(p.id)" class="border border-red-400 bg-red-900 hover:bg-red-800 px-2 py-1 text-red-300 text-xs font-mono">
                [DEL]
              </button>
            </div>
          </div>
        </div>

        <p v-if="posts.length === 0" class="text-center text-emerald-300 font-mono border-2 border-emerald-400 p-6">
          [NO POSTS FOUND]
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';



const router = useRouter();
const auth = useAuth();
const { baseUrl, authFetch } = useApi();
const posts = ref<any[]>([]);
const currentUser = computed(() => auth.getUser());
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const fetchPosts = async () => {
  try {
    const result = await authFetch<any[]>(`${baseUrl}/posts`);
    posts.value = result;
  } catch (e) {
    console.error(e);
  }
};

const startAutoRefresh = () => {
  if (refreshTimer) return;
  // Fast background refresh so sentiment flags update automatically.
  refreshTimer = setInterval(() => {
    void fetchPosts();
  }, 2500);
};

const stopAutoRefresh = () => {
  if (!refreshTimer) return;
  clearInterval(refreshTimer);
  refreshTimer = null;
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
  void fetchPosts();
  startAutoRefresh();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>
