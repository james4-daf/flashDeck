/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as decks from "../decks.js";
import type * as flashcards from "../flashcards.js";
import type * as sessionAttempts from "../sessionAttempts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as topics from "../topics.js";
import type * as userProgress from "../userProgress.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  decks: typeof decks;
  flashcards: typeof flashcards;
  sessionAttempts: typeof sessionAttempts;
  subscriptions: typeof subscriptions;
  topics: typeof topics;
  userProgress: typeof userProgress;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
