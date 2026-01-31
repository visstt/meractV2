import api from "./api";

export const spotAgentApi = {
  apply: async (actId) => {
    const response = await api.post("/act/spot-agent/apply", { actId });
    return response.data;
  },

  getCandidates: async (actId) => {
    const response = await api.get(`/act/${actId}/spot-agent/candidates`);
    return response.data;
  },

  vote: async (candidateId) => {
    const response = await api.post("/act/spot-agent/vote", { candidateId });
    return response.data;
  },

  assign: async (actId, userId, task) => {
    const response = await api.post("/act/spot-agent/assign", {
      actId,
      userId,
      task,
    });
    return response.data;
  },

  getAssigned: async (actId) => {
    const response = await api.get(`/act/${actId}/spot-agent/assigned`);
    return response.data;
  },

  remove: async (actId, spotAgentId) => {
    const response = await api.delete(
      `/act/${actId}/spot-agent/${spotAgentId}`,
    );
    return response.data;
  },
};
