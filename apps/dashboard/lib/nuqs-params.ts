import { useQueryStates } from "nuqs";
import { createLoader, type Options, parseAsString } from "nuqs/server";

const searchParams = {
  q: parseAsString.withDefault(""),
  c: parseAsString.withDefault("last-viewed"),
};

export const loadFilters = createLoader(searchParams);

export const useFilters = (options: Options = {}) =>
  useQueryStates(searchParams, {
    ...options,
    shallow: false,
  });
