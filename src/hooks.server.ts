import type { Handle } from '@sveltejs/kit/hooks';

// Minden kliens–szerver hívás RPC (/rpc); a többi kérést a SvelteKit szolgálja ki.
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/rpc' || event.url.pathname.startsWith('/rpc/')) {
		const { rpcHandler } = await import('#server/rpc-handler');
		if (rpcHandler.match(event.request)) return rpcHandler.handle(event.request);
	}
	return resolve(event);
};
