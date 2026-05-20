type Params = Parameters<_ZoteroTypes.Plugins._observerFunction>[0];

export interface Plugin {
	startup: (params: Params, reason: number) => Promise<void> | void;
	shutdown?: (params: Params, reason: number) => Promise<void> | void;
}

export type PluginGlobal = typeof globalThis & {
	__PLUGIN_INSTANCE__?: Plugin;
};

function install(_params: Params, _reason: number) {}

async function startup(params: Params, reason: number) {
	Services.scriptloader.loadSubScript(params.rootURI + 'main.js');
	const plugin = (globalThis as PluginGlobal)[__PLUGIN_INSTANCE__];
	if (!plugin) {
		return;
	}
	await plugin.startup(params, reason);
}

async function shutdown(params: Params, reason: number) {
	const plugin = (globalThis as PluginGlobal)[__PLUGIN_INSTANCE__];
	if (!plugin) {
		return;
	}
	await plugin.shutdown?.(params, reason);
	delete (globalThis as PluginGlobal)[__PLUGIN_INSTANCE__];
}

function uninstall(_params: Params, _reason: number) {}

Object.assign(globalThis, {
	install,
	startup,
	shutdown,
	uninstall,
});
