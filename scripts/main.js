
/**
 * Bouyomichan Connector - Main Entry Point
 * Minimal coordination layer for modular architecture
 *
 * Module Architecture:
 * - utils.js: Foundation utilities and constants
 * - voice-engine.js: TTS processing and voice management
 * - ui-controls.js: UI controls and scene control buttons
 * - sapi5-manager.js: SAPI5 voice engine management
 * - nijivoice-manager.js: NijiVoice API integration
 * - settings-core.js: Core settings initialization
 * - voice-selector.js: Voice selection dialog UI
 * - chat-handler.js: Chat message processing and Socket communication
 * - module-integration.js: External module integration (Theatre, Narrator Tools)
 * - core-controller.js: Core system coordination and hooks
 * - main.js: Entry point and hook registrations (this file)
 *
 * Namespace Organization:
 * All module functions are organized under the window.BymChnConnector namespace:
 * - BymChnConnector.config: Module configuration constants
 * - BymChnConnector.voiceTypes: Voice type constants
 * - BymChnConnector.utils: Utility functions (compareVersions, htmlTokenizer, isNewVersion)
 * - BymChnConnector.client: WebSocket client (BouyomiChanClient)
 * - BymChnConnector.voiceEngine: TTS processing functions
 * - BymChnConnector.sapi5: SAPI5 voice management
 * - BymChnConnector.nijivoice: NijiVoice API integration
 * - BymChnConnector.settings: Settings initialization
 * - BymChnConnector.ui: UI controls and dialogs
 * - BymChnConnector.chat: Chat message handlers
 * - BymChnConnector.modules: External module integration
 * - BymChnConnector.core: Core controller functions
 *
 * Backward Compatibility:
 * All functions are also available in the global scope for existing code compatibility.
 */

// Note: In Foundry VTT modules, file imports are handled by the manifest (module.json)
// All dependencies are loaded via the BymChnConnector namespace (window.BymChnConnector)
// Legacy global scope exports are maintained for backward compatibility

/**
 * Initialize module during Foundry's init hook
 * Delegates to core-controller.js
 */
Hooks.once('init', async function () {
    await BymChnConnector.core.initialize();
});

/**
 * Handle getSceneControlButtons hook
 * Adds TTS controls to scene control buttons
 * Delegates to core-controller.js
 */
Hooks.on('getSceneControlButtons', (buttons) => {
    BymChnConnector.core.handleSceneControlButtons(buttons);
});

/**
 * Handle renderSceneControls hook
 * Adds player-specific scene controls
 * Delegates to core-controller.js
 */
Hooks.on('renderSceneControls', async (app, html, data) => {
    await BymChnConnector.core.handleRenderSceneControls(app, html, data);
});

/**
 * Handle ready hook
 * Initializes translation-dependent settings and module integrations
 * Delegates to core-controller.js
 */
Hooks.once("ready", async function () {
    await BymChnConnector.core.handleReadyEvent();
});

/**
 * Handle createChatMessage hook
 * Support for Narrator-Tools module: Handle TTS for journal reading function
 * Delegates to chat-handler.js
 */
Hooks.on("createChatMessage", async (document, options, userId) => {
    await BymChnConnector.chat.handleCreateChatMessage(document, options, userId);
});

/**
 * Handle chatMessage hook
 * Processes chat messages for TTS
 * Delegates to chat-handler.js
 */
Hooks.on("chatMessage", async (chatLog, message, chatData) => {
    await BymChnConnector.chat.handleChatMessage(chatLog, message, chatData);
});
