import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  games: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getGamesByUserId(ctx.user.id)
    ),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      db.getGameById(input.id)
    ),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      genre: z.string().optional(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ ctx, input }) =>
      db.createGame({
        userId: ctx.user.id,
        ...input,
      })
    ),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      genre: z.string().optional(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.updateGame(input.id, input)
    ),
    delete: protectedProcedure.input(z.object({ id: z.number() })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.deleteGame(input.id)
    ),
  }),

  characters: router({
    listByGame: publicProcedure.input(z.object({ gameId: z.number() })).query(({ input }) =>
      db.getCharactersByGameId(input.gameId)
    ),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      db.getCharacterById(input.id)
    ),
    create: protectedProcedure.input(z.object({
      gameId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      history: z.string().optional(),
      imageUrl: z.string().optional(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.createCharacter(input)
    ),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      history: z.string().optional(),
      imageUrl: z.string().optional(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.updateCharacter(input.id, input)
    ),
    delete: protectedProcedure.input(z.object({ id: z.number() })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.deleteCharacter(input.id)
    ),
  }),

  attributes: router({
    listByCharacter: publicProcedure.input(z.object({ characterId: z.number() })).query(({ input }) =>
      db.getAttributesByCharacterId(input.characterId)
    ),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      db.getAttributeById(input.id)
    ),
    create: protectedProcedure.input(z.object({
      characterId: z.number(),
      name: z.string().min(1),
      value: z.number().default(10),
      minValue: z.number().default(0),
      maxValue: z.number().default(15),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.createAttribute(input)
    ),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      value: z.number().optional(),
      name: z.string().optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
    })).mutation(({ input }) =>
      db.updateAttribute(input.id, input)
    ),
    delete: protectedProcedure.input(z.object({ id: z.number() })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.deleteAttribute(input.id)
    ),
  }),

  skills: router({
    listByCharacter: publicProcedure.input(z.object({ characterId: z.number() })).query(({ input }) =>
      db.getSkillsByCharacterId(input.characterId)
    ),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      db.getSkillById(input.id)
    ),
    create: protectedProcedure.input(z.object({
      characterId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      level: z.number().default(1),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.createSkill(input)
    ),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      level: z.number().optional(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.updateSkill(input.id, input)
    ),
    delete: protectedProcedure.input(z.object({ id: z.number() })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(({ input }) =>
      db.deleteSkill(input.id)
    ),
  }),

  upload: router({
    gameCover: protectedProcedure.input(z.object({
      gameId: z.number(),
      fileData: z.string(),
      fileName: z.string(),
    })).use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return next({ ctx });
    }).mutation(async ({ input }) => {
      const { storagePut } = await import('./storage');
      const { updateGameCoverUrl } = await import('./db');
      const fileKey = `games/${input.gameId}/cover-${Date.now()}-${input.fileName}`;
      const buffer = Buffer.from(input.fileData, 'base64');
      const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
      await updateGameCoverUrl(input.gameId, url);
      return { url, key: fileKey };
    }),
  }),
});

export type AppRouter = typeof appRouter;
