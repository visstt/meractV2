import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSequelStore = create(
  persist(
    (set, get) => ({
      // Sequel
      selectedSequelId: null,
      selectedSequel: null,

      // Intro
      selectedIntroId: null,
      selectedIntro: null,

      // Outro
      selectedOutroId: null,
      selectedOutro: null,

      // Music (массив для множественного выбора)
      selectedMusicIds: [],
      selectedMusic: [],

      // Устанавливаем выбранный сиквел
      setSelectedSequel: (sequel) => {
        set({
          selectedSequelId: sequel?.id || null,
          selectedSequel: sequel,
        });
      },

      // Очищаем выбранный сиквел
      clearSelectedSequel: () => {
        set({
          selectedSequelId: null,
          selectedSequel: null,
        });
      },

      // Устанавливаем выбранное intro
      setSelectedIntro: (intro) => {
        set({
          selectedIntroId: intro?.id || null,
          selectedIntro: intro,
        });
      },

      // Очищаем выбранное intro
      clearSelectedIntro: () => {
        set({
          selectedIntroId: null,
          selectedIntro: null,
        });
      },

      // Устанавливаем выбранное outro
      setSelectedOutro: (outro) => {
        set({
          selectedOutroId: outro?.id || null,
          selectedOutro: outro,
        });
      },

      // Очищаем выбранное outro
      clearSelectedOutro: () => {
        set({
          selectedOutroId: null,
          selectedOutro: null,
        });
      },

      // Добавляем или удаляем музыку из выбранных
      toggleSelectedMusic: (music) => {
        const state = get();
        const isSelected = state.selectedMusicIds.includes(music.id);

        if (isSelected) {
          // Удаляем музыку из выбранных
          set({
            selectedMusicIds: state.selectedMusicIds.filter(
              (id) => id !== music.id,
            ),
            selectedMusic: state.selectedMusic.filter((m) => m.id !== music.id),
          });
        } else {
          // Добавляем музыку к выбранным
          set({
            selectedMusicIds: [...state.selectedMusicIds, music.id],
            selectedMusic: [...state.selectedMusic, music],
          });
        }
      },

      // Устанавливаем массив выбранной музыки
      setSelectedMusic: (musicArray) => {
        const musicList = Array.isArray(musicArray) ? musicArray : [musicArray];
        set({
          selectedMusicIds: musicList.map((m) => m?.id).filter(Boolean),
          selectedMusic: musicList.filter(Boolean),
        });
      },

      // Очищаем выбранную музыку
      clearSelectedMusic: () => {
        set({
          selectedMusicIds: [],
          selectedMusic: [],
        });
      },

      // Очищаем все выбранные элементы
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
        });
      },

      // Получаем выбранный сиквел
      getSelectedSequel: () => {
        const state = get();
        return {
          id: state.selectedSequelId,
          sequel: state.selectedSequel,
        };
      },

      // Получаем выбранное intro
      getSelectedIntro: () => {
        const state = get();
        return {
          id: state.selectedIntroId,
          intro: state.selectedIntro,
        };
      },

      // Получаем выбранное outro
      getSelectedOutro: () => {
        const state = get();
        return {
          id: state.selectedOutroId,
          outro: state.selectedOutro,
        };
      },

      // Получаем выбранную музыку
      getSelectedMusic: () => {
        const state = get();
        return {
          ids: state.selectedMusicIds,
          music: state.selectedMusic,
        };
      },
    }),
    {
      name: "meract-scene-store",
      version: 1, // Добавляем версию для миграции
      migrate: (persistedState, version) => {
        // Миграция старых данных: если selectedMusic не массив, конвертируем
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
      }),
    },
  ),
);
