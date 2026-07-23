import AutoSendManager from "./manager.js";

const autoSendService = globalThis.autoSendService ?? new AutoSendManager();
globalThis.autoSendService = autoSendService;

export default autoSendService;