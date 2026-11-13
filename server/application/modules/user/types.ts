/** The roles a user can hold; a user without a role is a plain member. */
export type RoleName = 'admin';

/** Session user as seen by the request-scoped Actor. */
export type ActorUser = {
	id: string;
	name: string;
	email: string;
	roles: RoleName[];
};

export interface IActor {
	readonly user: ActorUser | null;
	readonly _internal: boolean;

	is(userId: string): boolean;

	isAuthenticated(): boolean;

	/** Holds the admin role. */
	isAdmin(): boolean;

	/** Holds the role (admins pass every role check). */
	hasRole(role: RoleName): boolean;

	isInternal(): boolean;
}
