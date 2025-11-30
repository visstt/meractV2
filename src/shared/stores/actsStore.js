import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useActsStore = create(
  persist(
    (set, get) => ({
      acts: [
        // Моковая карточка - оставляем как есть
        {
          id: 1,
          title: "Voices in the Crowd",
          description:
            "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing",
          navigator: "Graphite8",
          heroes: ["Graphite8", "NeonFox", "ShadowWeave", "EchoStorm1"],
          location: "Puerto de la Cruz (ES)",
          distance: "2,500km Away",
          upvotes: 12,
          downvotes: 12,
          liveIn: "2h 15m",
          isMock: true, // Флаг что это моковая карточка
        },
      ],

      // Хранение задач для создаваемого акта
      createActFormState: {
        tasks: [],
      },

      // Добавить новый акт
      addAct: (actData) => {
        const newAct = {
          id: Date.now(), // Простой ID на основе времени
          title: actData.title,
          description: actData.sequel || "No description provided",
          type: actData.type,
          format: actData.format,
          heroMethods: actData.heroMethods,
          navigatorMethods: actData.navigatorMethods,
          biddingTime: actData.biddingTime,
          photo: actData.photo,
          imageUrl: actData.imageUrl, // URL для отображения изображения
          userId: actData.userId,
          // Дефолтные значения для карточки
          navigator: "To be selected",
          heroes: [],
          location: "Unknown location",
          distance: "Unknown distance",
          upvotes: 0,
          downvotes: 0,
          liveIn: "Starting soon...",
          isMock: false,
        };

        set((state) => ({
          acts: [...state.acts, newAct],
        }));
      },

      // Получить все акты
      getActs: () => get().acts,

      // Очистить акты (кроме моковой)
      clearActs: () => {
        set((state) => ({
          acts: state.acts.filter((act) => act.isMock),
        }));
      },

      // Методы для управления tasks в форме создания акта
      setCreateActTasks: (tasks) => {
        set((state) => ({
          createActFormState: {
            ...state.createActFormState,
            tasks: tasks,
          },
        }));
      },

      addCreateActTask: (task) => {
        set((state) => ({
          createActFormState: {
            ...state.createActFormState,
            tasks: [...state.createActFormState.tasks, task],
          },
        }));
      },

      updateCreateActTask: (taskId, updates) => {
        set((state) => ({
          createActFormState: {
            ...state.createActFormState,
            tasks: state.createActFormState.tasks.map((t) =>
              t.id === taskId ? { ...t, ...updates } : t,
            ),
          },
        }));
      },

      deleteCreateActTask: (taskId) => {
        set((state) => ({
          createActFormState: {
            ...state.createActFormState,
            tasks: state.createActFormState.tasks.filter(
              (t) => t.id !== taskId,
            ),
          },
        }));
      },

      clearCreateActForm: () => {
        set((state) => ({
          createActFormState: {
            tasks: [],
          },
        }));
      },
    }),
    {
      name: "acts-storage",
    },
  ),
);
