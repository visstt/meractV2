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
    }),
    {
      name: "acts-storage",
    },
  ),
);
