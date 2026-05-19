import type { Plugin } from './bootstrap';

type Params = Parameters<_ZoteroTypes.Plugins._observerFunction>[0];
type BuildContextMenuFunction = (menu: Element, showIcons: boolean) => Promise<void>;

function patch_buildContextMenu_after<T extends BuildContextMenuFunction>(
	original: T,
	after: (this: ThisParameterType<T>, window: _ZoteroTypes.MainWindow, ...args: Parameters<T>) => void,
	window: _ZoteroTypes.MainWindow,
): T {
	return async function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		await original.apply(this, args);
		after.call(this, window, ...args);
	} as T;
}

export class AltReaderPlugin implements Plugin {
	private originalBuildContextMenu = new WeakMap<_ZoteroTypes.MainWindow, BuildContextMenuFunction>();

	public startup(_params: Params, _reason: number) {
		const window = Zotero.getMainWindow();
		if (window) {
			this.addToMainWindow(window);
		}
	}

	public shutdown(_params: Params, _reason: number) {
		const window = Zotero.getMainWindow();
		if (window) {
			this.removeFromMainWindow(window);
		}
	}

	private addToMainWindow(window: _ZoteroTypes.MainWindow) {
		const Zotero_LocateMenu = window.Zotero_LocateMenu;
		if (!Zotero_LocateMenu) return;

		const originalBuild = Zotero_LocateMenu.buildContextMenu;
		this.originalBuildContextMenu.set(window, originalBuild);

		Zotero_LocateMenu.buildContextMenu = patch_buildContextMenu_after(
			originalBuild,
			this.injectAltReaderMenuItem.bind(this),
			window,
		);
	}

	private removeFromMainWindow(window: _ZoteroTypes.MainWindow) {
		const Zotero_LocateMenu = window.Zotero_LocateMenu;
		if (Zotero_LocateMenu && this.originalBuildContextMenu.has(window)) {
			Zotero_LocateMenu.buildContextMenu = this.originalBuildContextMenu.get(window)!;
			this.originalBuildContextMenu.delete(window);
		}
		const menuitem = window.document.getElementById('zotero-alt-reader-open');
		if (menuitem) {
			menuitem.remove();
		}
	}

	private injectAltReaderMenuItem(
		window: _ZoteroTypes.MainWindow,
		menu: Element,
		_showIcons: boolean,
	) {
		if (menu.querySelector('#zotero-alt-reader-open')) return;

		const menuitem = window.document.createXULElement('menuitem');
		menuitem.id = 'zotero-alt-reader-open';
		menuitem.setAttribute('zotero-locate', 'true');
		const currentHandler = Zotero.Prefs.get('fileHandler.pdf') || '';
		menuitem.setAttribute('label', currentHandler === '' ? 'Open in System Viewer' : 'Open in Zotero Reader');
		menuitem.addEventListener('command', (_event: Event) => void this.openInAlternativeReader());
		const firstSeparator = menu.querySelector('menuseparator[zotero-locate="true"]');
		if (firstSeparator) {
			menu.insertBefore(menuitem, firstSeparator);
		} else {
			menu.insertBefore(menuitem, menu.firstChild);
		}
	};

	private async openInAlternativeReader() {
		const pdfFileHandler = Zotero.Prefs.get('fileHandler.pdf') || '';
		const isZoteroDefault = pdfFileHandler === '';
		const pane = Zotero.getActiveZoteroPane();
		const items = pane.getSelectedItems();
		const attachmentIds = items.flatMap((item: Zotero.Item) =>
			item.isAttachment() ? [item.id] : item.getAttachments ? item.getAttachments() : [],
		);
		try {
			Zotero.Prefs.set('fileHandler.pdf', isZoteroDefault ? 'system' : '');
			for (const id of attachmentIds) {
				await pane.viewPDF(id, {});
			}
		} finally {
			Zotero.Prefs.set('fileHandler.pdf', pdfFileHandler);
		}
	}

}
