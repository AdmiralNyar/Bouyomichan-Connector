/**
 * Bouyomichan Connector - Module Integration Module
 * Handles external module integration (Theatre, Narrator Tools)
 * Manages dynamic voice list entries based on active Foundry VTT modules
 */

/**
 * Initialize all module integrations
 * Dynamically adds or removes voice list entries based on active modules
 *
 * @async
 * @description
 * This function manages voice list entries for external modules:
 * - Theatre: Adds narrator voice entry when active
 * - Narrator Tools: Adds narration and description voice entries when active
 *
 * The function uses flatMap to find existing entries and unshift/splice to add/remove them.
 * This maintains voice list consistency across module activation/deactivation.
 */
async function initializeModuleIntegrations() {
    let voiceL = await game.user.getFlag("BymChnConnector", "select-voice");

    // Calculate default volume with normalization (0-1 range)
    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;

    // Theatre module integration
    // Find existing Theatre narrator entries using flatMap (returns array of indices)
    let theatre_set = voiceL.flatMap((i, j) => (i.name == game.i18n.localize("TTSC.VoiceNarrator") && i.type == 2) ? j : []);
    if (game.modules.get('theatre')?.active) {
        // Add Theatre narrator entry if not exists
        if (theatre_set.length == 0) {
            voiceL.unshift({ type: 2, name: game.i18n.localize("TTSC.VoiceNarrator"), id: "theater", voice: 0, vtype: 0, volume: bymchndefVolume });
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    } else {
        // Remove Theatre narrator entries if module is inactive
        if (theatre_set.length > 0) {
            // Reverse indices to delete from end to start (prevents index shifting issues)
            theatre_set = theatre_set.reverse();
            for (let k = 0; k < theatre_set.length; k++) {
                voiceL.splice(theatre_set[k], 1);
            }
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    }

    // Narrator Tools module integration
    // Find existing Narrator Tools entries (narration and description)
    let narrator_set = voiceL.flatMap((i, j) => ([game.i18n.localize("TTSC.VoiceNarrateNT"), game.i18n.localize("TTSC.VoiceDescNT")].includes(i.name) && i.type == 4) ? j : []);
    if (game.modules.get('narrator-tools')?.active) {
        // Add Narrator Tools entries if not exist
        if (narrator_set.length == 0) {
            voiceL.unshift(
                { type: 4, name: game.i18n.localize("TTSC.VoiceNarrateNT"), id: "narrate", voice: 0, vtype: 0, volume: bymchndefVolume },
                { type: 4, name: game.i18n.localize("TTSC.VoiceDescNT"), id: "desc", voice: 0, vtype: 0, volume: bymchndefVolume }
            );
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    } else {
        // Remove Narrator Tools entries if module is inactive
        if (narrator_set.length > 0) {
            // Reverse indices to delete from end to start (prevents index shifting issues)
            narrator_set = narrator_set.reverse();
            for (let k = 0; k < narrator_set.length; k++) {
                voiceL.splice(narrator_set[k], 1)
            }
        }
        await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
    }
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export module integration functions to namespace
window.BymChnConnector.modules = window.BymChnConnector.modules || {};
window.BymChnConnector.modules.initializeIntegrations = initializeModuleIntegrations;
