import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Scorecard } from "../backend";
import { useActor } from "./useActor";

export function useListScorecards() {
  const { actor, isFetching } = useActor();
  return useQuery<Scorecard[]>({
    queryKey: ["scorecards"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScorecards();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateScorecard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (card: Scorecard) => {
      if (!actor) throw new Error("No actor");
      return actor.createScorecard(card);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scorecards"] }),
  });
}
