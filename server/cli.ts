import { app } from './app';

type Command = (args: string[]) => Promise<void>;

// Parancsok: 'name': { run, help: 'name <args>  – what it does' }
const commands: Record<string, { run: Command; help: string }> = {};

const [name, ...args] = process.argv.slice(2);
const command = name ? commands[name] : undefined;

if (!command) {
	console.log('Usage: bun run cli <command> [args]\n');
	for (const c of Object.values(commands)) console.log(`  ${c.help}`);
	process.exit(name ? 1 : 0);
}

try {
	await command.run(args);
} finally {
	await app.services.prisma.db().close();
}
