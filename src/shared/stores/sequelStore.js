import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSequelStore = create(
  persist(
    (set, get) => ({
      selectedSequelId: null,
      selectedSequel: null,

      selectedIntroId: null,
      selectedIntro: null,

      selectedOutroId: null,
      selectedOutro: null,

      selectedMusicIds: [],
      selectedMusic: [],

      selectedEffect: null,

      setSelectedSequel: (sequel) => {
        set({
          selectedSequelId: sequel?.id || null,
          selectedSequel: sequel,
        });
      },

      clearSelectedSequel: () => {
        set({
          selectedSequelId: null,
          selectedSequel: null,
        });
      },

      setSelectedIntro: (intro) => {
        set({
          selectedIntroId: intro?.id || null,
          selectedIntro: intro,
        });
      },

      clearSelectedIntro: () => {
        set({
          selectedIntroId: null,
          selectedIntro: null,
        });
      },

      setSelectedOutro: (outro) => {
        set({
          selectedOutroId: outro?.id || null,
          selectedOutro: outro,
        });
      },

      clearSelectedOutro: () => {
        set({
          selectedOutroId: null,
          selectedOutro: null,
        });
      },

      toggleSelectedMusic: (music) => {
        const state = get();
        const isSelected = state.selectedMusicIds.includes(music.id);

        if (isSelected) {
          set({
            selectedMusicIds: state.selectedMusicIds.filter(
              (id) => id !== music.id,
            ),
            selectedMusic: state.selectedMusic.filter((m) => m.id !== music.id),
          });
        } else {
          set({
            selectedMusicIds: [...state.selectedMusicIds, music.id],
            selectedMusic: [...state.selectedMusic, music],
          });
        }
      },

      setSelectedMusic: (musicArray) => {
        const musicList = Array.isArray(musicArray) ? musicArray : [musicArray];
        set({
          selectedMusicIds: musicList.map((m) => m?.id).filter(Boolean),
          selectedMusic: musicList.filter(Boolean),
        });
      },

      clearSelectedMusic: () => {
        set({
          selectedMusicIds: [],
          selectedMusic: [],
        });
      },

      setSelectedEffect: (effectId) => {
        set({
          selectedEffect: effectId,
        });
      },

      clearSelectedEffect: () => {
        set({
          selectedEffect: null,
        });
      },

      clearAll: () => {
        set({
          selectedSequelId: null,
          selectedSequel: null,
          selectedIntroId: null,
          selectedIntro: null,
          selectedOutroId: null,
          selectedOutro: null,
          selectedMusicIds: [],
          selectedMusic: [],
          selectedEffect: null,
        });
      },

      getSelectedSequel: () => {
        const state = get();
        return {
          id: state.selectedSequelId,
          sequel: state.selectedSequel,
        };
      },

      getSelectedIntro: () => {
        const state = get();
        return {
          id: state.selectedIntroId,
          intro: state.selectedIntro,
        };
      },

      getSelectedOutro: () => {
        const state = get();
        return {
          id: state.selectedOutroId,
          outro: state.selectedOutro,
        };
      },

      getSelectedMusic: () => {
        const state = get();
        return {
          ids: state.selectedMusicIds,
          music: state.selectedMusic,
        };
      },

      getSelectedEffect: () => {
        const state = get();
        return state.selectedEffect;
      },
    }),
    {
      name: "meract-scene-store",
      version: 1,
      migrate: (persistedState, version) => {
        if (persistedState && !Array.isArray(persistedState.selectedMusic)) {
          const oldMusic = persistedState.selectedMusic;
          return {
            ...persistedState,
            selectedMusicIds: oldMusic ? [oldMusic.id] : [],
            selectedMusic: oldMusic ? [oldMusic] : [],
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        selectedSequelId: state.selectedSequelId,
        selectedSequel: state.selectedSequel,
        selectedIntroId: state.selectedIntroId,
        selectedIntro: state.selectedIntro,
        selectedOutroId: state.selectedOutroId,
        selectedOutro: state.selectedOutro,
        selectedMusicIds: state.selectedMusicIds,
        selectedMusic: state.selectedMusic,
        selectedEffect: state.selectedEffect,
      }),
    },
  ),
);
