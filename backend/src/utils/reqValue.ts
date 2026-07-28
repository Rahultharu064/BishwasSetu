/**
 * Express types req.params/req.query values as `string | string[]` (Express 5's
 * router can produce array captures). Most routes never actually receive an
 * array, but blindly casting `as string` would silently accept one and pass
 * it downstream — e.g. into a Prisma `where` clause — as a bug waiting to
 * happen. These helpers narrow explicitly and reject arrays with a clear 400.
 */
import type { ParsedQs } from "qs";
import { ApiError } from "./apierror";

// req.params values are `string | string[]` (Express 5 wildcard captures);
// req.query values additionally allow nested `ParsedQs` for `?a[b]=1`-style
// keys. Either shape can appear where we only ever want a plain string.
type StringLike = string | string[] | ParsedQs | (string | ParsedQs)[] | undefined;

/** Optional string param/query value — undefined stays undefined. */
export function asString(value: StringLike): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new ApiError(400, "Expected a single value, received multiple");
  }
  return value;
}

/** Required string param/query value — throws 400 if missing or an array. */
export function requireString(value: StringLike, name: string): string {
  const v = asString(value);
  if (v === undefined) throw new ApiError(400, `${name} is required`);
  return v;
}
