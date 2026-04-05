export const todoQueryKeys = {
  all: ["todos"] as const,
  list: (sortBy: string, order: string) =>
    [...todoQueryKeys.all, "list", sortBy, order] as const,
  detail: (id: string) => [...todoQueryKeys.all, "detail", id] as const,
};
