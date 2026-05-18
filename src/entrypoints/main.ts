import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';

import { AltReaderPlugin } from '@/alt-reader';
import type { PluginGlobal } from '@/bootstrap';

export default defineUnlistedScript(() => {
	(globalThis as PluginGlobal)[__PLUGIN_INSTANCE__] = new AltReaderPlugin();
});
