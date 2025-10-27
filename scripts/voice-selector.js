/**
 * Bouyomichan Connector - Voice Selector Module
 * Handles voice selection dialog UI and bulk settings management
 */

/**
 * Voice selector dialog for configuring TTS settings
 */
async function voiceSelector() {
    const users = game.users.contents;
    let send;
    let def = [];
    let voiceList = await game.settings.get("BymChnConnector", "voice-list");
    let sapi5List = await game.settings.get("BymChnConnector", "sapi5-list");
    let nijiList = await game.settings.get("BymChnConnector", "niji-list");
    const bymchndefVolume = await BymChnConnector.voiceEngine.getDefaultVolume();

    // Only include NijiVoice options if the feature is enabled
    const nijiVoiceEnabled = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'nijiVoiceFunc');
    let sendList = nijiVoiceEnabled
        ? [...voiceList, ...sapi5List, ...nijiList]
        : [...voiceList, ...sapi5List];
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
        def.push({
            type: 1,
            name: actors[j].name,
            id: actors[j].id,
            voice: 0,
            volume: bymchndefVolume,
            vtype: 0,
            actorType: actors[j].type
        })
    }
    send = [...def];

    let flags;

    if (BymChnConnector.utils.isNewVersion) { flags = game.user.flags } else { flags = game.user.data.flags }

    if (!flags["BymChnConnector"]) {
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    } else {
        // Backward compatibility: add actorType to existing actor entries that don't have it
        for (let k = 0; k < flags["BymChnConnector"]["select-voice"].length; k++) {
            const existingItem = flags["BymChnConnector"]["select-voice"][k];

            // If this is an actor (type 1) without actorType, add it
            if (existingItem.type === 1 && !existingItem.actorType) {
                const actor = game.actors.get(existingItem.id);
                if (actor) {
                    existingItem.actorType = actor.type;
                }
            }
        }

        for (let k = 0; k < flags["BymChnConnector"]["select-voice"].length; k++) {
            let index = send.findIndex(a => (a.id == (flags["BymChnConnector"]["select-voice"][k].id) && (a.name == flags["BymChnConnector"]["select-voice"][k].name)) || ([2, 4].includes(flags["BymChnConnector"]["select-voice"][k].type) && a.id == flags["BymChnConnector"]["select-voice"][k].id));
            if (index >= 0) {
                send[index] = { ...flags["BymChnConnector"]["select-voice"][k] }
            }
        }
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    }

    // Categorize users by type for accordion UI
    const moduleUsers = flags["BymChnConnector"]["select-voice"].filter(user => user.type === 2 || user.type === 4);
    const systemUsers = flags["BymChnConnector"]["select-voice"].filter(user => user.type === 0);
    const actorUsers = flags["BymChnConnector"]["select-voice"].filter(user => user.type === 1);

    // Check if actor subdivision is enabled
    const actorSubdivisionEnabled = await game.settings.get(BymChnConnector.config.MODULE_NAME, 'actorSubdivisionSetting');
    let actorGroups = null;
    let actorTypes = null;

    if (actorSubdivisionEnabled && actorUsers.length > 0) {
        // Get available actor types based on Foundry version
        const isV12Plus = isNewerVersion(game.version, '12');
        if (isV12Plus) {
            actorTypes = Object.keys(game.system.documentTypes.Actor || {});
        } else {
            actorTypes = game.system.template?.Actor?.types || [];
        }

        // Group actors by type using stored actorType field for better performance
        actorGroups = {};
        actorTypes.forEach(type => {
            actorGroups[type] = actorUsers.filter(user => {
                // Use stored actorType if available, fallback to actor lookup
                if (user.actorType) {
                    return user.actorType === type;
                } else {
                    const actor = game.actors.get(user.id);
                    return actor && actor.type === type;
                }
            });
        });

        // Filter out empty groups
        actorGroups = Object.fromEntries(
            Object.entries(actorGroups).filter(([type, actors]) => actors.length > 0)
        );
    }

    const templateData = {
        moduleUsers: moduleUsers,
        systemUsers: systemUsers,
        actorUsers: actorUsers,
        actorSubdivisionEnabled: actorSubdivisionEnabled,
        actorGroups: actorGroups,
        actorTypes: actorTypes,
        voiceList: sendList,
        hasModuleUsers: moduleUsers.length > 0
    };

    const html = await renderTemplate('modules/BymChnConnector/templates/VoiceSelectDialog.html', templateData);

    const data = await new Promise(resolve => {
        const dlg = new Dialog({
            title: game.i18n.localize("TTSC.WindowSelectSpeakerVoicetitle"),
            content: html,
            buttons: {
                submit: {
                    label: game.i18n.localize("TTSC.WindowSave"),
                    icon: `<i class="far fa-save"></i>`,
                    callback: async (html) => {
                        formData = new FormData(html[0].querySelector('#select-voice'));
                        for (let l = 0; l < send.length; l++) {
                            let re = formData.get(send[l].id);
                            if (Number(re.split("&&")[0])) {
                                send[l].voice = Number(re.split("&&")[0]);
                            } else {
                                send[l].voice = re.split("&&")[0];
                            }
                            send[l].vtype = Number(re.split("&&")[1]);
                            let vo = formData.get(send[l].id + "volume");
                            send[l].volume = Number(vo)

                        }
                        await game.user.setFlag("BymChnConnector", "select-voice", send);
                        return resolve(true)
                    }
                },
                cancel: {
                    label: game.i18n.localize("TTSC.WindowCancel"),
                    icon: `<i class="fas fa-ban"></i>`,
                    callback: async () => {
                        return resolve(true)
                    }
                }
            },
            default: '',
            close: () => { return resolve(false) },
            render: (html) => {
                // Add event listeners for accordion toggle to dynamically resize window
                const accordions = html.find('details.voice-accordion');
                accordions.on('toggle', function () {
                    // Small delay to ensure content is fully expanded/collapsed
                    setTimeout(() => {
                        dlg.setPosition({ height: 'auto' });
                    }, 50);
                });

                // Initialize search functionality
                const searchInput = html.find('#voice-search');
                const searchClear = html.find('#search-clear');
                let searchTimeout;

                // Search function
                function performSearch(searchTerm) {
                    const term = searchTerm.toLowerCase().trim();
                    const allItems = html.find('.voice-item');
                    const accordionHeaders = html.find('.voice-accordion-header');

                    // Show/hide clear button
                    if (term.length > 0) {
                        searchClear.addClass('visible');
                    } else {
                        searchClear.removeClass('visible');
                    }

                    // Filter items
                    allItems.each(function () {
                        const item = $(this);
                        const name = item.data('name') || '';
                        const nameElement = item.find('.voice-name');

                        if (term.length === 0) {
                            // Show all items when search is empty
                            item.removeClass('search-hidden');
                            nameElement.html(name);
                        } else if (name.toLowerCase().includes(term)) {
                            // Show matching items with highlighting
                            item.removeClass('search-hidden');
                            const highlightedName = highlightSearchTerm(name, term);
                            nameElement.html(highlightedName);
                        } else {
                            // Hide non-matching items
                            item.addClass('search-hidden');
                        }
                    });

                    // Update accordion counts
                    updateAccordionCounts(html);

                    // Auto-expand accordions that have visible results
                    if (term.length > 0) {
                        accordions.each(function () {
                            const accordion = $(this);
                            const visibleItems = accordion.find('.voice-item:not(.search-hidden)');
                            if (visibleItems.length > 0) {
                                accordion.prop('open', true);
                            }
                        });
                    }
                }

                // Highlight search terms in text
                function highlightSearchTerm(text, term) {
                    if (!term) return text;
                    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    return text.replace(regex, '<span class="search-highlight">$1</span>');
                }

                // Update accordion counts
                function updateAccordionCounts(html) {
                    html.find('.voice-accordion').each(function () {
                        const accordion = $(this);
                        const visibleItems = accordion.find('.voice-item:not(.search-hidden)');
                        const totalItems = accordion.find('.voice-item');
                        const visibleCount = accordion.find('.visible-count');
                        const totalCount = accordion.find('.total-count');

                        visibleCount.text(visibleItems.length);

                        if (visibleItems.length === totalItems.length) {
                            totalCount.addClass('hidden');
                        } else {
                            totalCount.removeClass('hidden');
                        }
                    });
                }

                // Search input event listener
                searchInput.on('input', function () {
                    clearTimeout(searchTimeout);
                    const searchTerm = $(this).val();

                    searchTimeout = setTimeout(() => {
                        performSearch(searchTerm);
                        // Resize dialog after filtering
                        setTimeout(() => {
                            dlg.setPosition({ height: 'auto' });
                        }, 50);
                    }, 150); // Debounce search
                });

                // Clear button event listener
                searchClear.on('click', function () {
                    searchInput.val('').trigger('input').focus();

                    // Close all accordions after clearing search
                    setTimeout(() => {
                        accordions.each(function () {
                            $(this).prop('open', false);
                        });
                        // Resize dialog after closing accordions
                        setTimeout(() => {
                            dlg.setPosition({ height: 'auto' });
                        }, 100);
                    }, 200);
                });

                // Keyboard shortcuts
                searchInput.on('keydown', function (e) {
                    if (e.key === 'Escape') {
                        searchInput.val('').trigger('input');

                        // Close all accordions after clearing search
                        setTimeout(() => {
                            accordions.each(function () {
                                $(this).prop('open', false);
                            });
                            // Resize dialog after closing accordions
                            setTimeout(() => {
                                dlg.setPosition({ height: 'auto' });
                            }, 100);
                        }, 200);
                    }
                });

                // Initialize counts
                updateAccordionCounts(html);

                // Initialize bulk settings functionality
                initializeBulkSettings(html, sendList, bymchndefVolume);
            }
        }, {
            width: 660,
            height: 'auto',
            resizable: false
        });
        dlg.render(true);
    });
}

/**
 * Initialize bulk settings functionality
 */
function initializeBulkSettings(html, voiceList, defaultVolume) {
    const checkboxes = html.find('.voice-checkbox');
    const selectedCountElement = html.find('.selected-count');
    const bulkVoiceSelect = html.find('#bulk-voice-select');
    const bulkVolumeSlider = html.find('#bulk-volume-slider');
    const bulkApplyVoiceBtn = html.find('#bulk-apply-voice');
    const bulkApplyVolumeBtn = html.find('#bulk-apply-volume');
    const bulkClearBtn = html.find('#bulk-clear');

    // Set default volume value
    if (defaultVolume !== undefined && defaultVolume !== -1) {
        bulkVolumeSlider.val(defaultVolume);
    } else {
        bulkVolumeSlider.val(0.5); // Fallback to 50%
    }

    // Populate bulk voice select options
    populateBulkVoiceOptions(bulkVoiceSelect, voiceList);

    // Update selected count and button state
    function updateBulkControls() {
        const selectedCount = checkboxes.filter(':checked').length;
        selectedCountElement.text(selectedCount);

        if (selectedCount > 0) {
            bulkApplyVoiceBtn.prop('disabled', false);
            bulkApplyVolumeBtn.prop('disabled', false);
        } else {
            bulkApplyVoiceBtn.prop('disabled', true);
            bulkApplyVolumeBtn.prop('disabled', true);
        }
    }

    // Checkbox change event
    checkboxes.on('change', updateBulkControls);

    // Bulk apply voice functionality
    bulkApplyVoiceBtn.on('click', function () {
        const selectedCheckboxes = checkboxes.filter(':checked');
        const bulkVoice = bulkVoiceSelect.val();

        if (selectedCheckboxes.length === 0) return;

        // Show confirmation dialog for voice
        const confirmDialog = new Dialog({
            title: game.i18n.localize('TTSC.BulkConfirmVoiceTitle'),
            content: `<p>${game.i18n.localize('TTSC.BulkConfirmVoiceContent').replace('{count}', selectedCheckboxes.length)}</p>
                     <p><strong>${game.i18n.localize('TTSC.BulkVoiceLabel')}:</strong> ${bulkVoiceSelect.find('option:selected').text()}</p>`,
            buttons: {
                apply: {
                    label: game.i18n.localize('TTSC.BulkApply'),
                    icon: '<i class="fas fa-volume-up"></i>',
                    callback: () => {
                        applyBulkSettings(html, selectedCheckboxes, bulkVoice, null, 'voice');
                    }
                },
                cancel: {
                    label: game.i18n.localize('TTSC.WindowCancel'),
                    icon: '<i class="fas fa-times"></i>',
                    callback: () => { }
                }
            },
            default: 'apply'
        });
        confirmDialog.render(true);
    });

    // Bulk apply volume functionality
    bulkApplyVolumeBtn.on('click', function () {
        const selectedCheckboxes = checkboxes.filter(':checked');
        const bulkVolume = parseFloat(bulkVolumeSlider.val());

        if (selectedCheckboxes.length === 0) return;

        // Show confirmation dialog for volume
        const confirmDialog = new Dialog({
            title: game.i18n.localize('TTSC.BulkConfirmVolumeTitle'),
            content: `<p>${game.i18n.localize('TTSC.BulkConfirmVolumeContent').replace('{count}', selectedCheckboxes.length)}</p>
                     <p><strong>${game.i18n.localize('TTSC.WindowSelectSpeakerVoiceVolume')}</strong> ${Math.round(bulkVolume * 100)}%</p>`,
            buttons: {
                apply: {
                    label: game.i18n.localize('TTSC.BulkApply'),
                    icon: '<i class="fas fa-volume-down"></i>',
                    callback: () => {
                        applyBulkSettings(html, selectedCheckboxes, null, bulkVolume, 'volume');
                    }
                },
                cancel: {
                    label: game.i18n.localize('TTSC.WindowCancel'),
                    icon: '<i class="fas fa-times"></i>',
                    callback: () => { }
                }
            },
            default: 'apply'
        });
        confirmDialog.render(true);
    });

    // Bulk clear functionality
    bulkClearBtn.on('click', function () {
        checkboxes.prop('checked', false);
        updateBulkControls();
    });

    // Initial update
    updateBulkControls();
}

/**
 * Populate bulk voice select options
 */
function populateBulkVoiceOptions(selectElement, voiceList) {
    selectElement.empty();

    voiceList.forEach(voice => {
        const option = $('<option></option>')
            .attr('value', `${voice.num}&&${voice.type}`)
            .text(voice.name);
        selectElement.append(option);
    });
}

/**
 * Apply bulk settings to selected voice items
 */
function applyBulkSettings(html, selectedCheckboxes, voiceValue, volumeValue, mode = 'both') {
    selectedCheckboxes.each(function () {
        const checkbox = $(this);
        const voiceId = checkbox.data('voice-id');
        const voiceItem = checkbox.closest('.voice-item');

        // Update voice select only if voice mode or both
        if ((mode === 'voice' || mode === 'both') && voiceValue !== null) {
            const voiceSelect = voiceItem.find(`select[name="${voiceId}"]`);
            voiceSelect.val(voiceValue);
        }

        // Update volume slider only if volume mode or both
        if ((mode === 'volume' || mode === 'both') && volumeValue !== null) {
            const volumeSlider = voiceItem.find(`input[name="${voiceId}volume"]`);
            volumeSlider.val(volumeValue);
        }
    });

    // Show appropriate success notification
    let messageKey;
    switch (mode) {
        case 'voice':
            messageKey = 'TTSC.BulkVoiceSuccessMessage';
            break;
        case 'volume':
            messageKey = 'TTSC.BulkVolumeSuccessMessage';
            break;
        default:
            messageKey = 'TTSC.BulkSuccessMessage';
            break;
    }

    ui.notifications?.info(game.i18n.localize(messageKey).replace('{count}', selectedCheckboxes.length));

    // Keep selections after applying for potential additional operations
    // Users can manually clear selections using the "Clear Selection" button if needed
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export voice selector to namespace (part of UI)
window.BymChnConnector.ui = window.BymChnConnector.ui || {};
window.BymChnConnector.ui.voiceSelector = voiceSelector;
