import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { lookupLegislatorsByAddress } from "./legislatorLookup";
import { getAllLegislators, getLegislatorsByChamber, getAllCommittees, getCommitteesByChamber } from "./db";
import { syncLegislators, syncCommittees } from "./syncData";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Find Your Legislator - core lookup feature
  legislator: router({
    /**
     * Look up legislators by NC address.
     * Geocodes the address, determines districts, and returns matching legislators.
     */
    lookup: publicProcedure
      .input(
        z.object({
          address: z.string().min(3, "Please enter a valid address"),
        })
      )
      .mutation(async ({ input }) => {
        return lookupLegislatorsByAddress(input.address);
      }),

    /**
     * Get all legislators, optionally filtered by chamber.
     */
    list: publicProcedure
      .input(
        z.object({
          chamber: z.enum(["H", "S", "all"]).optional().default("all"),
        }).optional()
      )
      .query(async ({ input }) => {
        const chamber = input?.chamber ?? "all";
        if (chamber === "all") {
          return getAllLegislators();
        }
        return getLegislatorsByChamber(chamber as "H" | "S");
      }),

    /**
     * Manually trigger a data sync from ncleg.gov.
     */
    sync: publicProcedure.mutation(async () => {
      const legResult = await syncLegislators();
      const commResult = await syncCommittees();
      return {
        legislators: legResult,
        committees: commResult,
      };
    }),
  }),

  // Committees
  committee: router({
    list: publicProcedure
      .input(
        z.object({
          chamber: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        if (input?.chamber) {
          return getCommitteesByChamber(input.chamber);
        }
        return getAllCommittees();
      }),
  }),
});

export type AppRouter = typeof appRouter;
