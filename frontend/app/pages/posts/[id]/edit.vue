<template>
  <div class="flex min-h-full items-center justify-center px-2 py-4 md:px-4 md:py-6">
    <section
      class="grid w-full max-w-6xl grid-cols-1 overflow-hidden border xl:grid-cols-[1.2fr_0.8fr]"
      :class="isLight ? 'border-blue-400/80 bg-white/85' : 'border-cyan-500/70 bg-slate-900/90'"
    >
      <div class="p-6 lg:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.25em]" :class="isLight ? 'text-blue-700' : 'text-cyan-300'">Patch Notes</p>
        <h2 class="mt-2 text-3xl font-black uppercase tracking-wide" :class="isLight ? 'text-blue-900' : 'text-emerald-200'">Edit Post</h2>
        <p class="mt-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-cyan-100/90'">After saving, AI moderation runs again and refreshes sentiment/correction.</p>

        <form @submit.prevent="submit" class="mt-6 space-y-4">
        <textarea
          v-model="content"
          rows="10"
          required
          class="w-full border p-3 text-sm leading-relaxed outline-none"
          :class="isLight ? 'border-blue-300 bg-white text-slate-800 focus:border-blue-500' : 'border-cyan-500 bg-slate-950/70 text-emerald-100 focus:border-emerald-400'"
        ></textarea>
        <button
          type="submit"
          class="w-full border py-2 text-sm font-semibold uppercase tracking-wider"
          :class="isLight ? 'border-blue-400 bg-blue-100 text-blue-900 hover:bg-blue-200' : 'border-cyan-400 bg-cyan-900/40 text-cyan-200 hover:bg-cyan-800/60'"
        >
          Save Changes
        </button>
      </form>

      </div>

      <aside
        class="border-t p-6 xl:border-l xl:border-t-0 lg:p-8"
        :class="isLight ? 'border-blue-300 bg-gradient-to-b from-sky-100 to-cyan-100' : 'border-emerald-800/60 bg-gradient-to-b from-emerald-950/20 to-slate-900'"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.2em]" :class="isLight ? 'text-blue-700' : 'text-emerald-300'">AI Recheck</p>
        <ul class="mt-3 space-y-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-emerald-100/90'">
          <li>Sentiment returns to pending while checking.</li>
          <li>Feed auto-refresh updates status after analysis.</li>
          <li>Correction appears if content needs adjustment.</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuth();
const { isLight } = useTheme();
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
    console.error(e);
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
    console.error(e);
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
