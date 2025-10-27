/**
 * Bouyomichan Connector - Voice Engine Module
 * Handles TTS processing, voice selection, and engine coordination
 */

/**
 * Calculate default volume for specific voice engine type
 * @async
 * @param {number} vtype - Voice type (0: Builtin, 1: SAPI5, 3: NijiVoice)
 * @returns {Promise<number>} Volume value appropriate for the voice engine
 */
async function getDefaultVolumeForEngine(vtype = 0) {
    let bymchndefVolume = await game.settings.get(BymChnConnector.config.MODULE_NAME, "BymChnDefVolume");

    switch (vtype) {
        case 1: // SAPI5 - uses raw volume value without normalization
            return bymchndefVolume;
        case 3: // NijiVoice - uses normalized value without -1 fallback
            return Math.round((bymchndefVolume * 1000) / 300) / 1000;
        default: // Builtin (0) and others - uses normalized value with -1 fallback
            bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
            if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
            return bymchndefVolume;
    }
}

/**
 * Calculate normalized default volume for TTS (backward compatibility)
 * @async
 * @returns {Promise<number>} Normalized volume value for builtin voices
 */
async function getDefaultVolume() {
    return await getDefaultVolumeForEngine(0);
}

/**
 * Process HTML content and extract clean text for TTS
 * @param {string} htmlContent - HTML content string
 * @returns {string} Processed text ready for TTS
 */
function processTextForTTS(htmlContent) {
    let text = "";
    // Wrap content in div to ensure proper HTML parsing
    const textdata = BymChnConnector.utils.htmlTokenizer("<div>" + htmlContent + "</div>");

    for (let k = 0; k < textdata.length; k++) {
        // Process non-HTML tag content (actual text nodes)
        if (!textdata[k].match(/^\<(".*?"|'.*?'|[^'"])*?\>/)) {
            // Add period to text segments that don't end with punctuation
            // This improves TTS pronunciation by providing proper sentence breaks
            if (!textdata[k].match(/、$|,$|。$|\.$/)) {
                text += textdata[k];
                text += "。"; // Add Japanese period for natural speech rhythm
            } else {
                text += textdata[k];
            }
        } else if (textdata[k].match(/(<br>|<br \/>)/gi)) {
            // Convert HTML line breaks to actual line breaks for TTS pause
            text += '\n';
        }
        // Skip other HTML tags (they are not voiced)
    }

    return text;
}

/**
 * Get voice settings for a speaker based on context
 * @async
 * @param {Object} context - Speaker context information
 * @param {string} context.sendUserId - ID of the sending user
 * @param {Object} context.speaker - Speaker object with actor information
 * @param {string} context.narratorT - Narrator tools type ("narration" or "description")
 * @param {boolean} context.theatre - Whether theatre mode is active
 * @param {boolean} context.narrateNT - Whether narration mode is active
 * @param {boolean} context.descNT - Whether description mode is active
 * @param {string} context.actorId - Actor ID if speaking as actor
 * @returns {Promise<Object>} Voice settings object with voice, volume, and vtype
 */
async function getVoiceSettings(context) {
    const list = await game.user.getFlag("BymChnConnector", "select-voice");
    let voice = 0;
    let volume = null;
    let vtype = 0;

    // Check Actor voice first (highest priority - matches original logic)
    if (context.actorId && context.actorId != "Narrator") {
        const index = list.findIndex(i => i.type == 1 && i.id == context.actorId);
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        } else {
            // Use default volume for engine type 0 if actor not found
            voice = 0;
            volume = await getDefaultVolumeForEngine(0);
            vtype = 0;
        }
    }
    // Check Theatre mode
    else if (context.theatre) {
        const index = list.findIndex(k => k.type == 2 && k.id == 'theater');
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        }
    }
    // Check Narrator Tools - Narration
    else if (context.narrateNT) {
        const index = list.findIndex(k => k.type == 4 && k.id == 'narrate');
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        }
    }
    // Check Narrator Tools - Description
    else if (context.descNT) {
        const index = list.findIndex(k => k.type == 4 && k.id == 'desc');
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        }
    }
    // Check Speaker actor
    else if (context.speaker?.actor) {
        const index = list.findIndex(i => i.type == 1 && i.id == context.speaker.actor);
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        } else {
            // Use default volume for engine type 0 if actor not found
            voice = 0;
            volume = await getDefaultVolumeForEngine(0);
            vtype = 0;
        }
    }
    // Check User voice (lowest priority)
    else if (context.sendUserId) {
        const index = list.findIndex(j => j.type == 0 && j.id == context.sendUserId);
        if (index >= 0) {
            voice = list[index].voice;
            volume = list[index].volume;
            vtype = list[index].vtype;
        } else {
            // Use default volume for engine type 0 if user not found
            voice = 0;
            volume = await getDefaultVolumeForEngine(0);
            vtype = 0;
        }
    }

    // If no volume was set, use default for detected voice type
    if (volume === null) {
        volume = await getDefaultVolumeForEngine(vtype);
    }

    return { voice, volume, vtype };
}

/**
 * Extract text inside Japanese brackets 「」
 * @param {string} text - Original text
 * @returns {string} Extracted text from inside brackets
 */
function extractInsideBrackets(text) {
    const bracketPattern = /「([^」]*)」/g;
    const matches = [...text.matchAll(bracketPattern)];
    if (matches.length === 0) return ''; // No brackets found
    return matches.map(m => m[1]).filter(t => t.trim()).join('。');
}

/**
 * Extract text outside Japanese brackets 「」
 * @param {string} text - Original text
 * @returns {string} Extracted text from outside brackets
 */
function extractOutsideBrackets(text) {
    return text.replace(/「[^」]*」/g, '').trim();
}

/**
 * Split text into inside/outside bracket parts for Mode 3
 * @param {string} text - Original text
 * @returns {Object} Object with parts array
 */
function splitByBrackets(text) {
    const parts = [];
    let lastIndex = 0;
    const bracketPattern = /「([^」]*)」/g;
    let match;

    while ((match = bracketPattern.exec(text)) !== null) {
        // Add outside text before this bracket
        const beforeText = text.substring(lastIndex, match.index).trim();
        if (beforeText) {
            parts.push({ type: 'outside', text: beforeText });
        }

        // Add inside text
        if (match[1] && match[1].trim()) {
            parts.push({ type: 'inside', text: match[1].trim() });
        }

        lastIndex = bracketPattern.lastIndex;
    }

    // Add remaining text after last bracket
    const afterText = text.substring(lastIndex).trim();
    if (afterText) {
        parts.push({ type: 'outside', text: afterText });
    }

    return { parts };
}

/**
 * Apply bracket filtering based on mode
 * @param {string} text - Original text
 * @param {number} mode - Bracket reading mode (0-3)
 * @param {boolean} isActor - Whether the speaker is an actor
 * @returns {string|Object|null} Filtered text, split parts object, or null to skip
 */
function applyBracketFilter(text, mode, isActor) {
    const debugMode = game.settings.get("BymChnConnector", "bracketDebugMode");

    if (debugMode) {
        console.log('[BracketFilter] Mode:', mode, 'IsActor:', isActor, 'Original Text:', text);
    }

    // Mode 0: No filtering
    if (mode === 0) return text;

    const bracketPattern = /「([^」]*)」/g;
    const hasBrackets = bracketPattern.test(text);

    // Mode 1: Extract only inside brackets (everyone)
    if (mode === 1) {
        const extracted = extractInsideBrackets(text);
        if (debugMode) {
            console.log('[BracketFilter] Mode 1 - Extracted Inside:', extracted);
        }
        return extracted || null; // Return null to skip if empty
    }

    // Mode 2: Extract only inside brackets (actors only)
    if (mode === 2) {
        if (isActor) {
            const extracted = extractInsideBrackets(text);
            if (debugMode) {
                console.log('[BracketFilter] Mode 2 (Actor) - Extracted Inside:', extracted);
            }
            return extracted || null; // Return null to skip if empty
        }
        if (debugMode) {
            console.log('[BracketFilter] Mode 2 (Non-Actor) - No change');
        }
        return text; // No change for non-actors
    }

    // Mode 3: Split for dual-voice reading (actors only)
    if (mode === 3) {
        if (isActor) {
            const result = splitByBrackets(text);
            if (debugMode) {
                console.log('[BracketFilter] Mode 3 (Actor) - Split Parts:', result.parts);
            }
            // Return split parts for special handling
            return result;
        }
        if (debugMode) {
            console.log('[BracketFilter] Mode 3 (Non-Actor) - No change');
        }
        return text; // No change for non-actors
    }

    return text;
}

/**
 * Add pause marker to text for Mode 3 bracket parts
 * Adds period (。) to create natural pause between inside/outside parts
 * @param {string} text - Original text
 * @param {string} partType - Part type ('inside' or 'outside')
 * @returns {string} Text with pause marker if needed
 */
function addBracketPartPause(text, partType) {
    if (!text || typeof text !== 'string') return text;

    // 既に句読点で終わっている場合はそのまま
    if (text.match(/[。、？！]$/)) {
        return text;
    }

    // inside/outsideともに句点を追加してポーズを作る
    return text + '。';
}

/**
 * Execute TTS with appropriate voice synthesis engine
 * @async
 * @param {string} text - Text to synthesize
 * @param {number} voice - Voice ID
 * @param {number} volume - Volume level
 * @param {number} vtype - Voice type (0: Builtin, 1: SAPI5, 3: NijiVoice)
 * @param {string} alias - Speaker alias for NijiVoice
 * @returns {Promise<void>}
 */
async function executeTTS(text, voice, volume, vtype, alias = "No Name") {
    if (!text) return;

    // Validate and normalize volume for builtin and SAPI5 voices
    // Values outside 0-1 range are set to -1 (use system default)
    if ((volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) {
        volume = -1;
    }

    try {
        if (vtype == 0 || vtype == 1) {
            // BouyomiChan TTS (local application)
            // vtype 0: Built-in voices, vtype 1: SAPI5 voices
            const bouyomiChanClient = new BymChnConnector.client.BouyomiChanClient();
            // Convert 0-1 volume range to BouyomiChan's 0-300 range
            const normalizedVolume = Math.round(volume * 300);
            await bouyomiChanClient.talk(text, voice, normalizedVolume);
        } else if (vtype == 3) {
            // NijiVoice TTS (cloud-based API service)
            let processedText = text;
            // Remove trailing Japanese period as NijiVoice handles punctuation differently
            if (processedText.endsWith("。")) {
                processedText = processedText.slice(0, -1);
            }

            // Get user-configured settings for NijiVoice
            const limit = await game.settings.get(BymChnConnector.config.MODULE_NAME, "nijiVoiceLimit");
            const server = await game.settings.get(BymChnConnector.config.MODULE_NAME, "nijiVoiceToLocalAPI");

            // Send TTS request to NijiVoice API via local relay server
            const voiceData = await fetch(`${server}/getVoice`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    speaker: alias,      // Character name for voice selection
                    text: processedText, // Processed text without trailing period
                    id: voice,          // Voice ID
                    speed: 1.0,         // Fixed speech speed
                    volume: volume      // Volume (0-1 range for NijiVoice)
                })
            });

            const response = await voiceData.json();
            const remainingCredits = response.response?.generatedVoice?.remainingCredits;

            // Warn user if NijiVoice credits are running low
            if (remainingCredits !== undefined && remainingCredits < limit) {
                ui.notifications?.notify(
                    game.i18n.format("TTSC.NotifyNijiVoiceLimit", { cr: remainingCredits })
                );
            }
        }
        // Note: vtype 2 is reserved but not implemented
    } catch (error) {
        console.error('[BymChnConnector] TTS execution failed:', error);
    }
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export voice engine functions to namespace
window.BymChnConnector.voiceEngine = window.BymChnConnector.voiceEngine || {};
window.BymChnConnector.voiceEngine.getDefaultVolumeForEngine = getDefaultVolumeForEngine;
window.BymChnConnector.voiceEngine.getDefaultVolume = getDefaultVolume;
window.BymChnConnector.voiceEngine.processTextForTTS = processTextForTTS;
window.BymChnConnector.voiceEngine.getVoiceSettings = getVoiceSettings;
window.BymChnConnector.voiceEngine.executeTTS = executeTTS;
window.BymChnConnector.voiceEngine.applyBracketFilter = applyBracketFilter;
window.BymChnConnector.voiceEngine.extractInsideBrackets = extractInsideBrackets;
window.BymChnConnector.voiceEngine.extractOutsideBrackets = extractOutsideBrackets;
window.BymChnConnector.voiceEngine.splitByBrackets = splitByBrackets;
window.BymChnConnector.voiceEngine.addBracketPartPause = addBracketPartPause;
