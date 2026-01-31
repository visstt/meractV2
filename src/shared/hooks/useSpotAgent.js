import { useCallback, useState } from "react";

import { spotAgentApi } from "../api/spotAgentApi";

export function useSpotAgent(actId) {
  const [candidates, setCandidates] = useState([]);
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async () => {
    if (!actId) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching candidates for actId:", actId);
      const data = await spotAgentApi.getCandidates(actId);
      console.log("Candidates fetched:", data);
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(err.response?.data?.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  }, [actId]);

  const fetchAssigned = useCallback(async () => {
    if (!actId) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching assigned for actId:", actId);
      const data = await spotAgentApi.getAssigned(actId);
      console.log("Assigned agents fetched:", data);
      setAssignedAgents(data);
    } catch (err) {
      console.error("Error fetching assigned:", err);
      setError(
        err.response?.data?.message || "Failed to fetch assigned agents",
      );
    } finally {
      setLoading(false);
    }
  }, [actId]);

  const apply = useCallback(async () => {
    if (!actId) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Applying for actId:", actId, "type:", typeof actId);
      // Ensure actId is a number
      const numericActId = typeof actId === 'string' ? parseInt(actId, 10) : actId;
      const data = await spotAgentApi.apply(numericActId);
      console.log("Apply response:", data);
      await fetchCandidates();
      return data;
    } catch (err) {
      console.error("Error applying:", err);
      console.error("Server response:", err.response?.data);
      const message = err.response?.data?.message || "Failed to apply";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [actId, fetchCandidates]);

  const vote = useCallback(
    async (candidateId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotAgentApi.vote(candidateId);
        await fetchCandidates();
        return data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to vote";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchCandidates],
  );

  const assign = useCallback(
    async (userId, task) => {
      if (!actId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await spotAgentApi.assign(actId, userId, task);
        await fetchCandidates();
        await fetchAssigned();
        return data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to assign";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [actId, fetchCandidates, fetchAssigned],
  );

  const remove = useCallback(
    async (spotAgentId) => {
      if (!actId) return;
      setLoading(true);
      setError(null);
      try {
        await spotAgentApi.remove(actId, spotAgentId);
        await fetchAssigned();
      } catch (err) {
        const message = err.response?.data?.message || "Failed to remove";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [actId, fetchAssigned],
  );

  return {
    candidates,
    assignedAgents,
    loading,
    error,
    fetchCandidates,
    fetchAssigned,
    apply,
    vote,
    assign,
    remove,
  };
}
