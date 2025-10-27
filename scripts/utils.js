/**
 * Bouyomichan Connector - Utility Functions
 * Common utilities and constants used throughout the module
 */

/**
 * Bouyomichan Connector specific configuration constants
 * Using unique naming to avoid conflicts with Foundry's global CONFIG
 * object which is used extensively throughout the application
 */
const BYM_CHN_CONNECTOR_CONFIG = {
    MODULE_NAME: "BymChnConnector",
    DEFAULT_VOLUME: 0.7,  // Default volume level (0.0 - 1.0 range)
    DEFAULT_API_SERVER: "http://127.0.0.1:50021",  // Default NijiVoice API server
    DEFAULT_NIJI_LIMIT: 500,  // Default NijiVoice credit limit warning threshold
    VOLUME_RANGE: {  // Volume range for settings slider
        min: 0,
        max: 300,
        step: 10
    }
};

/**
 * Voice type constants for different TTS engines
 * Each voice type has different volume ranges and processing requirements
 * @enum {number}
 */
const BYM_CHN_VOICE_TYPES = {
    BUILTIN: 0,    // Built-in Bouyomichan voices (normalized volume)
    SAPI5: 1,      // Windows SAPI5 voices (raw volume values)
    RESERVED: 2,   // Reserved for future use
    NIJIVOICE: 3   // NijiVoice cloud TTS service (0-1 volume range)
};

/**
 * Compare two version strings (e.g., "1.2.3" vs "1.2.4")
 * Used for Foundry VTT version compatibility checks
 * @param {string} a - First version string
 * @param {string} b - Second version string
 * @returns {number} - -1 if a < b, 0 if a === b, 1 if a > b
 */
const compareVersions = (a, b) => {
    if (a === b) return 0;

    try {
        const aComponents = a.split('.').map(num => parseInt(num, 10));
        const bComponents = b.split('.').map(num => parseInt(num, 10));
        const maxLength = Math.max(aComponents.length, bComponents.length);

        for (let i = 0; i < maxLength; i++) {
            const aNum = aComponents[i] || 0;
            const bNum = bComponents[i] || 0;

            if (aNum > bNum) return 1;
            if (aNum < bNum) return -1;
        }

        return 0;
    } catch (error) {
        console.error('[BymChnConnector] Version comparison failed:', error);
        return 0;
    }
};

/**
 * HTML tokenizer returning an array of strings (tags and text nodes).
 * Recognizes comments/CDATA/processing instructions, respects quoted attributes, and can capture script/style content.
 * @param {string} html - HTML source to tokenize.
 * @param {Object} [option] - Options: trim, recognizeComments, recognizeCDATA, treatScriptContent, allowUnclosedTagAsTag.
 * @returns {string[]} Array of tokens in document order (tags include delimiters; text nodes may be trimmed).
 */
function htmlTokenizer(html, option = {}) {
    const opt = {
        trim: Boolean(option.trim),
        recognizeComments: option.recognizeComments !== false, // default true
        recognizeCDATA: option.recognizeCDATA !== false,       // default true
        treatScriptContent: option.treatScriptContent !== false, // default true
        allowUnclosedTagAsTag: option.allowUnclosedTagAsTag !== false // default true
    };

    const tokens = [];
    const len = html.length;
    let index = 0;

    function pushTextIfAny(start, end) {
        if (start >= end) return;
        let text = html.substring(start, end);
        if (opt.trim) text = text.trim();
        if (text.length > 0) tokens.push(text);
    }

    while (index < len) {
        const tagStart = html.indexOf('<', index);
        if (tagStart === -1) {
            // No more tags, remaining text
            pushTextIfAny(index, len);
            break;
        }

        // Add text before tag
        if (tagStart > index) {
            pushTextIfAny(index, tagStart);
        }

        // Early check for specific syntaxes
        // 1) Comment: <!-- ... -->
        if (opt.recognizeComments && html.startsWith('<!--', tagStart)) {
            const commentEnd = html.indexOf('-->', tagStart + 4);
            if (commentEnd === -1) {
                // unterminated comment
                if (opt.allowUnclosedTagAsTag) {
                    tokens.push(html.substring(tagStart)); // rest as tag
                    break;
                } else {
                    // treat as text
                    pushTextIfAny(tagStart, len);
                    break;
                }
            } else {
                const tag = html.substring(tagStart, commentEnd + 3);
                tokens.push(tag);
                index = commentEnd + 3;
                continue;
            }
        }

        // 2) CDATA: <![CDATA[ ... ]]>
        if (opt.recognizeCDATA && html.startsWith('<![CDATA[', tagStart)) {
            const cdataEnd = html.indexOf(']]>', tagStart + 9);
            if (cdataEnd === -1) {
                if (opt.allowUnclosedTagAsTag) {
                    tokens.push(html.substring(tagStart));
                    break;
                } else {
                    pushTextIfAny(tagStart, len);
                    break;
                }
            } else {
                tokens.push(html.substring(tagStart, cdataEnd + 3));
                index = cdataEnd + 3;
                continue;
            }
        }

        // 3) Processing instruction <? ... ?>
        if (html.startsWith('<?', tagStart)) {
            const piEnd = html.indexOf('?>', tagStart + 2);
            if (piEnd === -1) {
                if (opt.allowUnclosedTagAsTag) {
                    tokens.push(html.substring(tagStart));
                    break;
                } else {
                    pushTextIfAny(tagStart, len);
                    break;
                }
            } else {
                tokens.push(html.substring(tagStart, piEnd + 2));
                index = piEnd + 2;
                continue;
            }
        }

        // General tag parsing: walk until '>' but respect quotes
        let tagEnd = tagStart + 1;
        let inQuote = false;
        let quoteChar = '';
        while (tagEnd < len) {
            const ch = html[tagEnd];
            if (inQuote) {
                if (ch === quoteChar) {
                    inQuote = false;
                    quoteChar = '';
                }
            } else {
                if (ch === '"' || ch === "'") {
                    inQuote = true;
                    quoteChar = ch;
                } else if (ch === '>') {
                    tagEnd++; // include '>'
                    break;
                }
            }
            tagEnd++;
        }

        if (tagEnd > len) tagEnd = len;

        // If we reached end without finding '>'
        if (tagEnd === len && html[tagEnd - 1] !== '>') {
            if (opt.allowUnclosedTagAsTag) {
                const tag = html.substring(tagStart);
                tokens.push(tag);
                break;
            } else {
                // treat as text
                pushTextIfAny(tagStart, len);
                break;
            }
        }

        // Now have a tag substring
        const tag = html.substring(tagStart, tagEnd);
        tokens.push(tag);
        index = tagEnd;

        // Special handling: if it's an opening <script ...> or <style ...>, then capture inner content until closing tag
        if (opt.treatScriptContent) {
            // determine lowercased tag name
            const openTagNameMatch = tag.match(/^<\s*([a-zA-Z0-9:-]+)/);
            if (openTagNameMatch) {
                const name = openTagNameMatch[1].toLowerCase();
                if (name === 'script' || name === 'style') {
                    // find the closing tag case-insensitively
                    const closeTag = `</${name}>`;
                    const lowerHtml = html.toLowerCase(); // note: allocates, but acceptable for this search
                    const closeIndex = lowerHtml.indexOf(closeTag, index);
                    if (closeIndex === -1) {
                        // no closing tag found
                        if (opt.allowUnclosedTagAsTag) {
                            // push rest as one text node
                            const inner = html.substring(index);
                            if (opt.trim) {
                                const t = inner.trim();
                                if (t.length > 0) tokens.push(t);
                            } else if (inner.length > 0) {
                                tokens.push(inner);
                            }
                            index = len;
                            break;
                        } else {
                            // treat remaining as text
                            pushTextIfAny(index, len);
                            index = len;
                            break;
                        }
                    } else {
                        // push inner content as a single text token (possibly empty)
                        const inner = html.substring(index, closeIndex);
                        if (opt.trim) {
                            const t = inner.trim();
                            if (t.length > 0) tokens.push(t);
                        } else if (inner.length > 0) {
                            tokens.push(inner);
                        }
                        // push closing tag
                        const closingTag = html.substring(closeIndex, closeIndex + closeTag.length);
                        tokens.push(closingTag);
                        index = closeIndex + closeTag.length;
                        continue;
                    }
                }
            }
        }
    }

    return tokens;
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export config and constants to namespace
window.BymChnConnector.config = BYM_CHN_CONNECTOR_CONFIG;
window.BymChnConnector.voiceTypes = BYM_CHN_VOICE_TYPES;

// Export utilities to namespace
window.BymChnConnector.utils = window.BymChnConnector.utils || {};
window.BymChnConnector.utils.compareVersions = compareVersions;
window.BymChnConnector.utils.htmlTokenizer = htmlTokenizer;