import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useActsStore = create(
  persist(
    (set, get) => ({
      acts: [
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
          isMock: true, 
        },
      ],

      createActFormState: {
        tasks: [],
      },

      addAct: (actData) => {
        const newAct = {
          id: Date.now(), 
          title: actData.title,
          description: actData.sequel || "No description provided",
          type: actData.type,
          format: actData.format,
          heroMethods: actData.heroMethods,
          navigatorMethods: actData.navigatorMethods,
          biddingTime: actData.biddingTime,
          photo: actData.photo,
          imageUrl: actData.imageUrl, 
          userId: actData.userId,
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

      getActs: () => get().acts,

      clearActs: () => {
        set((state) => ({
          acts: state.acts.filter((act) => act.isMock),
        }));
      },

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
