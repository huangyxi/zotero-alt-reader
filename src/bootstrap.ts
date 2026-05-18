type Params = Parameters<_ZoteroTypes.Plugins._observerFunction>[0];

export function install(_params: Params, _reason: number) { }

export async function startup(params: Params, reason: number) {
	Services.scriptloader.loadSubScript(params.rootURI + 'main.js');
	const plugin = (globalThis as any)[__PLUGIN_INSTANCE__];
	await plugin.startup(params, reason);
}

export async function shutdown(params: Params, reason: number) {
	const plugin = (globalThis as any)[__PLUGIN_INSTANCE__];
	if (plugin) {
		await plugin.shutdown?.(params, reason);
		delete (globalThis as any)[__PLUGIN_INSTANCE__];
	}
}

export function uninstall(_params: Params, _reason: number) { }

Object.assign(globalThis, {
	install,
	startup,
	shutdown,
	uninstall
});
