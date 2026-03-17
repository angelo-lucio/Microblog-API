<template>
  <div class="flex min-h-full items-center justify-center px-2 py-4 md:px-4 md:py-6">
    <section
      class="grid w-full max-w-6xl grid-cols-1 overflow-hidden border xl:grid-cols-[1.2fr_0.8fr]"
      :class="isLight ? 'border-blue-400/80 bg-white/85' : 'border-emerald-500/70 bg-slate-900/90'"
    >
      <div class="p-6 lg:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.25em]" :class="isLight ? 'text-blue-700' : 'text-emerald-300'">Broadcast</p>
        <h2 class="mt-2 text-3xl font-black uppercase tracking-wide" :class="isLight ? 'text-blue-900' : 'text-cyan-200'">Create Post</h2>
        <p class="mt-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-emerald-100/90'">Write your message. AI moderation starts automatically after publishing.</p>

        <form @submit.prevent="submit" class="mt-6 space-y-4">
        <textarea
          v-model="content"
          rows="10"
          required
          class="w-full border p-3 text-sm leading-relaxed outline-none placeholder:text-slate-500"
          :class="isLight ? 'border-blue-300 bg-white text-slate-800 focus:border-blue-500' : 'border-emerald-500 bg-slate-950/70 text-emerald-100 focus:border-cyan-400'"
          placeholder="Share your update with the arena..."
        ></textarea>
        <button
          type="submit"
          class="w-full border py-2 text-sm font-semibold uppercase tracking-wider"
          :class="isLight ? 'border-blue-400 bg-blue-100 text-blue-900 hover:bg-blue-200' : 'border-emerald-400 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60'"
        >
          Publish Post
        </button>
      </form>

      </div>

      <aside
        class="border-t p-6 xl:border-l xl:border-t-0 lg:p-8"
        :class="isLight ? 'border-blue-300 bg-gradient-to-b from-sky-100 to-blue-100' : 'border-cyan-800/60 bg-gradient-to-b from-cyan-950/30 to-slate-900'"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.2em]" :class="isLight ? 'text-blue-700' : 'text-cyan-300'">Tips</p>
        <ul class="mt-3 space-y-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-cyan-100/90'">
          <li>Keep it concise for better readability.</li>
          <li>Unsafe content can be flagged by AI guard.</li>
          <li>Factually wrong claims may receive correction text.</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const { isLight } = useTheme();
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
