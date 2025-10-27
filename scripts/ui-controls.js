/**
 * Bouyomichan Connector - UI Controls Module
 * Handles scene control buttons and UI interactions with Foundry VTT compatibility (v10-v13+)
 */

/**
 * Get the appropriate slider icon based on Foundry version
 * @returns {string} Font Awesome icon class string
 */
function getSliderIcon() {
    // Match original logic from main.js
    return isNewerVersion(game.version, '10') ? 'fa-duotone fa-sliders' : 'fas fa-sliders-h';
}

/**
 * Find sounds group in scene control buttons, handling v13+ and legacy format differences
 * @param {Array|Object} buttons - Scene control buttons array (v12) or object (v13)
 * @returns {Object|null} The sounds group object or null if not found
 */
function findSoundsGroup(buttons) {
    const isV13Plus = isNewerVersion(game.version, '13');

    if (isV13Plus) {
        // v13+: buttons is a Record<string, SceneControl> object
        // Direct property access is most efficient
        if (buttons.sounds) {
            return buttons.sounds;
        }
        // Fallback: search through all properties
        for (const key in buttons) {
            if (buttons[key] && buttons[key].name === 'sounds') {
                return buttons[key];
            }
        }
        return null;
    } else {
        // v10-v12: buttons is an Array<SceneControl>
        if (Array.isArray(buttons)) {
            return buttons.find(b => b.name === 'sounds') || null;
        }
        console.warn('[BymChnConnector] Expected buttons array in v12, but got:', typeof buttons);
        return null;
    }
}

/**
 * Add tool to scene control group, handling v13+ and legacy format differences
 * @param {Object} group - The scene control group
 * @param {Object} toolData - Tool configuration object
 * @returns {boolean} Success status
 */
function addToolToGroup(group, toolData) {
    try {
        const isV13Plus = isNewerVersion(game.version, '13');

        if (isV13Plus) {
            // v13+: tools is an object
            if (!group.tools) {
                group.tools = {};
            }
            // Object format: use tool name as key
            group.tools[toolData.name] = toolData;
        } else {
            // v10-v12: tools is an array
            if (!group.tools) {
                group.tools = [];
            }
            group.tools.push(toolData);
        }
    } catch (error) {
        console.error('[BymChnConnector] Failed to add tool to group:', error);
        return false;
    }
}

/**
 * Add player scene controls for non-GM users
 * This function automatically detects Foundry version and calls appropriate implementation
 */
function addPlayerSceneControls() {
    const isGM = game.user.isGM;
    if (isGM) return; // Only add controls for non-GM users

    const isV13Plus = isNewerVersion(game.version, '13');

    // Try multiple selectors for controls element based on Foundry version
    let controlsElement;
    if (isV13Plus) {
        // v13+ ApplicationV2 selectors
        controlsElement = document.querySelector('#ui-left #scene-controls');
    } else {
        // Legacy v10-v12 selectors
        controlsElement = document.querySelector('#controls') ||
            document.querySelector('#ui-left .scene-navigation');
    }

    if (!controlsElement) {
        console.warn('[BymChnConnector] Scene controls element not found');
        return;
    }

    try {
        if (isV13Plus) {
            addPlayerSceneControlsV13(controlsElement);
        } else {
            addPlayerSceneControlsLegacy(controlsElement);
        }
    } catch (error) {
        console.error('[BymChnConnector] Failed to add scene controls:', error);
    }
}

/**
 * Add player scene controls for Foundry v13+ (ApplicationV2 architecture)
 * @private
 */
async function addPlayerSceneControlsV13(controlsElement) {
    const playerSetting = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'playerSetting');

    // Find the layers menu container (v13 equivalent to v12 main controls)
    const controlsList = controlsElement.querySelector('menu#scene-controls-layers, ol.control-buttons, ol.main-controls, .scene-control-buttons');
    if (!controlsList) {
        console.warn('[BymChnConnector] Scene controls layers menu not found in v13');
        return;
    }

    // Check if TTS is currently active
    const isActive = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'active');

    // Create TTS activation button with proper state management
    const ttsButton = createControlButtonV13({
        classes: ['control', 'ui-control', 'tool', 'icon', 'plonly', 'activateTTS', 'toggle'].concat(isActive ? ['active'] : []),
        title: game.i18n.localize('TTSC.ButtonTTSOnOff'),
        icon: 'fas fa-comment-dots',
        dataAction: '',
        dataTool: '',
        onClick: async () => {
            const currentState = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'active');
            const newState = !currentState;
            await game.settings.set(BymChnConnector.config.MODULE_NAME, 'active', newState);

            // Immediate UI update (same behavior as legacy version)
            const button = ttsButtonElement;
            button.setAttribute('aria-pressed', newState.toString());
            const li = button.parentElement;
            if (newState) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        },
        isToggle: true
    });

    // Set initial aria-pressed state
    const ttsButtonElement = ttsButton.querySelector('button');
    ttsButtonElement.setAttribute('aria-pressed', isActive.toString());

    // Create speaker settings button (if player setting is enabled)
    let speakerButton = null;
    if (playerSetting) {
        speakerButton = createControlButtonV13({
            classes: ['control', 'ui-control', 'tool', 'icon', 'plonly', 'speakersettings'],
            title: game.i18n.localize('TTSC.ButtonTTSSpeakerSettings'),
            icon: getSliderIcon(),
            dataAction: '',
            dataTool: '',
            onClick: () => {
                // Call voiceSelector from voice-selector.js
                if (typeof BymChnConnector.ui.voiceSelector === 'function') {
                    BymChnConnector.ui.voiceSelector();
                } else {
                    console.warn('[BymChnConnector] voiceSelector function not available');
                }
            }
        });
    }

    // Append buttons to controls list
    if (speakerButton) controlsList.appendChild(speakerButton);
    controlsList.appendChild(ttsButton);

}

/**
 * Add player scene controls for legacy Foundry versions (v10-v12)
 * @private
 */
async function addPlayerSceneControlsLegacy(controlsElement) {
    const $controls = $(controlsElement);
    const lastMenu = $controls.find('ol.main-controls').children('*:last');

    if (lastMenu.length === 0) {
        console.warn('[BymChnConnector] Main controls not found for legacy version');
        return;
    }

    const playerSetting = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'playerSetting');
    const active = (await game.settings.get(BymChnConnector.config.MODULE_NAME, 'active')) ? 'active' : '';

    // Remove existing buttons to prevent duplicates
    $controls.find('.plonly').remove();

    // Add speaker settings button (if player setting is enabled)
    if (playerSetting) {
        const sliderIcon = getSliderIcon();
        lastMenu.after(
            `<li class="scene-control plonly speakersettings" title="${game.i18n.localize('TTSC.ButtonTTSSpeakerSettings')}" role="button"><i class="${sliderIcon}"></i></li>`
        );
    }

    // Add TTS toggle button
    lastMenu.after(
        `<li class="scene-control plonly activateTTS toggle ${active}" title="${game.i18n.localize('TTSC.ButtonTTSOnOff')}" role="button"><i class="fas fa-comment-dots"></i></li>`
    );

    // Attach event listeners
    $controls.find('.activateTTS')
        .off('click.bymchn')
        .on('click.bymchn', async function () {
            const currentState = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'active');
            await game.settings.set(BymChnConnector.config.MODULE_NAME, 'active', !currentState);
            $(this).toggleClass('active', !currentState);
        });

    if (playerSetting) {
        $controls.find('.speakersettings')
            .off('click.bymchn')
            .on('click.bymchn', function () {
                // Call voiceSelector from voice-selector.js
                if (typeof BymChnConnector.ui.voiceSelector === 'function') {
                    BymChnConnector.ui.voiceSelector();
                } else {
                    console.warn('[BymChnConnector] voiceSelector function not available');
                }
            });
    }
}

/**
 * Create a control button element for legacy versions (v10-v12)
 * @param {Object} config - Button configuration
 * @param {string[]} config.classes - CSS classes to apply
 * @param {string} config.title - Button title attribute
 * @param {string} config.icon - Font Awesome icon classes
 * @param {Function} config.onClick - Click event handler
 * @returns {HTMLLIElement} The created button element
 */
function createControlButton({ classes, title, icon, onClick }) {
    const li = document.createElement('li');
    li.className = classes.join(' ');
    li.title = title;
    li.setAttribute('role', 'button');

    const iconElement = document.createElement('i');
    iconElement.className = icon;
    li.appendChild(iconElement);

    if (onClick) {
        li.addEventListener('click', onClick);
    }

    return li;
}

/**
 * Create a control button element for Foundry v13+ (ApplicationV2 architecture)
 * @param {Object} config - Button configuration
 * @param {string[]} config.classes - CSS classes to apply
 * @param {string} config.title - Button title attribute
 * @param {string} config.icon - Font Awesome icon classes
 * @param {string} config.dataAction - Data action attribute
 * @param {string} config.dataTool - Data tool attribute
 * @param {Function} config.onClick - Click event handler
 * @param {boolean} config.isToggle - Whether this is a toggle button
 * @returns {HTMLLIElement} The created button element with nested button
 */
function createControlButtonV13({ classes, title, icon, dataAction, dataTool, onClick, isToggle = false }) {
    const li = document.createElement('li');
    const button = document.createElement('button');

    // Set up the list item
    button.className = classes.join(' ');

    // Set up the button element
    button.type = 'button';
    button.title = title;
    button.setAttribute('data-action', dataAction);
    button.setAttribute('data-tool', dataTool);

    // Add toggle-specific attributes
    if (isToggle) {
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('data-toggle', 'true');
    }

    // Create icon element
    const iconElement = document.createElement('i');
    if (icon.startsWith('<svg')) {
        // SVG icon - set as innerHTML
        iconElement.innerHTML = icon;
    } else {
        // Font Awesome icon - set as className
        iconElement.className = icon;
    }

    button.appendChild(iconElement);
    li.appendChild(button);

    // Attach click handler to button
    if (onClick) {
        button.addEventListener('click', onClick);
    }

    return li;
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export UI control functions to namespace
window.BymChnConnector.ui = window.BymChnConnector.ui || {};
window.BymChnConnector.ui.findSoundsGroup = findSoundsGroup;
window.BymChnConnector.ui.addToolToGroup = addToolToGroup;
window.BymChnConnector.ui.addPlayerSceneControls = addPlayerSceneControls;
window.BymChnConnector.ui.addPlayerSceneControlsV13 = addPlayerSceneControlsV13;
window.BymChnConnector.ui.addPlayerSceneControlsLegacy = addPlayerSceneControlsLegacy;
window.BymChnConnector.ui.createControlButton = createControlButton;
window.BymChnConnector.ui.createControlButtonV13 = createControlButtonV13;