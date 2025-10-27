/**
 * Bouyomichan Connector - Settings Core Module
 * Handles core settings initialization and default voice configuration
 */

/**
 * Initialize main module settings
 */
async function initializeSettings() {
    // Register SAPI5 settings menu (moved to sapi5-manager.js)
    BymChnConnector.sapi5.registerSettings();

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'BymChnDefVolume', {
        name: 'TTSC.BymChnDefaultVolume',
        hint: 'TTSC.BymChnDefaultVolumehint',
        scope: 'client',
        config: true,
        default: BymChnConnector.config.DEFAULT_VOLUME,
        type: Number,
        range: BymChnConnector.config.VOLUME_RANGE
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'whisperSetting', {
        name: 'TTSC.BymChnWhisperSetting',
        hint: 'TTSC.BymChnWhisperSettingHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    const isPolyglotActive = game.modules.get('polyglot')?.active ?? false;
    game.settings.register(BymChnConnector.config.MODULE_NAME, 'polyglotSetting', {
        name: 'TTSC.BymChnPolyglotSetting',
        hint: 'TTSC.BymChnPolyglotSettingHint',
        scope: 'world',
        config: isPolyglotActive,
        type: Boolean,
        default: false
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'playerSetting', {
        name: 'TTSC.BymChnPlayerSetting',
        hint: 'TTSC.BymChnPlayerSettinghint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'actorSubdivisionSetting', {
        name: 'TTSC.ActorSubdivisionSetting',
        hint: 'TTSC.ActorSubdivisionSettingHint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'bracketReadingMode', {
        name: 'TTSC.BracketReadingMode',
        hint: 'TTSC.BracketReadingModeHint',
        scope: 'client',
        config: true,
        type: Number,
        choices: {
            0: 'TTSC.BracketMode0',
            1: 'TTSC.BracketMode1',
            2: 'TTSC.BracketMode2',
            3: 'TTSC.BracketMode3'
        },
        default: 0
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'bracketDebugMode', {
        name: 'TTSC.BracketDebugMode',
        hint: 'TTSC.BracketDebugModeHint',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'active', {
        name: 'BymChn active',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false
    });

    // Multiple Chat Tabs: Muted Tabs setting (data storage)
    game.settings.register(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs', {
        name: "Muted Chat Tabs",
        scope: 'client',
        config: false,  // Custom UI will be used
        type: Array,
        default: []
    });

    game.settings.register(BymChnConnector.config.MODULE_NAME, 'nijiVoiceFunc', {
        name: 'TTSC.NijiVoiceLinkageFunction',
        hint: 'TTSC.NijiVoiceLinkageFunctionHint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        onChange: async (value) => {
            // When nijiVoiceFunc is changed from true to false, reset NijiVoice settings
            if (!value) {
                await BymChnConnector.nijivoice.resetSettings();
            }
        }
    });

    // Initialize NijiVoice settings if the feature is enabled
    if (await game.settings.get(BymChnConnector.config.MODULE_NAME, 'nijiVoiceFunc')) {
        await BymChnConnector.nijivoice.initializeSettings();
    }
}

/**
 * Initialize settings that depend on translations (must be called after ready hook)
 */
async function initializeTranslationDependentSettings() {
    game.settings.register(BymChnConnector.config.MODULE_NAME, 'voice-list', {
        name: "BymChn voice-list",
        scope: "client",
        config: false,
        type: Object,
        default: [
            { name: game.i18n.localize("TTSC.VoiceNone"), type: -1, num: "Voiceless" },
            { name: game.i18n.localize("TTSC.VoiceDefault"), type: 0, num: 0 },
            { name: game.i18n.localize("TTSC.VoiceWoman1"), type: 0, num: 1 },
            { name: game.i18n.localize("TTSC.VoiceWoman2"), type: 0, num: 2 },
            { name: game.i18n.localize("TTSC.VoiceMan1"), type: 0, num: 3 },
            { name: game.i18n.localize("TTSC.VoiceMan2"), type: 0, num: 4 },
            { name: game.i18n.localize("TTSC.VoiceNeutral"), type: 0, num: 5 },
            { name: game.i18n.localize("TTSC.VoiceRobot"), type: 0, num: 6 },
            { name: game.i18n.localize("TTSC.VoiceMachine1"), type: 0, num: 7 },
            { name: game.i18n.localize("TTSC.VoiceMachine2"), type: 0, num: 8 }
        ]
    });

    // Register SAPI5 list setting with onChange handler (moved to sapi5-manager.js)
    await BymChnConnector.sapi5.registerListSetting();

    game.settings.register("BymChnConnector", "niji-list", {
        name: "BymChn niji-list",
        scope: "client",
        config: false,
        type: Object,
        default: [],
        onChange: async (list) => {
            let selectVoice = await game.user.getFlag("BymChnConnector", "select-voice")
            for (let i = (selectVoice.length - 1); i >= 0; i--) {
                if (selectVoice[i].vtype == 3) {
                    let find = false
                    for (let k = 0; k < list.length; k++) {
                        if (list[k].num == selectVoice[i].voice) find = true
                    }
                    if (!find) {
                        selectVoice[i].voice = 0
                        selectVoice[i].vtype = 0
                        selectVoice[i].volume = await BymChnConnector.voiceEngine.getDefaultVolumeForEngine(3) // NijiVoice specific volume
                    }
                }
            }
            game.user.setFlag("BymChnConnector", "select-voice", selectVoice)
        }
    });
}

/**
 * Create default voice configuration for users and actors
 */
async function defvoice() {
    const users = game.users.contents;
    let def = [];
    const bymchndefVolume = await BymChnConnector.voiceEngine.getDefaultVolume();

    if (game.modules.get('theatre')?.active) {
        def.push({ type: 2, name: game.i18n.localize("TTSC.VoiceNarrator"), id: "theater", voice: 0, volume: bymchndefVolume, vtype: 0 });
    }
    if (game.modules.get('narrator-tools')?.active) {
        def.push(
            { type: 4, name: game.i18n.localize("TTSC.VoiceNarrateNT"), id: "narrate", voice: 0, volume: bymchndefVolume, vtype: 0 },
            { type: 4, name: game.i18n.localize("TTSC.VoiceDescNT"), id: "desc", voice: 0, volume: bymchndefVolume, vtype: 0 }
        );
    }
    for (let i = 0; i < users.length; i++) {
        def.push({ type: 0, name: users[i].name, id: users[i].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    const actors = game.actors.contents;
    for (let j = 0; j < actors.length; j++) {
        def.push({ type: 1, name: actors[j].name, id: actors[j].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    await game.user.setFlag("BymChnConnector", "select-voice", def);
}

/**
 * Muted Chat Tabs Settings Dialog Class
 * Manages which Multiple Chat Tabs should be muted for TTS
 */
class MutedChatTabsSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("TTSC.MutedChatTabsWindowTitle"),
            id: 'muted-chat-tabs-settings',
            template: 'modules/BymChnConnector/templates/muted-tabs-settings.html',
            width: 500,
            height: "auto",
            resizable: false,
            closeOnSubmit: true
        });
    }

    async getData() {
        const data = super.getData();

        // Check if Multiple Chat Tabs is active
        const mctModule = game.modules.get("multiple-chat-tabs");
        if (!mctModule?.active) {
            data.tabs = [];
            data.error = game.i18n.localize("TTSC.MutedChatTabsModuleNotActive");
            return data;
        }

        try {
            // Get tab settings from Multiple Chat Tabs
            const tabs = JSON.parse(game.settings.get("multiple-chat-tabs", "tabs") || "[]");
            const mutedTabIds = game.settings.get(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs') || [];

            // Get list of valid tab IDs
            const validTabIds = tabs.map(t => t.id);

            // Clean up muted tabs (remove tabs that no longer exist)
            const cleanedMutedTabIds = mutedTabIds.filter(id => validTabIds.includes(id));

            // Update setting if cleanup occurred
            if (cleanedMutedTabIds.length !== mutedTabIds.length) {
                await game.settings.set(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs', cleanedMutedTabIds);
            }

            // Create checkbox data structure
            data.tabs = tabs.map(tab => ({
                id: tab.id,
                label: tab.label,
                isMuted: cleanedMutedTabIds.includes(tab.id)
            }));

            data.error = null;
        } catch (error) {
            console.error('[BymChnConnector] Failed to load Multiple Chat Tabs settings:', error);
            data.tabs = [];
            data.error = game.i18n.localize("TTSC.MutedChatTabsLoadError");
        }

        return data;
    }

    async _updateObject(event, formData) {
        // Collect checked tab IDs
        const mutedTabIds = [];
        for (const [key, value] of Object.entries(formData)) {
            if (key.startsWith('mute-') && value === true) {
                const tabId = key.replace('mute-', '');
                mutedTabIds.push(tabId);
            }
        }

        // Save settings
        await game.settings.set(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs', mutedTabIds);

        ui.notifications.info(game.i18n.localize("TTSC.MutedChatTabsSaved"));
    }
}

/**
 * Register Multiple Chat Tabs integration (settings menu)
 * Called in ready hook after Multiple Chat Tabs settings are loaded
 */
Hooks.once('ready', () => {
    const isMctActive = game.modules.get('multiple-chat-tabs')?.active ?? false;
    if (isMctActive) {
        game.settings.registerMenu(BymChnConnector.config.MODULE_NAME, 'mutedChatTabsMenu', {
            name: 'TTSC.MutedChatTabsMenu',
            label: 'TTSC.MutedChatTabsMenuLabel',
            hint: 'TTSC.MutedChatTabsMenuHint',
            icon: 'fas fa-volume-mute',
            type: MutedChatTabsSettings,
            restricted: false
        });
    }
});

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export settings functions to namespace
window.BymChnConnector.settings = window.BymChnConnector.settings || {};
window.BymChnConnector.settings.initialize = initializeSettings;
window.BymChnConnector.settings.initializeTranslationDependent = initializeTranslationDependentSettings;
window.BymChnConnector.settings.createDefaultVoice = defvoice;

