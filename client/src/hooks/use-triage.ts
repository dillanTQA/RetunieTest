import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, errorSchemas } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { TriageRequest, InsertTriageRequest } from "@shared/schema";
import { z } from "zod";

// --- TRIAGE REQUESTS ---

export function useTriageRequests() {
  return useQuery({
    queryKey: [api.triage.list.path],
    queryFn: async () => {
      const res = await fetch(api.triage.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch triage requests");
      return api.triage.list.responses[200].parse(await res.json());
    },
  });
}

export function useTriageRequest(id: number) {
  return useQuery({
    queryKey: [api.triage.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.triage.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch triage request");
      return api.triage.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTriageRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { title?: string } = {}) => {
      const res = await fetch(api.triage.create.path, {
        method: api.triage.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create request");
      return api.triage.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.triage.list.path] });
      toast({ title: "Started", description: "New triage request created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not create request.", variant: "destructive" });
    },
  });
}

export function useUpdateTriageRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTriageRequest>) => {
      const url = buildUrl(api.triage.update.path, { id });
      const res = await fetch(url, {
        method: api.triage.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update request");
      return api.triage.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.triage.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.triage.list.path] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    },
  });
}

// --- CHAT & AI ---

export function useTriageChat(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const url = buildUrl(api.triage.chat.path, { id });
      const res = await fetch(url, {
        method: api.triage.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.triage.chat.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // If the AI updated the request state (e.g. captured new answers), update the cache
      if (data.updatedRequest) {
        queryClient.setQueryData([api.triage.get.path, id], data.updatedRequest);
      }
    },
  });
}

export function useGenerateRecommendation(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.triage.generateRecommendation.path, { id });
      const res = await fetch(url, {
        method: api.triage.generateRecommendation.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate recommendation");
      return api.triage.generateRecommendation.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate to fetch the updated request which might now store the recommendation
      queryClient.invalidateQueries({ queryKey: [api.triage.get.path, id] });
      toast({ title: "Analysis Complete", description: "Recommendations generated." });
    },
  });
}

// --- SPECIFICATIONS ---

export function useSpecification(id: number) {
  return useQuery({
    queryKey: [api.specifications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.specifications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch specification");
      return api.specifications.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSaveSpecification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const url = buildUrl(api.specifications.save.path, { id });
      const res = await fetch(url, {
        method: api.specifications.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save specification");
      return api.specifications.save.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.specifications.get.path, variables.id] });
      toast({ title: "Saved", description: "Specification updated." });
    },
  });
}

// --- SUPPLIERS ---

export function useSuppliers(category?: string) {
  return useQuery({
    queryKey: [api.suppliers.list.path, category],
    queryFn: async () => {
      const url = new URL(api.suppliers.list.path, window.location.origin);
      if (category) url.searchParams.set("category", category);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return api.suppliers.list.responses[200].parse(await res.json());
    },
  });
}
