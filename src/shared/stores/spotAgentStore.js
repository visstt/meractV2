import { create } from "zustand";

export const useSpotAgentStore = create((set) => ({
  candidates: [],
  assignedAgents: [],
  loading: false,
  error: null,

  setCandidates: (candidates) => set({ candidates }),

  setAssignedAgents: (assignedAgents) => set({ assignedAgents }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  addCandidate: (candidate) =>
    set((state) => ({
      candidates: [...state.candidates, candidate],
    })),

  updateCandidateVotes: (candidateId, voteCount, newVote) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              voteCount,
              votes: newVote ? [...(c.votes || []), newVote] : c.votes,
            }
          : c,
      ),
    })),

  addAssignedAgent: (agent) =>
    set((state) => ({
      assignedAgents: [...state.assignedAgents, agent],
      candidates: state.candidates.filter((c) => c.userId !== agent.userId),
    })),

  removeAssignedAgent: (spotAgentId) =>
    set((state) => ({
      assignedAgents: state.assignedAgents.filter((a) => a.id !== spotAgentId),
    })),

  clearAll: () =>
    set({
      candidates: [],
      assignedAgents: [],
      loading: false,
      error: null,
    }),
}));
