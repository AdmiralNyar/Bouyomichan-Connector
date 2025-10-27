/**
 * Bouyomichan Connector - SAPI5 Management Module
 * Handles SAPI5 voice list management, settings dialog, and data operations
 */

/**
 * Register SAPI5-related settings menu
 * This function should be called from initializeSettings() in settings-core.js
 */
function registerSapi5Settings() {
    game.settings.registerMenu(BymChnConnector.config.MODULE_NAME, 'sapi5Table', {
        name: 'TTSC.SAPI5Settings',
        label: 'TTSC.SAPI5Settings',
        hint: 'TTSC.SAPI5Settingshint',
        icon: 'fas fa-book',
        type: Sapi5ListSettings,
        restricted: false
    });
}

/**
 * Register SAPI5 list setting with onChange handler
 * This function should be called from initializeTranslationDependentSettings() in settings-core.js
 */
async function registerSapi5ListSetting() {
    game.settings.register(BymChnConnector.config.MODULE_NAME, 'sapi5-list', {
        name: "BymChn sapi5-list",
        scope: "client",
        config: false,
        type: Object,
        default: [
            { name: game.i18n.localize("TTSC.VoiceSAPI5Default"), type: 1, num: 10001 }
        ],
        onChange: async (list) => {
            let selectVoice = await game.user.getFlag("BymChnConnector", "select-voice")
            for (let i = (selectVoice.length - 1); i >= 0; i--) {
                if (selectVoice[i].vtype == 1) {
                    let find = false
                    for (let k = 0; k < list.length; k++) {
                        if (list[k].num == selectVoice[i].voice) find = true
                    }
                    if (!find) {
                        selectVoice[i].voice = 0
                        selectVoice[i].vtype = 0
                        selectVoice[i].volume = await BymChnConnector.voiceEngine.getDefaultVolumeForEngine(1) // SAPI5 specific volume
                    }
                }
            }
            game.user.setFlag("BymChnConnector", "select-voice", selectVoice)
        }
    });
}

/**
 * SAPI5 List Data Management Class
 */
class Sapi5ListData {
    static sapi5List() {
        return game.settings.get("BymChnConnector", "sapi5-list");
    }

    static sapi5DefaultList() {
        return game.settings.set("BymChnConnector", "sapi5-list", [
            { name: game.i18n.localize("TTSC.VoiceSAPI5Default"), type: 1, num: 10001 }
        ])
    }

    static deleteSapi5list(name, index, num) {
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        if (sapi5List[index].name == name && sapi5List[index].num == num) {
            let del = sapi5List.splice(index, 1);
        }
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }

    static createSapi5List() {
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        sapi5List.push({ name: "", type: 1, num: "" })
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }
}

/**
 * SAPI5 Settings Dialog Class
 */
class Sapi5ListSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("TTSC.WindowSAPI5Settingstitle"),
            id: 'sapi5-settings',
            template: 'modules/BymChnConnector/templates/sapi5-settings.html',
            width: 550,
            height: 400,
            resizable: false,
            closeOnSubmit: false
        })
    }

    async getData() {
        let data = super.getData();
        data.sapi5List = Sapi5ListData.sapi5List();
        data.userid = game.user.id;
        return data
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".add-voice").on("click", async (event) => {
            event.preventDefault();
            Sapi5ListData.createSapi5List();
            this.render()
        })

        // Export button handler
        html.find(".sapi5-export-btn").on("click", async (event) => {
            event.preventDefault();
            this._exportSettings(html);
        })

        // Import button handler
        html.find(".sapi5-import-btn").on("click", async (event) => {
            event.preventDefault();
            this._importSettings(html);
        })
        html.find(".sapi5-delete-btn").on("click", async (event) => {
            event.preventDefault();
            const targetName = $(event.currentTarget).closest('.sapi5-voice-item').data("name");
            const targetIndex = $(event.currentTarget).closest('.sapi5-voice-item').data("id");
            const targetNum = $(event.currentTarget).closest('.sapi5-voice-item').data("num");
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowSAPI5Settingstitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowCheckDeletecontent")}</p>`,
                buttons: {
                    delete: {
                        label: game.i18n.localize("TTSC.WindowDelete"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () => {
                            Sapi5ListData.deleteSapi5list(targetName, targetIndex, targetNum);
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
        html.find('button[name="reset"]').on("click", async (event) => {
            event.preventDefault();

            // Show confirmation dialog before resetting
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowCheckResettitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowCheckResetcontent")}</p>`,
                buttons: {
                    reset: {
                        label: game.i18n.localize("TTSC.WindowReset"),
                        icon: '<i class="fas fa-undo"></i>',
                        callback: async () => {
                            Sapi5ListData.sapi5DefaultList();
                            this.close();
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
        let sapi5List = Sapi5ListData.sapi5List();
        const data = foundry.utils.flattenObject(formData);
        let nameNone = false
        let numNone = false
        for (let i = 0; i < sapi5List.length; i++) {
            let name = data[`${i}${game.user.id}`];
            let num = data[`${i}${game.user.id}num`];
            if (!!name) {
                sapi5List[i].name = name;
            } else {
                nameNone = true;
            }
            if (!!num) {
                sapi5List[i].num = num;
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
                            for (let j = (sapi5List.length - 1); j >= 0; j--) {
                                if (!sapi5List[j].name || !sapi5List[j].num) {
                                    sapi5List.splice(j, 1)
                                }
                            }
                            await game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
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
            game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
            this.close();
        }
    }

    /**
     * Export SAPI5 settings to JSON file
     * @param {jQuery} html - The HTML of the dialog
     * @private
     */
    _exportSettings(html) {
        // Get current SAPI5 list
        let sapi5List = Sapi5ListData.sapi5List();

        // Build export data from current form inputs
        let exportData = [];

        // Iterate through each voice item in the current form
        html.find('.sapi5-voice-item').each((index, element) => {
            const $item = $(element);
            const nameInput = $item.find('.sapi5-name-input');
            const idInput = $item.find('.sapi5-id-input');

            const name = nameInput.val();
            const num = parseInt(idInput.val());

            // Only include entries with valid name and num
            if (name && name.trim() !== "" && num && num >= 10001) {
                exportData.push({
                    name: name.trim(),
                    type: 1,
                    num: num
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
        const filename = `sapi5-voices-${timestamp}.json`;

        // Use Foundry's saveDataToFile utility for cross-platform compatibility
        saveDataToFile(JSON.stringify(exportData, null, 2), "application/json", filename);

        // Show success notification
        ui.notifications.info(game.i18n.localize("TTSC.WindowExportSuccess"));
    }

    /**
     * Import SAPI5 settings from JSON file
     * @param {jQuery} html - The HTML of the dialog
     * @private
     */
    _importSettings(html) {
        const fileInput = html.find("#sapi5-import-input")[0];

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
                    ui.notifications.error(game.i18n.localize("TTSC.WindowImportInvalidFormat"));
                    fileInput.value = ""; // Reset input
                    return;
                }

                // Validate and filter data
                const validData = this._validateSapi5ImportData(importedData);

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
                                await game.settings.set("BymChnConnector", "sapi5-list", validData);
                                const message = game.i18n.localize("TTSC.WindowImportSuccess").replace("{count}", validData.length);
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
                console.error("SAPI5 Import Error:", error);
                ui.notifications.error(game.i18n.localize("TTSC.WindowImportInvalidFormat"));
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
     * Validate imported SAPI5 data
     * @param {Array} data - The imported data to validate
     * @returns {Array|null} - Array of valid SAPI5 entries, or null if invalid/empty
     * @private
     */
    _validateSapi5ImportData(data) {
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

            // Validate type: must be exactly 1
            if (entry.type !== 1) {
                continue;
            }

            // Validate num: must be a number in range 10000-99999
            if (typeof entry.num !== 'number' || entry.num < 10000 || entry.num > 99999 || !Number.isInteger(entry.num)) {
                continue;
            }

            // Entry is valid, add to validData
            validData.push({
                name: entry.name,
                type: 1,
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

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export SAPI5 manager to namespace
window.BymChnConnector.sapi5 = window.BymChnConnector.sapi5 || {};
window.BymChnConnector.sapi5.registerSettings = registerSapi5Settings;
window.BymChnConnector.sapi5.registerListSetting = registerSapi5ListSetting;
window.BymChnConnector.sapi5.ListData = Sapi5ListData;
window.BymChnConnector.sapi5.ListSettings = Sapi5ListSettings;
