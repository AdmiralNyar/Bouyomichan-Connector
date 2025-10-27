/**
 * Bouyomichan Connector - NijiVoice Management Module
 * Handles NijiVoice voice list management, settings dialog, API integration, and journal creation
 */

/**
 * Initialize NijiVoice-specific settings
 */
async function initializeNijiVoiceSettings() {
    try {
        game.settings.register(BymChnConnector.config.MODULE_NAME, 'nijiVoiceToLocalAPI', {
            name: 'TTSC.NijiVoiceLinkageAPI',
            hint: 'TTSC.NijiVoiceLinkageAPIHint',
            scope: 'client',
            config: true,
            type: String,
            default: BymChnConnector.config.DEFAULT_API_SERVER
        });

        game.settings.register(BymChnConnector.config.MODULE_NAME, 'nijiVoiceLimit', {
            name: 'TTSC.NijiVoiceLimit',
            hint: 'TTSC.NijiVoiceLimitHint',
            scope: 'client',
            config: true,
            type: Number,
            default: BymChnConnector.config.DEFAULT_NIJI_LIMIT
        });

        game.settings.register(BymChnConnector.config.MODULE_NAME, 'addNijiVoiceList', {
            name: 'TTSC.NijiVoiceActorAddToList',
            hint: 'TTSC.NijiVoiceActorAddToListHint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: async (shouldAdd) => {
                if (shouldAdd) {
                    try {
                        await NijiVoice.setVoiceActorData();
                        await game.settings.set(BymChnConnector.config.MODULE_NAME, 'addNijiVoiceList', false);
                    } catch (error) {
                        console.error('[BymChnConnector] Failed to add NijiVoice actors:', error);
                    }
                }
            }
        });

        game.settings.registerMenu(BymChnConnector.config.MODULE_NAME, 'nijiVoiceActorTable', {
            name: 'TTSC.NijiVoiceIdSettings',
            label: 'TTSC.NijiVoiceIdSettings',
            hint: 'TTSC.NijiVoiceIdSettingsHint',
            icon: 'fas fa-book',
            type: NijiVoiceListSettings,
            restricted: false
        });

        game.settings.register(BymChnConnector.config.MODULE_NAME, 'makeNijiVoiceList', {
            name: 'TTSC.NijiVoiceActorJournalCreate',
            hint: 'TTSC.NijiVoiceActorJournalCreateHint',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: async (shouldCreate) => {
                if (shouldCreate) {
                    try {
                        await NijiVoice.createJournalDocument();
                        await game.settings.set(BymChnConnector.config.MODULE_NAME, 'makeNijiVoiceList', false);
                    } catch (error) {
                        console.error('[BymChnConnector] Failed to create NijiVoice journal:', error);
                    }
                }
            }
        });

        console.log('[BymChnConnector] NijiVoice settings initialized successfully');
    } catch (error) {
        console.error('[BymChnConnector] Failed to initialize NijiVoice settings:', error);
    }
}

/**
 * Reset NijiVoice settings to default values
 */
async function resetNijiVoiceSettings() {
    try {
        console.log('[BymChnConnector] Resetting NijiVoice settings to default values');

        // Get current select-voice flags
        const selectVoice = await game.user.getFlag("BymChnConnector", "select-voice");

        if (!selectVoice || !Array.isArray(selectVoice)) {
            console.log('[BymChnConnector] No select-voice data found or invalid format');
            return;
        }

        let hasChanges = false;

        // Iterate through all voice settings and reset NijiVoice entries (vtype == 3)
        for (let i = 0; i < selectVoice.length; i++) {
            if (selectVoice[i].vtype === BymChnConnector.voiceTypes.NIJIVOICE) {
                console.log(`[BymChnConnector] Resetting NijiVoice entry: ${selectVoice[i].name || selectVoice[i].id}`);

                // Reset to default values
                selectVoice[i].voice = 0;
                selectVoice[i].vtype = BymChnConnector.voiceTypes.BUILTIN; // Reset to builtin voice type
                selectVoice[i].volume = await BymChnConnector.voiceEngine.getDefaultVolumeForEngine(0); // Use builtin voice volume

                hasChanges = true;
            }
        }

        // Save changes if any NijiVoice entries were found and reset
        if (hasChanges) {
            await game.user.setFlag("BymChnConnector", "select-voice", selectVoice);
            console.log('[BymChnConnector] NijiVoice settings reset completed');

            // Notify user about the reset
            ui.notifications?.info(game.i18n.localize('TTSC.NotifyNijiVoiceSettingsReset') || 'NijiVoice settings have been reset to default values');
        } else {
            console.log('[BymChnConnector] No NijiVoice settings found to reset');
        }

    } catch (error) {
        console.error('[BymChnConnector] Failed to reset NijiVoice settings:', error);
        ui.notifications?.error('Failed to reset NijiVoice settings. Please check the console for details.');
    }
}

/**
 * NijiVoice List Data Management Class
 */
class NijiVoiceListData {
    static nijiList() {
        return game.settings.get("BymChnConnector", "niji-list");
    }

    static deleteNijilist(name, index, num) {
        let nijiList = game.settings.get("BymChnConnector", "niji-list");
        if (nijiList[index].name == name && nijiList[index].num == num) {
            let del = nijiList.splice(index, 1);
        }
        return game.settings.set("BymChnConnector", "niji-list", nijiList)
    }

    static createNijiList() {
        let nijiList = game.settings.get("BymChnConnector", "niji-list");
        nijiList.push({ name: "", type: 3, num: "" })
        return game.settings.set("BymChnConnector", "niji-list", nijiList)
    }
}

/**
 * NijiVoice Settings Dialog Class
 */
class NijiVoiceListSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("TTSC.WindowNijiVoiceSettingsTitle"),
            id: 'niji-settings',
            template: 'modules/BymChnConnector/templates/niji-settings.html',
            width: 550,
            height: 'auto',
            resizable: true,
            closeOnSubmit: false
        })
    }

    async getData() {
        let data = super.getData();
        data.nijiList = NijiVoiceListData.nijiList();
        data.userid = game.user.id;
        return data
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".add-voice").on("click", async (event) => {
            event.preventDefault();
            NijiVoiceListData.createNijiList();
            this.render()
        })

        // Export button handler
        html.find(".niji-export-btn").on("click", async (event) => {
            event.preventDefault();
            this._exportSettings(html);
        })

        // Import button handler
        html.find(".niji-import-btn").on("click", async (event) => {
            event.preventDefault();
            this._importSettings(html);
        })
        html.find(".niji-delete-btn").on("click", async (event) => {
            event.preventDefault();
            const targetName = $(event.currentTarget).closest('.niji-voice-item').data("name");
            const targetIndex = $(event.currentTarget).closest('.niji-voice-item').data("id");
            const targetNum = $(event.currentTarget).closest('.niji-voice-item').data("num");
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowNijiVoiceDeleteTitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowCheckDeletecontent")}</p>`,
                buttons: {
                    delete: {
                        label: game.i18n.localize("TTSC.WindowDelete"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () => {
                            NijiVoiceListData.deleteNijilist(targetName, targetIndex, targetNum);
                            this.render();
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("TTSC.WindowCancel"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => { }
                    }
                },
                default: 'cancel',
                close: () => { }
            });
            dlg.render(true);
        })
    }

    async _updateObject(event, formData) {
        let nijiList = NijiVoiceListData.nijiList();
        const data = foundry.utils.flattenObject(formData);
        let nameNone = false
        let numNone = false
        for (let i = 0; i < nijiList.length; i++) {
            let name = data[`${i}${game.user.id}`];
            let num = data[`${i}${game.user.id}num`];
            if (!!name) {
                nijiList[i].name = name;
            } else {
                nameNone = true;
            }
            if (!!num) {
                nijiList[i].num = num;
            } else {
                numNone = true;
            }
        }
        if (nameNone || numNone) {
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowNoNameNoIdtitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowNoNameNoIdcontent")}</p>`,
                buttons: {
                    delete: {
                        label: game.i18n.localize("TTSC.WindowYes"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () => {
                            for (let j = (nijiList.length - 1); j >= 0; j--) {
                                if (!nijiList[j].name || !nijiList[j].num) {
                                    nijiList.splice(j, 1)
                                }
                            }
                            await game.settings.set("BymChnConnector", "niji-list", nijiList);
                            this.close();
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("TTSC.WindowNo"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => { }
                    }
                },
                default: 'cancel',
                close: () => { }
            });
            dlg.render(true);
        } else {
            game.settings.set("BymChnConnector", "niji-list", nijiList);
            this.close();
        }
    }

    /**
     * Export NijiVoice settings to JSON file
     * @param {jQuery} html - The HTML of the dialog
     * @private
     */
    _exportSettings(html) {
        // Get current NijiVoice list
        let nijiList = NijiVoiceListData.nijiList();

        // Build export data from current form inputs
        let exportData = [];

        // Iterate through each voice item in the current form
        html.find('.niji-voice-item').each((index, element) => {
            const $item = $(element);
            const nameInput = $item.find('.niji-name-input');
            const idInput = $item.find('.niji-id-input');

            const name = nameInput.val();
            const num = idInput.val();

            // Validate ID format: alphanumeric and hyphen only
            const idPattern = /^[A-Za-z0-9\-]+$/;

            // Only include entries with valid name and num
            if (name && name.trim() !== "" && num && num.trim() !== "" && idPattern.test(num)) {
                exportData.push({
                    name: name.trim(),
                    type: 3,
                    num: num.trim()
                });
            }
        });

        // If no valid data, show warning
        if (exportData.length === 0) {
            ui.notifications.warn(game.i18n.localize("TTSC.WindowImportNoValidData"));
            return;
        }

        // Generate filename with timestamp
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const filename = `nijivoice-actors-${timestamp}.json`;

        // Use Foundry's saveDataToFile utility for cross-platform compatibility
        saveDataToFile(JSON.stringify(exportData, null, 2), "application/json", filename);

        // Show success notification
        ui.notifications.info(game.i18n.localize("TTSC.WindowNijiVoiceExportSuccess"));
    }

    /**
     * Import NijiVoice settings from JSON file
     * @param {jQuery} html - The HTML of the dialog
     * @private
     */
    _importSettings(html) {
        const fileInput = html.find("#niji-import-input")[0];

        // Set up file input change handler
        const handleFileSelect = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                // Read file
                const text = await file.text();
                let importedData;

                // Parse JSON
                try {
                    importedData = JSON.parse(text);
                } catch (e) {
                    ui.notifications.error(game.i18n.localize("TTSC.WindowNijiVoiceImportInvalidFormat"));
                    fileInput.value = ""; // Reset input
                    return;
                }

                // Validate and filter data
                const validData = this._validateNijiVoiceImportData(importedData);

                if (validData === null || validData.length === 0) {
                    ui.notifications.error(game.i18n.localize("TTSC.WindowImportNoValidData"));
                    fileInput.value = ""; // Reset input
                    return;
                }

                // Show confirmation dialog
                const dlg = new Dialog({
                    title: game.i18n.localize("TTSC.WindowImportConfirmTitle"),
                    content: `<p>${game.i18n.localize("TTSC.WindowImportConfirmContent")}</p>`,
                    buttons: {
                        import: {
                            label: game.i18n.localize("TTSC.SAPI5Import"),
                            icon: '<i class="fas fa-file-import"></i>',
                            callback: async () => {
                                await game.settings.set("BymChnConnector", "niji-list", validData);
                                const message = game.i18n.localize("TTSC.WindowNijiVoiceImportSuccess").replace("{count}", validData.length);
                                ui.notifications.info(message);
                                this.render(); // Re-render dialog to show imported data
                            }
                        },
                        cancel: {
                            label: game.i18n.localize("TTSC.WindowCancel"),
                            icon: '<i class="fas fa-ban"></i>',
                            callback: () => { }
                        }
                    },
                    default: 'cancel',
                    close: () => { }
                });
                dlg.render(true);

            } catch (error) {
                console.error("NijiVoice Import Error:", error);
                ui.notifications.error(game.i18n.localize("TTSC.WindowNijiVoiceImportInvalidFormat"));
            } finally {
                // Reset file input for next use
                fileInput.value = "";
            }
        };

        // Remove existing event listener if any
        fileInput.removeEventListener('change', handleFileSelect);

        // Add new event listener
        fileInput.addEventListener('change', handleFileSelect);

        // Trigger file selection dialog
        fileInput.click();
    }

    /**
     * Validate imported NijiVoice data
     * @param {Array} data - The imported data to validate
     * @returns {Array|null} - Array of valid NijiVoice entries, or null if invalid/empty
     * @private
     */
    _validateNijiVoiceImportData(data) {
        // Check if data is an array
        if (!Array.isArray(data)) {
            return null;
        }

        // If empty array, return null (preserve existing settings)
        if (data.length === 0) {
            return null;
        }

        const validData = [];
        const namePattern = /^[^\/#&?%.\-\+\\_=@／＃＆？％．￥－＋＿＝＠]+$/;
        const idPattern = /^[A-Za-z0-9\-]+$/;

        for (const entry of data) {
            // Check if entry is an object
            if (typeof entry !== 'object' || entry === null) {
                continue;
            }

            // Check if entry has only the required keys (name, type, num)
            const keys = Object.keys(entry);
            if (keys.length !== 3 || !keys.includes('name') || !keys.includes('type') || !keys.includes('num')) {
                continue;
            }

            // Validate name: must be a string without symbols (but allow 中黒 ・)
            if (typeof entry.name !== 'string' || !namePattern.test(entry.name)) {
                continue;
            }

            // Validate type: must be exactly 3
            if (entry.type !== 3) {
                continue;
            }

            // Validate num: must be a string with alphanumeric and hyphen only
            if (typeof entry.num !== 'string' || entry.num.length === 0 || !idPattern.test(entry.num)) {
                continue;
            }

            // Entry is valid, add to validData
            validData.push({
                name: entry.name,
                type: 3,
                num: entry.num
            });
        }

        // If all entries were invalid, return null
        if (validData.length === 0) {
            return null;
        }

        return validData;
    }
}

/**
 * NijiVoice API integration object
 * Handles voice actor data management and journal creation for NijiVoice service
 */
const NijiVoice = {
    async setVoiceActorData() {
        const server = await game.settings.get("BymChnConnector", "nijiVoiceToLocalAPI");
        try {
            const list = (await fetch(`${server}/getList`));
            const data = (await list.json()).response.voiceActors;
            var nijiList = await game.settings.get("BymChnConnector", "niji-list");
            var existingIds = new Set(nijiList.map(item => item.num));
            data.forEach(item => { if (!existingIds.has(item.id)) { nijiList.push({ name: item.name, type: 3, num: item.id }); existingIds.add(item.id); } });
            game.settings.set("BymChnConnector", "niji-list", nijiList)
        } catch (e) {
            console.error(e)
        }
    },

    async createJournalDocument() {
        // Alias for getVoiceActorData for backwards compatibility
        return await this.getVoiceActorData();
    },

    async getVoiceActorData() {
        const server = await game.settings.get("BymChnConnector", "nijiVoiceToLocalAPI");
        try {
            const list = (await fetch(`${server}/getList`));
            const data = (await list.json()).response.voiceActors;
            const journalTitle = game.i18n.localize("TTSC.NijiVoiceJournalTitle");

            // Generate HTML table for voice actor data display
            const generateTableHTML = (data) => {
                let html = `<table border="1" style="border-collapse:collapse;width:100%;text-align:left;">
    <thead>
      <tr>
        <th style="min-width:max-content;text-align:center">${game.i18n.localize("TTSC.VoiceName")}</th>
        <th style="text-align:center">${game.i18n.localize("TTSC.VoiceImg")}</th>
        <th style="text-align:center">${game.i18n.localize("TTSC.VoiceSex")}</th>
        <th style="text-align:center">${game.i18n.localize("TTSC.Age")}</th>
        <th style="width:35%;text-align:center">${game.i18n.localize("TTSC.Sample")}</th>
      </tr>
    </thead>
    <tbody>`;

                data.forEach(user => {
                    const genderText = user.gender === "MALE" ? game.i18n.localize("TTSC.VoiceMale") : user.gender === "FEMALE" ? game.i18n.localize("TTSC.VoiceFemale") : game.i18n.localize("TTSC.VoiceUndefined");
                    const ageText = user.age ? (String(user.age) + " " + game.i18n.localize("TTSC.YearsOld")) : game.i18n.localize("TTSC.VoiceUndefined");
                    const ruby = user.nameReading ? user.nameReading : "";
                    html += `
      <tr>
        <td style="vertical-align: middle;white-space: nowrap;"><ruby><p>${user.name}</p><rt>${ruby}</rt></ruby></td>
        <td><img src="${user.mediumImageUrl}" alt="${user.name}" style="width:100px;height:auto;" class="centered"></td>
        <td style="vertical-align: middle;white-space: nowrap;">${genderText}</td>
        <td style="vertical-align: middle;white-space: nowrap;">${ageText}</td>
        <td style="vertical-align: middle"><div style="overflow:auto;height:100px;margin:1px"><code><em>${user.sampleScript}</em></code></div><audio controls style="width:100%"><source src="${user.sampleVoiceUrl}" type="audio/wav"></audio></td>
      </tr>`;
                });

                html += `
    </tbody>
  </table>`;

                return html;
            };

            const createAgeData = async (entry, origin, sex) => {
                var age_group
                var lang = JSON.parse(!!game.settings.storage.get('client')["core.language"] ? game.settings.storage.get('client')["core.language"] : "null");
                if (!lang) lang = game.settings.settings.get('core.language').default ? game.settings.settings.get('core.language').default : null
                if (lang == 'ja') {
                    age_group = [{ type: game.i18n.localize("TTSC.AgeChild"), low: 0, high: 14 }, { type: game.i18n.localize("TTSC.AgeYoung"), low: 15, high: 24 }, { type: game.i18n.localize("TTSC.AgeAdult"), low: 25, high: 44 }, { type: game.i18n.localize("TTSC.AgeMidlife"), low: 45, high: 64 }, { type: game.i18n.localize("TTSC.AgeElder"), low: 65 }]
                } else if (lang == 'en') {
                    age_group = [{ type: game.i18n.localize("TTSC.AgeChild"), low: 0, high: 12 }, { type: game.i18n.localize("TTSC.AgeYoung"), low: 13, high: 19 }, { type: game.i18n.localize("TTSC.AgeAdult"), low: 20, high: 39 }, { type: game.i18n.localize("TTSC.AgeMidlife"), low: 40, high: 60 }, { type: game.i18n.localize("TTSC.AgeElder"), low: 61 }]
                }

                for (let i = 0; i < age_group.length; i++) {
                    var age_data;
                    if (age_group[i].type != game.i18n.localize("TTSC.AgeElder")) {
                        age_data = origin.filter(user => (user.age < age_group[i].high) && (user.age >= age_group[i].low))
                    } else {
                        age_data = origin.filter(user => (!user.age) || (user.age >= age_group[i].low))
                    }
                    if (age_data.length > 0) {
                        const ageTableHTML = generateTableHTML(age_data);
                        await createJournalEntryPage(entry = entry, title = (age_group[i].type + sex), content = ageTableHTML, lv = 2);
                    }
                }
            }

            const createPageData = async (entry, data) => {
                const allTableHTML = generateTableHTML(data);
                if (isNewerVersion(game.version, "10")) {
                    await createJournalEntryPage(entry = entry, title = game.i18n.localize("TTSC.VoiceAll"), content = allTableHTML, lv = 1);
                    await createAgeData(entry = entry, origin = data, sex = `(${game.i18n.localize("TTSC.VoiceAll")})`)

                    const maleData = data.filter(user => user.gender === "MALE");
                    if (maleData.length > 0) {
                        const maleTableHTML = generateTableHTML(maleData);
                        await createJournalEntryPage(entry = entry, title = game.i18n.localize("TTSC.VoiceMale"), content = maleTableHTML, lv = 1);
                        await createAgeData(entry = entry, origin = maleData, sex = `(${game.i18n.localize("TTSC.VoiceMale")})`);
                    }

                    const femaleData = data.filter(user => user.gender === "FEMALE");
                    if (femaleData.length > 0) {
                        const femaleTableHTML = generateTableHTML(femaleData);
                        await createJournalEntryPage(entry = entry, title = game.i18n.localize("TTSC.VoiceFemale"), content = femaleTableHTML, lv = 1);
                        await createAgeData(entry = entry, origin = femaleData, sex = `(${game.i18n.localize("TTSC.VoiceFemale")})`);
                    }
                } else {
                    await entry.update({ 'content': allTableHTML })
                }
            }

            // Create Journal Entry Page
            const createJournalEntryPage = async (entry, title, content, lv) => {
                const pageData = {
                    name: title,
                    type: "text",
                    title: { show: false, level: lv },
                    text: {
                        content: content,
                        format: 1 // HTML format
                    },
                    flags: {}
                };

                // Create JournalEntryPage
                const page = await entry.createEmbeddedDocuments("JournalEntryPage", [pageData]);
                console.log(`Journal Entry Page "${title}" has been created.`);
            };

            // Create Journal Entry
            const createJournalEntry = async (title, content) => {
                const journalData = {
                    name: title,
                    folder: null,
                    flags: {},
                };

                // Create JournalEntry
                const journalEntry = await JournalEntry.create(journalData);
                console.log(`Journal Entry "${title}" has been created with ID: ${journalEntry.id}`);

                // Add Journal Entry Page
                await createPageData(journalEntry, content);
            };

            // Execute script
            await createJournalEntry(journalTitle, data);
        } catch (e) {
            console.error(e)
        }
    }
};

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export NijiVoice manager to namespace
window.BymChnConnector.nijivoice = window.BymChnConnector.nijivoice || {};
window.BymChnConnector.nijivoice.initializeSettings = initializeNijiVoiceSettings;
window.BymChnConnector.nijivoice.resetSettings = resetNijiVoiceSettings;
window.BymChnConnector.nijivoice.ListData = NijiVoiceListData;
window.BymChnConnector.nijivoice.ListSettings = NijiVoiceListSettings;
window.BymChnConnector.nijivoice.api = NijiVoice;
