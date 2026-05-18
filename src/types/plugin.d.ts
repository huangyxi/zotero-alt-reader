declare const __PLUGIN_INSTANCE__: '__PLUGIN_INSTANCE__';

declare namespace _ZoteroTypes {
	interface MainWindow {
		Zotero_LocateMenu: {
			buildContextMenu: (menu: Element, showIcons: boolean) => Promise<void>;
		};
		ZoteroPane_Local: ZoteroPane;
	}
}
