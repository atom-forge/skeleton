import type {PageServerLoad} from './$types';

export const load: PageServerLoad = async ({locals}) => {
	const userCount = await locals.app.modules.user.count();
	return {userCount};
};
