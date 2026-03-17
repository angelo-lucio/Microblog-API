import { computed, ref } from "vue";

type ThemeMode = "dark" | "light";
type LightProfile = "soft" | "medium" | "bright";

const THEME_KEY = "microblog_theme_mode";
const LIGHT_PROFILE_KEY = "microblog_light_profile";
const themeMode = ref<ThemeMode>("dark");
const lightProfile = ref<LightProfile>("medium");
let initialized = false;

const applyThemeClass = (mode: ThemeMode, profile: LightProfile) => {
  if (!process.client) return;
  const root = document.documentElement;
  root.classList.toggle("theme-mode-light", mode === "light");
  root.classList.toggle("theme-mode-dark", mode === "dark");
  root.classList.remove("light-profile-soft", "light-profile-medium", "light-profile-bright");
  root.classList.add(`light-profile-${profile}`);
};

const initTheme = () => {
  if (!process.client || initialized) return;
  const storedTheme = localStorage.getItem(THEME_KEY);
  const storedProfile = localStorage.getItem(LIGHT_PROFILE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    themeMode.value = storedTheme;
  }
  if (storedProfile === "soft" || storedProfile === "medium" || storedProfile === "bright") {
    lightProfile.value = storedProfile;
  }
  applyThemeClass(themeMode.value, lightProfile.value);
  initialized = true;
};

export const useTheme = () => {
  initTheme();

  const mode = computed(() => themeMode.value);
  const isLight = computed(() => themeMode.value === "light");
  const profile = computed(() => lightProfile.value);

  const setTheme = (modeValue: ThemeMode) => {
    themeMode.value = modeValue;
    if (process.client) {
      localStorage.setItem(THEME_KEY, modeValue);
    }
    applyThemeClass(modeValue, lightProfile.value);
  };

  const setLightProfile = (profileValue: LightProfile) => {
    lightProfile.value = profileValue;
    if (process.client) {
      localStorage.setItem(LIGHT_PROFILE_KEY, profileValue);
    }
    applyThemeClass(themeMode.value, profileValue);
  };

  const toggleTheme = () => {
    setTheme(themeMode.value === "dark" ? "light" : "dark");
  };

  return {
    mode,
    isLight,
    profile,
    setTheme,
    setLightProfile,
    toggleTheme,
  };
};
