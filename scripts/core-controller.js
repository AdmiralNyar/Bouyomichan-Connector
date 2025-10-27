/**
 * Bouyomichan Connector - Core Controller Module
 * Handles core initialization, Foundry hooks coordination, and version compatibility
 */

/**
 * @type {boolean} - Whether the current Foundry version is newer than v10
 */
let isNewVersion = false;

/**
 * Initialize module during Foundry's init hook
 * Sets up version compatibility, registers settings, and Handlebars helpers
 */
async function initializeCore() {
    try {
        isNewVersion = isNewerVersion(game.version, '10');

        // Export isNewVersion immediately after initialization (must be done here, not at end of file)
        // because isNewVersion is a primitive value and won't update if exported before initialization
        window.BymChnConnector = window.BymChnConnector || {};
        window.BymChnConnector.utils = window.BymChnConnector.utils || {};
        window.BymChnConnector.utils.isNewVersion = isNewVersion;

        // Initialize version compatibility flags
        const isV13Plus = isNewerVersion(game.version, '13');
        if (isV13Plus) {
            console.log('[BymChnConnector] Running in Foundry v13+ mode with ApplicationV2 support');
        }

        // Initialize settings that don't depend on translations
        await BymChnConnector.settings.initialize();

        /**
         * Register Handlebars helper for conditional logic
         * Example: {{#uniqueif i "===" k}} ... {{/uniqueif}}
         */
        Handlebars.registerHelper('uniqueif', function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        });
    } catch (error) {
        console.error('[BymChnConnector] Initialization failed:', error);
    }
}

/**
 * Handle getSceneControlButtons hook
 * Adds TTS controls to scene control buttons
 * Note: In v12, this hook only fires for GM users. In v13+, it fires for all users.
 * @param {Array|Object} buttons - Scene control buttons array (v12) or object (v13)
 */
function handleSceneControlButtons(buttons) {
    const isGM = game.user.isGM;
    const isV13Plus = isNewerVersion(game.version, '13');

    try {
        // In v12, this hook only fires for GM, so we only need to handle GM here
        // In v13+, this hook fires for both GM and players
        if (!isV13Plus && !isGM) {
            // v12 and player: this shouldn't happen, but just in case
            return;
        }

        // Use v13/v12 compatible function to find sounds group
        let group = BymChnConnector.ui.findSoundsGroup(buttons);

        if (!group) {
            console.warn('[BymChnConnector] Sounds group not found in scene controls');
            return;
        }

        const slider = isNewVersion ? "fa-duotone fa-sliders" : "fas fa-sliders-h";

        // Add TTS ON/OFF toggle button
        BymChnConnector.ui.addToolToGroup(group, {
            toggle: true,
            icon: "fas fa-comment-dots",
            name: "activateTTS",
            active: game.settings.get(BymChnConnector.config.MODULE_NAME, "active"),
            title: game.i18n.localize("TTSC.ButtonTTSOnOff"),
            onClick: async (a) => {
                await game.settings.set(BymChnConnector.config.MODULE_NAME, "active", a)
            }
        });

        // Add speaker settings button (GM always, players only if playerSetting is enabled)
        const playerSetting = game.settings.get(BymChnConnector.config.MODULE_NAME, 'playerSetting');
        if (isGM || playerSetting) {
            BymChnConnector.ui.addToolToGroup(group, {
                button: true,
                icon: slider,
                name: "speakersettings",
                title: game.i18n.localize("TTSC.ButtonTTSSpeakerSettings"),
                onClick: async () => {
                    BymChnConnector.ui.voiceSelector();
                }
            });
        }

        console.log('[BymChnConnector] Scene control buttons added successfully for', isGM ? 'GM' : 'player');
    } catch (e) {
        console.error('[BymChnConnector] Failed to add scene control buttons:', e);
    }
}

/**
 * Handle renderSceneControls hook
 * NOTE: As of the v12 compatibility update, scene control buttons are now added
 * via the getSceneControlButtons hook for both GM and players. This function
 * is kept for v13+ ApplicationV2 compatibility if needed, but may be deprecated.
 *
 * @param {Object} app - Scene controls application
 * @param {jQuery|HTMLElement} html - HTML element
 * @param {Object} data - Scene controls data
 */
async function handleRenderSceneControls(app, html, data) {
    const isGM = game.user.isGM;
    if (isGM) return; // Only add controls for non-GM users

    const isV13Plus = isNewerVersion(game.version, '13');
    if (isV13Plus) {
        // v13+ uses ApplicationV2 - use the generic function
        BymChnConnector.ui.addPlayerSceneControls();
    } else {
        // Legacy v10-v12 handling - call legacy function directly
        await BymChnConnector.ui.addPlayerSceneControlsLegacy(html[0] || html);
    }
}

/**
 * Handle ready hook
 * Initializes translation-dependent settings, version management, and module integrations
 *
 * @async
 * @description
 * This function performs the following initialization tasks during Foundry's ready phase:
 * 1. Translation-dependent settings initialization
 * 2. Default TTS active state configuration (GM-based)
 * 3. Default voice configuration for new users
 * 4. Version management and update announcements
 * 5. Data migration for translation key changes
 * 6. External module integration (Theatre, Narrator Tools)
 * 7. Socket communication setup for cross-user TTS synchronization
 */
async function handleReadyEvent() {
    // === Section 1: Translation-dependent settings ===
    // Initialize settings that require translation strings (after language files are loaded)
    await BymChnConnector.settings.initializeTranslationDependent();

    // === Section 2: Default TTS active state ===
    // Set GM-based default for active setting if not yet configured
    // GM users have TTS enabled by default, players have it disabled
    const hasActiveSetting = game.settings.storage.get('client')[`${BymChnConnector.config.MODULE_NAME}.active`] !== undefined;
    if (!hasActiveSetting) {
        await game.settings.set(BymChnConnector.config.MODULE_NAME, 'active', game.user.isGM);
    }

    // === Section 3: Default voice configuration ===
    // Initialize default voice settings for users/actors if not already configured
    let a = await game.user.getFlag("BymChnConnector", "select-voice");
    if (!a) {
        await BymChnConnector.settings.createDefaultVoice()
    }

    // === Section 4: Version management and update announcements ===
    // Check module version and display update announcements if needed
    const b = await game.user.getFlag("BymChnConnector", "announcements");
    const module_data = (await game.modules.get(BymChnConnector.config.MODULE_NAME));
    const nowversion = module_data.version ? module_data.version : module_data.data.version ? module_data.data.version : "0.0.0";
    if (!!b) {
        let lastversion = b.version ? duplicate(b.version) : "0.0.0";
        if (BymChnConnector.utils.compareVersions(nowversion, lastversion) == 1) {
            // Automatic display of update announcements to be implemented (TBD)
            b.version = nowversion;
            await game.user.setFlag(BymChnConnector.config.MODULE_NAME, 'announcements', b);
        }
    } else {
        await game.user.setFlag(BymChnConnector.config.MODULE_NAME, 'announcements', { version: nowversion });
    }

    // === Section 5: Data migration ===
    // Handle data migration when translation file names change
    // Update Theatre narrator voice name to use current translation key
    let voiceL = await game.user.getFlag("BymChnConnector", "select-voice");
    let announcements = await game.user.getFlag("BymChnConnector", "announcements");
    if (!announcements?.nT) {
        announcements.nT = true;
        let num = voiceL.findIndex(i => i.type == 2);
        if (num > -1) voiceL[num].name = game.i18n.localize("TTSC.VoiceNarrator");
        await game.user.setFlag("BymChnConnector", "announcements", announcements);
    }

    // === Section 6: Module integrations ===
    // Initialize external module support (Theatre, Narrator Tools)
    await BymChnConnector.modules.initializeIntegrations();

    // === Section 7: Socket communication ===
    // Initialize socket communication for cross-user TTS synchronization
    // Allows TTS to work across multiple connected clients
    game.socket.on('module.BymChnConnector', async (packet) => {
        await BymChnConnector.chat.handleSocketMessage(packet);
    });
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Note: isNewVersion is exported inside initializeCore() after initialization
// Exporting it here would capture the initial false value before init hook runs

// Export core controller functions to namespace
window.BymChnConnector.core = window.BymChnConnector.core || {};
window.BymChnConnector.core.initialize = initializeCore;
window.BymChnConnector.core.handleSceneControlButtons = handleSceneControlButtons;
window.BymChnConnector.core.handleRenderSceneControls = handleRenderSceneControls;
window.BymChnConnector.core.handleReadyEvent = handleReadyEvent;
