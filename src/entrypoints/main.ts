import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';
import { AltReaderPlugin } from '@/alt-reader';

export default defineUnlistedScript(() => {
	(globalThis as any)[__PLUGIN_INSTANCE__] = new AltReaderPlugin();
});
