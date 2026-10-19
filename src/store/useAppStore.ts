import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { Reel } from '../../types/Reel';

type State = {
  hasOnboarded: boolean;
  isPro: boolean;
  notificationsEnabled: boolean;
  installedPacks: string[];
  selectedTemplateId: string | null;
  selectedVideos: string[];
  clipDurations: Record<string, number>;
  focusedClipIndex: number;
  intensity: number;
  mustUse: string[];
  mustAvoid: string[];
  reels: Reel[];
  language: string;

  setOnboarded: (v: boolean) => void;
  setPro: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  installPack: (id: string) => void;
  uninstallPack: (id: string) => void;
  loadReelForEdit: (reel: Reel) => void;
  setSelectedTemplate: (id: string) => void;
  setSelectedVideos: (uris: string[]) => void;
  setClipDurations: (durations: Record<string, number>) => void;
  setFocusedClipIndex: (i: number) => void;
  addVideo: (uri: string) => void;
  removeVideo: (uri: string) => void;
  setIntensity: (n: number) => void;
  toggleMustUse: (uri: string) => void;
  toggleMustAvoid: (uri: string) => void;
  addReel: (reel: Reel) => void;
  setLanguage: (lang: string) => void;
  resetEditor: () => void;
};

export const useAppStore = create<State>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      isPro: false,
      notificationsEnabled: true,
      installedPacks: [],
      selectedTemplateId: null,
      selectedVideos: [],
      clipDurations: {},
      focusedClipIndex: 0,
      intensity: 5,
      mustUse: [],
      mustAvoid: [],
      reels: [],
      language: 'en',

      setOnboarded: (v) => set({ hasOnboarded: v }),
      setPro: (v) => set({ isPro: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      installPack: (id) =>
        set((s) =>
          s.installedPacks.includes(id)
            ? s
            : { installedPacks: [...s.installedPacks, id] }
        ),

      uninstallPack: (id) =>
        set((s) => ({
          installedPacks: s.installedPacks.filter((p) => p !== id),
        })),

      loadReelForEdit: (reel) => {
        const durations: Record<string, number> = {};
        reel.videoUris.forEach((uri) => {
          durations[uri] = 15;
        });

        set({
          selectedTemplateId: reel.templateId,
          selectedVideos: reel.videoUris,
          clipDurations: durations,
          mustUse: reel.mustUse,
          mustAvoid: reel.mustAvoid,
          intensity: reel.intensity,
          focusedClipIndex: 0,
        });
      },

      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),

      setSelectedVideos: (uris) =>
        set({
          selectedVideos: uris,
          mustUse: [],
          mustAvoid: [],
          focusedClipIndex: 0,
        }),

      setClipDurations: (durations) => set({ clipDurations: durations }),
      setFocusedClipIndex: (i) => set({ focusedClipIndex: i }),

      addVideo: (uri) =>
        set((s) =>
          s.selectedVideos.includes(uri)
            ? s
            : { selectedVideos: [...s.selectedVideos, uri] }
        ),

      removeVideo: (uri) =>
        set((s) => {
          const newVideos = s.selectedVideos.filter((u) => u !== uri);
          const newDurations = { ...s.clipDurations };
          delete newDurations[uri];
          return {
            selectedVideos: newVideos,
            mustUse: s.mustUse.filter((u) => u !== uri),
            mustAvoid: s.mustAvoid.filter((u) => u !== uri),
            clipDurations: newDurations,
            focusedClipIndex: Math.min(
              s.focusedClipIndex,
              Math.max(0, newVideos.length - 1)
            ),
          };
        }),

      setIntensity: (n) => set({ intensity: n }),

      toggleMustUse: (uri) =>
        set((s) => ({
          mustUse: s.mustUse.includes(uri)
            ? s.mustUse.filter((u) => u !== uri)
            : [...s.mustUse, uri],
          mustAvoid: s.mustAvoid.filter((u) => u !== uri),
        })),

      toggleMustAvoid: (uri) =>
        set((s) => ({
          mustAvoid: s.mustAvoid.includes(uri)
            ? s.mustAvoid.filter((u) => u !== uri)
            : [...s.mustAvoid, uri],
          mustUse: s.mustUse.filter((u) => u !== uri),
        })),

      addReel: (reel) => set((s) => ({ reels: [reel, ...s.reels] })),

      setLanguage: (language) => {
        if (language === 'ar') {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);
        } else {
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
        }
        set({ language });
      },

      resetEditor: () =>
        set({
          selectedVideos: [],
          mustUse: [],
          mustAvoid: [],
          intensity: 5,
          clipDurations: {},
          focusedClipIndex: 0,
        }),
    }),
    {
      name: 'roamcut-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);