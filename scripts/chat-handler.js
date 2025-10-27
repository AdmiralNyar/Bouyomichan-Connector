/**
 * Bouyomichan Connector - Chat Handler Module
 * Handles chat message processing, socket communication, and TTS coordination
 */

/**
 * Module integration priority settings
 * These constants control behavior when multiple modules conflict
 */
// Theatre priority over Multiple Chat Tabs forceOOC
// Current spec: Theatre takes priority (forceOOC is skipped when Theatre is active)
// Future spec change: Set to false to apply forceOOC even when Theatre is active
const THEATRE_PRIORITY_OVER_FORCEOOC = true;

/**
 * Check if Multiple Chat Tabs active tab has forceOOC enabled
 * @param {string} userid - User ID
 * @returns {boolean} True if forceOOC is enabled for active tab
 */
function checkMultipleChatTabsForceOOC(userid) {
    try {
        const mctModule = game.modules.get("multiple-chat-tabs");
        if (!mctModule?.active) return false;

        // Spec: When Theatre and Multiple Chat Tabs are both active, Theatre takes priority
        // (forceOOC is not applied when Theatre is being used)
        // Future spec change: Set THEATRE_PRIORITY_OVER_FORCEOOC to false to change this behavior
        if (THEATRE_PRIORITY_OVER_FORCEOOC) {
            if (typeof Theatre !== 'undefined' && Theatre?.instance) {
                const instance = Theatre.instance;
                // Skip forceOOC if Theatre feature is currently in use
                if (instance?.speakingAs && instance?.usersTyping?.[userid]) {
                    return false;
                }
            }
        }

        // Get tab settings
        const tabs = JSON.parse(game.settings.get("multiple-chat-tabs", "tabs") || "[]");
        if (tabs.length === 0) return false;

        // Get active tab ID from DOM
        const chatElement = document.querySelector("#sidebar #chat");
        let activeTabId = chatElement?.dataset?.activeFilter;

        // Fallback: Use default tab if active tab ID not found
        if (!activeTabId) {
            activeTabId = tabs.find(t => t.isDefault)?.id || tabs[0]?.id;
        }

        // Find active tab
        const activeTab = tabs.find(t => t.id === activeTabId);

        return activeTab?.forceOOC === true;

    } catch (error) {
        console.error('[BymChnConnector] Multiple Chat Tabs forceOOC check failed:', error);
        return false;
    }
}

/**
 * Check if message is IC (In Character)
 * @param {Object} document - Chat message document
 * @returns {boolean} True if message is IC
 */
// Currently unused function - Kept for potential future use
// Note: This function checks document.style which may be modified by Multiple Chat Tabs
// before this module's hook runs, causing incorrect IC detection.
// Use actorId-based detection instead (see line 464).
/*
function checkICMessage(document) {
    try {
        const mctModule = game.modules.get("multiple-chat-tabs");
        if (!mctModule?.active) return false;

        const api = mctModule.api;

        // Different check methods for Foundry v11+ and v10-
        const isIC = api?.isV11()
            ? document.type === CONST.CHAT_MESSAGE_TYPES.IC
            : document.style === CONST.CHAT_MESSAGE_STYLES.IC;

        return isIC;

    } catch (error) {
        console.error('[BymChnConnector] IC message check failed:', error);
        return false;
    }
}
*/

/**
 * Get active chat tab ID for current user
 * @returns {string|null} Active tab ID or null if Multiple Chat Tabs is not active
 */
function getActiveChatTabId() {
    try {
        const mctModule = game.modules.get("multiple-chat-tabs");
        if (!mctModule?.active) return null;

        // Get active tab ID from DOM
        const chatElement = document.querySelector("#sidebar #chat");
        const activeTabId = chatElement?.dataset?.activeFilter;

        // If active tab ID found, return it
        if (activeTabId) {
            return activeTabId;
        }

        // Fallback: Get tab settings and use default tab
        const tabs = JSON.parse(game.settings.get("multiple-chat-tabs", "tabs") || "[]");
        if (tabs.length === 0) return null;

        return tabs.find(t => t.isDefault)?.id || tabs[0]?.id;

    } catch (error) {
        console.error('[BymChnConnector] Failed to get active chat tab:', error);
        return null;
    }
}

/**
 * Check if active chat tab is muted for TTS
 * @returns {boolean} True if active tab should not be read aloud
 */
function isActiveChatTabMuted() {
    try {
        const activeTabId = getActiveChatTabId();
        if (!activeTabId) return false;

        const mutedTabIds = game.settings.get(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs') || [];
        return mutedTabIds.includes(activeTabId);

    } catch (error) {
        console.error('[BymChnConnector] Failed to check muted chat tab:', error);
        return false;
    }
}

/**
 * Check if Theatre module will auto-add quote brackets
 * @param {Object} data - Chat data from preCreateChatMessage hook
 * @param {string} userid - User ID
 * @returns {boolean} True if Theatre will add brackets
 */
function checkTheatreAutoQuote(data, userid) {
    if (!game.modules.get('theatre')?.active) {
        return false;
    }

    try {
        // Check Theatre global and instance exist
        if (typeof Theatre === 'undefined' || !Theatre?.instance) {
            return false;
        }

        const instance = Theatre.instance;

        // Safe property access with optional chaining
        const condition1 = !!instance?.speakingAs;
        const condition2 = !!instance?.usersTyping?.[userid];
        const condition3 = instance?.isQuoteAuto === true;
        const condition4 = !!data?.speaker;
        const condition5 = !!(data?.content && !data.content.match(/\<div.*\>[\s\S]*\<\/div\>/));

        return condition1 && condition2 && condition3 && condition4 && condition5;

    } catch (error) {
        console.error('[BymChnConnector] Theatre auto-quote check failed:', error);
        return false;
    }
}

/**
 * Handle socket messages from other users for TTS synchronization
 * @param {Object} packet - Socket packet containing TTS request data
 */
async function handleSocketMessage(packet) {
    const data = packet.data;
    const type = packet.type;
    const receiveUserId = packet.receiveUserId;
    const narT = packet.narratorT;
    const sendUserId = packet.sendUserId;
    const isTheatreAutoQuote = packet.isTheatreAutoQuote || false;
    const isForceOOC = packet.isForceOOC || false;
    const chatTabId = packet.chatTabId;

    if (type == "request") {
        const active = await game.settings.get("BymChnConnector", "active");

        // Check if the sender's chat tab is muted on this client
        if (chatTabId) {
            const mutedTabIds = game.settings.get(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs') || [];
            if (mutedTabIds.includes(chatTabId)) {
                return;  // Skip TTS for muted tab
            }
        }

        // Determine context for voice selection
        const theatre = game.modules.get('theatre')?.active && narT == "theatre-narrator";
        const narrateNT = game.modules.get('narrator-tools')?.active && narT == "narration";
        const descNT = game.modules.get('narrator-tools')?.active && narT == "description";

        // Get actorId from speaker, but force to null if forceOOC is enabled
        const actorId = isForceOOC ? null : (data.speaker?.actor || null);

        // Prepare speaker object - remove actor if forceOOC is active
        const contextSpeaker = isForceOOC ? { ...data.speaker } : data.speaker;
        if (isForceOOC && contextSpeaker.actor) {
            delete contextSpeaker.actor;
        }

        const context = {
            sendUserId: sendUserId,
            speaker: contextSpeaker,
            narratorT: narT,
            theatre: theatre,
            narrateNT: narrateNT,
            descNT: descNT,
            actorId: actorId
        };

        // Get voice settings using common function
        const { voice, volume, vtype } = await BymChnConnector.voiceEngine.getVoiceSettings(context);

        // Apply bracket filtering (skip for external modules, Theatre auto-quote, or forceOOC)
        const isExternalModule = theatre || narrateNT || descNT;
        let text = data.message;
        let filteredResult = text;
        let bracketMode = 0;
        let isActor = false;

        if (!isExternalModule && !isTheatreAutoQuote && !isForceOOC) {
            // Normal bracket filtering
            bracketMode = await game.settings.get("BymChnConnector", "bracketReadingMode");
            isActor = !!actorId && actorId !== "Narrator";

            // Debug logging for bracket filter
            const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
            if (debugMode) {
                console.log('[BracketFilter] Socket - ActorId:', actorId, 'IsActor:', isActor);
                console.log('[BracketFilter] Socket - Speaker:', data.speaker);
                console.log('[BracketFilter] Socket - Voice:', voice, 'Volume:', volume, 'VType:', vtype);
            }

            filteredResult = BymChnConnector.voiceEngine.applyBracketFilter(text, bracketMode, isActor);

            // Check if we should skip TTS (null result from bracket filter)
            if (filteredResult === null) return;
        } else if (isTheatreAutoQuote) {
            // Theatre auto-quote: treat as Mode 0
            const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
            if (debugMode) {
                console.log('[BracketFilter] Socket - Theatre auto-quote mode detected');
            }
            filteredResult = text;
        } else if (isForceOOC) {
            // Multiple Chat Tabs forceOOC: already processed on sender side
            const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
            if (debugMode) {
                console.log('[BracketFilter] Socket - Multiple Chat Tabs forceOOC mode detected');
            }
            filteredResult = text;
        }

        // Execute TTS based on original logic:
        // - BouyomiChan (vtype 0,1) only when active=true
        // - NijiVoice (vtype 3) regardless of active setting

        // Mode 3: Split voice processing (actor lines with user voice for outside brackets)
        // External modules always use Mode 0, so filteredResult.parts will be undefined
        if (filteredResult.parts) {
            const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");

            // Process each part separately
            for (let i = 0; i < filteredResult.parts.length; i++) {
                const part = filteredResult.parts[i];
                // Skip empty text or punctuation-only text
                if (!part.text || part.text.trim() === '' || part.text.trim().match(/^[。、？！]+$/)) continue;

                let partVoice, partVolume, partVtype;

                if (part.type === 'inside') {
                    // Inside brackets: use actor voice
                    partVoice = voice;
                    partVolume = volume;
                    partVtype = vtype;
                } else {
                    // Outside brackets: use user voice
                    // Remove actor from speaker to prevent actor voice selection
                    const userSpeaker = { ...data.speaker };
                    delete userSpeaker.actor;

                    const userContext = {
                        sendUserId: sendUserId,
                        speaker: userSpeaker,
                        narratorT: narT,
                        theatre: false,
                        narrateNT: false,
                        descNT: false,
                        actorId: null  // Force user voice
                    };
                    const userVoiceSettings = await BymChnConnector.voiceEngine.getVoiceSettings(userContext);
                    partVoice = userVoiceSettings.voice;
                    partVolume = userVoiceSettings.volume;
                    partVtype = userVoiceSettings.vtype;

                    if (debugMode) {
                        console.log('[BracketFilter] Socket - User Context:', userContext);
                        console.log('[BracketFilter] Socket - User Voice Settings:', userVoiceSettings);
                    }
                }

                // Add pause marker for better speech clarity (Bouyomichan/SAPI5 only)
                let processedText = part.text;
                if (partVtype == 0 || partVtype == 1) {
                    processedText = BymChnConnector.voiceEngine.addBracketPartPause(part.text, part.type);
                }

                if (debugMode) {
                    console.log(`[BracketFilter] Processing Part ${i + 1}:`, part.type, part.text);
                    if (processedText !== part.text) {
                        console.log('[BracketFilter] Added pause marker:', part.text, '->', processedText);
                    }
                    console.log('[BracketFilter] Voice:', partVoice, 'Volume:', partVolume, 'VType:', partVtype);
                }

                // Execute TTS for this part
                if (active && (partVtype == 0 || partVtype == 1)) {
                    await BymChnConnector.voiceEngine.executeTTS(processedText, partVoice, partVolume, partVtype, "No Name");
                } else if (partVtype == 3) {
                    await BymChnConnector.voiceEngine.executeTTS(processedText, partVoice, partVolume, partVtype, "No Name");
                }
            }
        } else {
            // Mode 0, 1, 2: Normal processing with filtered text
            text = typeof filteredResult === 'string' ? filteredResult : text;

            if (active && (vtype == 0 || vtype == 1)) {
                await BymChnConnector.voiceEngine.executeTTS(text, voice, volume, vtype, "No Name");
            } else if (vtype == 3) {
                await BymChnConnector.voiceEngine.executeTTS(text, voice, volume, vtype, "No Name");
            }
        }
    }
}

/**
 * Handle createChatMessage hook for Narrator Tools integration
 * Supports TTS for journal reading function
 * @param {Object} document - Chat message document
 * @param {Object} options - Creation options
 * @param {string} userId - User ID who created the message
 */
async function handleCreateChatMessage(document, options, userId) {
    if (!game.modules.get('narrator-tools')?.active) return;
    if (!document.flags['narrator-tools']) return;

    const active = await game.settings.get("BymChnConnector", "active");
    if (!active) return;

    const narratorType = document.flags['narrator-tools'].type;
    if (!["description", "narration"].includes(narratorType)) return;

    // Get voice settings using common function
    const context = {
        narrateNT: narratorType === "narration",
        descNT: narratorType === "description"
    };
    const { voice, volume, vtype } = await BymChnConnector.voiceEngine.getVoiceSettings(context);

    // Process text using common function
    let text = BymChnConnector.voiceEngine.processTextForTTS(document.content);
    if (!text) return;

    // Note: Narrator Tools messages are always treated as Mode 0 (no bracket filtering)

    // Get actual tab ID where this message will be sent
    // For Narrator Tools, sourceTab contains the target tab ID
    const activeTabId = document.flags?.["multiple-chat-tabs"]?.sourceTab || getActiveChatTabId();

    // Send socket message
    const speaker = BymChnConnector.utils.isNewVersion ? { ...document.speaker } : { ...document.data.speaker };
    const packet = {
        data: { message: text, speaker: speaker },
        type: "request",
        sendUserId: game.user.id,
        narratorT: narratorType,
        chatTabId: activeTabId
    };
    game.socket.emit('module.BymChnConnector', packet);

    // Execute TTS using common function
    const alias = document.alias || "No Name";

    // ミュートされたタブからの送信時はローカルTTSをスキップ
    // activeTabIdには実際のメッセージ送信先タブIDが入っている
    if (activeTabId) {
        const mutedTabIds = game.settings.get(BymChnConnector.config.MODULE_NAME, 'mutedChatTabs') || [];
        if (mutedTabIds.includes(activeTabId)) {
            return; // ローカルTTSをスキップ
        }
    }

    await BymChnConnector.voiceEngine.executeTTS(text, voice, volume, vtype, alias);
}

/**
 * Handle chatMessage hook for general chat processing
 * Processes chat messages and triggers TTS based on message type
 * @param {Object} chatLog - Chat log instance
 * @param {string} message - Raw chat message text
 * @param {Object} chatData - Chat data object
 */
async function handleChatMessage(chatLog, message, chatData) {
    const doc = document;
    let parse = ChatLog.parse(message);
    // Skip processing to avoid conflicts with unknown modules
    let skip = false;

    switch (parse[0]) {
        case "roll": case "gmroll": case "blindroll": case "selfroll": case "publicroll": case "macro":
            skip = false;
            break;
        case "ic": case "emote": case "ooc": case "none":
            skip = true;
            break;
    }
    let whisper = await game.settings.get("BymChnConnector", "whisperSetting");
    if (!skip) {
        if (["whisper", "reply", "gm", "players"].includes(parse[0]) && whisper) skip = true;
    }

    if (skip) {
        Hooks.once("preCreateChatMessage", async (document, data, options, userId) => {
            const isV10Plus = isNewerVersion(game.version, '10');
            if (isV10Plus) {
                if (document.whisper.length != 0 && !whisper) return;
            } else {
                if (document.data.whisper.length != 0 && !whisper) return;
            }


            const polyglot = (!game.settings.get("BymChnConnector", "polyglotSetting") && game.modules.get('polyglot')?.active);
            const active = await game.settings.get("BymChnConnector", "active");

            // Determine context and actorId
            const theatre = game.modules.get('theatre')?.active && Theatre.instance.speakingAs == "Narrator";
            const narrateNT = game.modules.get('narrator-tools')?.active && document.flags["narrator-tools"]?.type == "narration";
            const descNT = game.modules.get('narrator-tools')?.active && document.flags["narrator-tools"]?.type == "description";

            let actorId = null;
            const userid = BymChnConnector.utils.isNewVersion ? document.user.id : document.data.user;

            // Get actorId from Theatre instance
            if (game.modules.get('theatre')?.active) {
                actorId = (Theatre.instance.usersTyping[userid].theatreId)?.replace("theatre-", "");
            }

            // Handle Speak-as module integration
            if (game.modules.get('speak-as')?.active) {
                let namelist = doc.getElementById('namelist');
                let checked = doc.getElementById("speakerSwitch").checked;
                if (!!namelist && !!checked) {
                    if (namelist.value != "userName") {
                        data.speaker.actor = namelist.value;
                        if (!actorId) actorId = namelist.value;
                    }
                }
            }

            // Fallback: Get actorId from speaker.actor if not set by external modules
            if (!actorId && data.speaker?.actor) {
                actorId = data.speaker.actor;
            }

            // Check Multiple Chat Tabs forceOOC
            const isForceOOC = checkMultipleChatTabsForceOOC(userid);
            // IC判定: actorIdが存在し、外部モジュールでない場合
            // Multiple Chat Tabsがdocument.styleを変更した後でも、actorIdは元の値を保持している
            const isIC = !!actorId && !theatre && !narrateNT && !descNT;
            const shouldForceUserVoice = isForceOOC && isIC;

            // Prepare speaker object - remove actor if forceOOC is active
            const contextSpeaker = shouldForceUserVoice ? { ...data.speaker } : data.speaker;
            if (shouldForceUserVoice && contextSpeaker.actor) {
                delete contextSpeaker.actor;
            }

            const context = {
                sendUserId: userId,
                speaker: contextSpeaker,
                theatre: theatre,
                narrateNT: narrateNT,
                descNT: descNT,
                actorId: shouldForceUserVoice ? null : actorId  // forceOOC forces User/GM voice
            };

            // Get voice settings using common function
            const { voice, volume, vtype } = await BymChnConnector.voiceEngine.getVoiceSettings(context);

            // Process text using common function
            let text = BymChnConnector.voiceEngine.processTextForTTS(data.content);
            if (!text) return;

            // Check if Theatre will auto-add quote brackets
            const isTheatreAutoQuote = checkTheatreAutoQuote(data, userid);

            // Apply bracket filtering (skip for external modules or Theatre auto-quote)
            const isExternalModule = theatre || narrateNT || descNT;
            let filteredResult = text; // Default to original text
            let bracketMode = 0;
            let isActor = false;

            if (!isExternalModule && !isTheatreAutoQuote && !shouldForceUserVoice) {
                // Normal bracket filtering
                bracketMode = await game.settings.get("BymChnConnector", "bracketReadingMode");
                isActor = !!actorId && actorId !== "Narrator";

                // Debug logging for bracket filter
                const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
                if (debugMode) {
                    console.log('[BracketFilter] PreCreate - ActorId:', actorId, 'IsActor:', isActor);
                    console.log('[BracketFilter] PreCreate - Speaker:', data.speaker);
                    console.log('[BracketFilter] PreCreate - Voice:', voice, 'Volume:', volume, 'VType:', vtype);
                }

                filteredResult = BymChnConnector.voiceEngine.applyBracketFilter(text, bracketMode, isActor);

                // Check if we should skip TTS (null result from bracket filter)
                if (filteredResult === null) return;
            } else if (isTheatreAutoQuote) {
                // Theatre auto-quote: treat as Mode 0
                const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
                if (debugMode) {
                    console.log('[BracketFilter] PreCreate - Theatre auto-quote mode detected');
                }
                filteredResult = text;
            } else if (shouldForceUserVoice) {
                // Multiple Chat Tabs forceOOC: Mode 3 → Mode 0, others apply normal filtering
                bracketMode = await game.settings.get("BymChnConnector", "bracketReadingMode");
                const effectiveBracketMode = (bracketMode === 3) ? 0 : bracketMode;

                const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");
                if (debugMode) {
                    console.log('[BracketFilter] PreCreate - Multiple Chat Tabs forceOOC detected');
                    console.log('[BracketFilter] Original Mode:', bracketMode, 'Effective Mode:', effectiveBracketMode);
                }

                if (effectiveBracketMode === 0) {
                    // Mode 3 → Mode 0: no filtering
                    filteredResult = text;
                } else {
                    // Mode 1, 2: apply normal filtering using original actorId
                    const originalIsActor = !!actorId && actorId !== "Narrator";
                    filteredResult = BymChnConnector.voiceEngine.applyBracketFilter(text, effectiveBracketMode, originalIsActor);

                    // Check if we should skip TTS
                    if (filteredResult === null) return;
                }
            }

            // Update speaker with actorId if needed
            const speaker = BymChnConnector.utils.isNewVersion ? { ...document.speaker } : { ...document.data.speaker };
            if (theatre || narrateNT || descNT) {
                // External modules: clear actor to use module-specific voice
                delete speaker.actor;
            } else if (shouldForceUserVoice) {
                // Multiple Chat Tabs forceOOC: clear actor to use user voice
                delete speaker.actor;
            } else if (actorId != "Narrator" && !!actorId) {
                speaker.actor = actorId;
            }

            const nT = narrateNT ? "narration" : descNT ? "description" : theatre ? "theatre-narrator" : null;
            const lang = !polyglot ? null : document.getFlag('polyglot', 'language');

            if (!lang) {
                // Get active tab ID for socket message
                const activeTabId = getActiveChatTabId();

                // Send socket message once with unfiltered text for remote users to process
                // Remote users will apply their own bracket filter settings
                const packet = {
                    data: { message: text, speaker: speaker },
                    type: "request",
                    sendUserId: game.user.id,
                    narratorT: nT,
                    isTheatreAutoQuote: isTheatreAutoQuote,
                    isForceOOC: shouldForceUserVoice,
                    chatTabId: activeTabId
                };
                if (text) game.socket.emit('module.BymChnConnector', packet);

                // Mode 3: Split voice processing (actor lines with user voice for outside brackets)
                // External modules always use Mode 0, so filteredResult.parts will be undefined
                if (filteredResult.parts) {
                    const debugMode = await game.settings.get("BymChnConnector", "bracketDebugMode");

                    // Process each part separately for local TTS
                    for (let i = 0; i < filteredResult.parts.length; i++) {
                        const part = filteredResult.parts[i];
                        // Skip empty text or punctuation-only text
                        if (!part.text || part.text.trim() === '' || part.text.trim().match(/^[。、？！]+$/)) continue;

                        let partVoice, partVolume, partVtype;

                        if (part.type === 'inside') {
                            // Inside brackets: use actor voice
                            partVoice = voice;
                            partVolume = volume;
                            partVtype = vtype;
                        } else {
                            // Outside brackets: use user voice
                            // Remove actor from speaker to prevent actor voice selection
                            const userSpeaker = { ...data.speaker };
                            delete userSpeaker.actor;

                            const userContext = {
                                sendUserId: userId,
                                speaker: userSpeaker,
                                narratorT: nT,
                                theatre: false,
                                narrateNT: false,
                                descNT: false,
                                actorId: null  // Force user voice
                            };
                            const userVoiceSettings = await BymChnConnector.voiceEngine.getVoiceSettings(userContext);
                            partVoice = userVoiceSettings.voice;
                            partVolume = userVoiceSettings.volume;
                            partVtype = userVoiceSettings.vtype;

                            if (debugMode) {
                                console.log('[BracketFilter] PreCreate - User Context:', userContext);
                                console.log('[BracketFilter] PreCreate - User Voice Settings:', userVoiceSettings);
                            }
                        }

                        // Add pause marker for better speech clarity (Bouyomichan/SAPI5 only)
                        let processedText = part.text;
                        if (partVtype == 0 || partVtype == 1) {
                            processedText = BymChnConnector.voiceEngine.addBracketPartPause(part.text, part.type);
                        }

                        if (debugMode) {
                            console.log(`[BracketFilter] Processing Part ${i + 1}:`, part.type, part.text);
                            if (processedText !== part.text) {
                                console.log('[BracketFilter] Added pause marker:', part.text, '->', processedText);
                            }
                            console.log('[BracketFilter] Voice:', partVoice, 'Volume:', partVolume, 'VType:', partVtype);
                        }

                        // Execute TTS locally for this part
                        if (active) {
                            const alias = document.alias || "No Name";
                            // ミュートされたタブからの送信時はローカルTTSをスキップ
                            if (!isActiveChatTabMuted()) {
                                await BymChnConnector.voiceEngine.executeTTS(processedText, partVoice, partVolume, partVtype, alias);
                            }
                        }
                    }
                } else {
                    // Mode 0, 1, 2: Normal processing with filtered text
                    text = typeof filteredResult === 'string' ? filteredResult : text;

                    // Execute TTS locally - original logic: all voice types only when active
                    if (active) {
                        const alias = document.alias || "No Name";
                        // ミュートされたタブからの送信時はローカルTTSをスキップ
                        if (!isActiveChatTabMuted()) {
                            await BymChnConnector.voiceEngine.executeTTS(text, voice, volume, vtype, alias);
                        }
                    }
                }
            }
        });
    }
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export chat handler functions to namespace
window.BymChnConnector.chat = window.BymChnConnector.chat || {};
window.BymChnConnector.chat.handleSocketMessage = handleSocketMessage;
window.BymChnConnector.chat.handleCreateChatMessage = handleCreateChatMessage;
window.BymChnConnector.chat.handleChatMessage = handleChatMessage;
