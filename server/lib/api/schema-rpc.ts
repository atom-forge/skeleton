import {rpc} from '@atom-forge/rpc';
import type {z} from 'zod';

type Ctx = Parameters<Parameters<typeof rpc.query>[0]>[1];

/**
 * RPC methods validated by a whole zod schema (one from `shared/schemas`), unlike `rpc.zod`, which takes an object
 * shape and so drops refinements and transforms. The handler parses the arguments after the middlewares; a rejected
 * call answers `INVALID_ARGUMENT` with the issues, whose messages are the schema's Hungarian ones. The client types
 * the arguments as the schema's input.
 *
 *     create: withSchema(NewProjectSchema).command((input, ctx) => …)
 */
export function withSchema<S extends z.ZodType>(schema: S) {
	return {
		query: <R>(impl: (args: z.output<S>, ctx: Ctx) => R | Promise<R>) =>
			({...rpc.query<z.input<S>, R>(impl as never), zodSchema: schema}) as ReturnType<typeof rpc.query<z.input<S>, R>>,
		command: <R>(impl: (args: z.output<S>, ctx: Ctx) => R | Promise<R>) =>
			({...rpc.command<z.input<S>, R>(impl as never), zodSchema: schema}) as ReturnType<typeof rpc.command<z.input<S>, R>>,
	};
}
