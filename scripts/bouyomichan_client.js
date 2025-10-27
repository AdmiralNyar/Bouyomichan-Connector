/**
 * Bouyomichan WebSocket Client
 * Communicates with Bouyomichan text-to-speech software via WebSocket
 */

/**
 * Connection configuration
 * @readonly
 * @enum {string|number}
 */
const CONNECTION = {
    HOST: 'localhost',
    PORT: 50002, // WebSocket server port
    // PORT: 50001, // Direct Bouyomichan connection (alternative)
    PROTOCOL: 'ws'
};

/**
 * Voice command constants
 * @readonly
 * @enum {number}
 */
const VOICE_COMMANDS = {
    SPEAK_MESSAGE: 0x0001,
    DEFAULT_SETTING: -1
};

/**
 * Text encoding types
 * @readonly
 * @enum {number}
 */
const TEXT_ENCODING = {
    UTF8: 0,
    UNICODE: 1,
    SHIFT_JIS: 2
};

/**
 * BouyomiChan WebSocket Client Class
 * @class
 */
class BouyomiChanClient {
    /**
     * Create a new BouyomiChan client instance
     * @constructor
     */
    constructor() {
        /** @type {WebSocket|null} */
        this.socket = null;
        /** @type {string} */
        this.cmntStr = '';
        /** @type {number} */
        this.voicesetting = 0;
        /** @type {number} */
        this.volume = 100;
        /** @type {boolean} */
        this.isConnecting = false;
    }

    /**
     * Send text to Bouyomichan for speech synthesis
     * @param {string} text - Text to be spoken
     * @param {number} voice - Voice ID (0=default, 1-8=builtin voices, 10001+=SAPI5)
     * @param {number} volume - Volume level (0-300, -1=use Bouyomichan setting)
     * @returns {Promise<void>}
     */
    async talk(text, voice = 0, volume = -1) {
        if (this.isConnecting) {
            console.warn('[BouyomiChanClient] Connection already in progress');
            return;
        }

        if (!text || typeof text !== 'string') {
            console.error('[BouyomiChanClient] Invalid text parameter:', text);
            return;
        }

        try {
            this.cmntStr = text.trim();
            this.voicesetting = Math.max(0, parseInt(voice, 10) || 0);
            this.volume = parseInt(volume, 10) || -1;
            this.isConnecting = true;

            await this._createConnection();
        } catch (error) {
            console.error('[BouyomiChanClient] Talk failed:', error);
            this.isConnecting = false;
        }
    }

    /**
     * Create WebSocket connection
     * @private
     * @returns {Promise<void>}
     */
    async _createConnection() {
        const wsUrl = `${CONNECTION.PROTOCOL}://${CONNECTION.HOST}:${CONNECTION.PORT}/ws/`;

        try {
            this.socket = new WebSocket(wsUrl);
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = this._onOpen.bind(this);
            this.socket.onerror = this._onError.bind(this);
            this.socket.onclose = this._onClose.bind(this);
            this.socket.onmessage = this._onMessage.bind(this);
        } catch (error) {
            this.isConnecting = false;
            throw new Error(`Failed to create WebSocket connection: ${error.message}`);
        }
    }

    /**
     * WebSocket connection opened
     * @private
     * @param {Event} event - WebSocket open event
     */
    _onOpen(event) {
        console.log('[BouyomiChanClient] WebSocket connected');

        try {
            const data = this._createBouyomiChanData(this.cmntStr, this.voicesetting, this.volume);
            this.socket.send(data.buffer);
        } catch (error) {
            console.error('[BouyomiChanClient] Failed to send data:', error);
            this._cleanup();
        }
    }


    /**
     * WebSocket connection error
     * @private
     * @param {Event} event - WebSocket error event
     */
    _onError(event) {
        console.error('[BouyomiChanClient] WebSocket error:', event);
        this._cleanup();
    }

    /**
     * WebSocket connection closed
     * @private
     * @param {CloseEvent} event - WebSocket close event
     */
    _onClose(event) {
        console.log('[BouyomiChanClient] WebSocket closed');
        this._cleanup();
    }

    /**
     * WebSocket message received
     * @private
     * @param {MessageEvent} event - WebSocket message event
     */
    _onMessage(event) {
        console.log('[BouyomiChanClient] Message received');
        this._cleanup();
    }

    /**
     * Cleanup connection and reset state
     * @private
     */
    _cleanup() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnecting = false;
    }


    /**
     * Create binary data packet for Bouyomichan
     * @private
     * @param {string} text - Text to be spoken
     * @param {number} voice - Voice ID
     * @param {number} volume - Volume level
     * @returns {Uint8Array} Binary data packet
     */
    _createBouyomiChanData(text, voice, volume) {
        try {
            const textBytes = this._stringToUtf8ByteArray(text);
            const packetSize = 15 + textBytes.length; // Header (15 bytes) + text
            const data = new Uint8Array(packetSize);

            let pos = 0;

            // Command (16bit): 0x0001 = read message
            this._writeInt16(data, pos, VOICE_COMMANDS.SPEAK_MESSAGE);
            pos += 2;

            // Speed (16bit): -1 = use Bouyomichan setting
            this._writeInt16(data, pos, VOICE_COMMANDS.DEFAULT_SETTING);
            pos += 2;

            // Tone (16bit): -1 = use Bouyomichan setting
            this._writeInt16(data, pos, VOICE_COMMANDS.DEFAULT_SETTING);
            pos += 2;

            // Volume (16bit): -1 = use Bouyomichan setting
            this._writeInt16(data, pos, volume);
            pos += 2;

            // Voice (16bit): 0=default, 1-8=builtin, 10001+=SAPI5
            this._writeInt16(data, pos, voice);
            pos += 2;

            // Text encoding (8bit): 0=UTF-8
            data[pos++] = TEXT_ENCODING.UTF8;

            // Text length (32bit)
            this._writeInt32(data, pos, textBytes.length);
            pos += 4;

            // Text data
            data.set(textBytes, pos);

            return data;
        } catch (error) {
            console.error('[BouyomiChanClient] Failed to create data packet:', error);
            throw error;
        }
    }

    /**
     * Write 16-bit integer to byte array (little-endian)
     * @private
     * @param {Uint8Array} data - Target array
     * @param {number} pos - Position to write
     * @param {number} value - Value to write
     */
    _writeInt16(data, pos, value) {
        data[pos] = value & 0xFF;
        data[pos + 1] = (value >> 8) & 0xFF;
    }

    /**
     * Write 32-bit integer to byte array (little-endian)
     * @private
     * @param {Uint8Array} data - Target array
     * @param {number} pos - Position to write
     * @param {number} value - Value to write
     */
    _writeInt32(data, pos, value) {
        data[pos] = value & 0xFF;
        data[pos + 1] = (value >> 8) & 0xFF;
        data[pos + 2] = (value >> 16) & 0xFF;
        data[pos + 3] = (value >> 24) & 0xFF;
    }

    /**
     * Convert string to UTF-8 byte array
     * @private
     * @param {string} str - Input string
     * @returns {Uint8Array} UTF-8 encoded byte array
     */
    _stringToUtf8ByteArray(str) {
        if (!str) return new Uint8Array(0);

        try {
            // Use TextEncoder for better performance and reliability
            if (typeof TextEncoder !== 'undefined') {
                return new TextEncoder().encode(str);
            }

            // Fallback for older environments
            return this._manualUtf8Encode(str);
        } catch (error) {
            console.error('[BouyomiChanClient] UTF-8 encoding failed:', error);
            return new Uint8Array(0);
        }
    }

    /**
     * Manual UTF-8 encoding (fallback)
     * @private
     * @param {string} str - Input string
     * @returns {Uint8Array} UTF-8 encoded byte array
     */
    _manualUtf8Encode(str) {
        const bytes = [];

        for (let i = 0; i < str.length; i++) {
            let codePoint = str.charCodeAt(i);

            // Handle surrogate pairs
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && i + 1 < str.length) {
                const lowSurrogate = str.charCodeAt(i + 1);
                if (lowSurrogate >= 0xDC00 && lowSurrogate <= 0xDFFF) {
                    codePoint = 0x10000 + ((codePoint & 0x03FF) << 10) + (lowSurrogate & 0x03FF);
                    i++; // Skip the low surrogate
                }
            }

            // Encode to UTF-8
            if (codePoint < 0x80) {
                bytes.push(codePoint);
            } else if (codePoint < 0x800) {
                bytes.push(0xC0 | (codePoint >> 6));
                bytes.push(0x80 | (codePoint & 0x3F));
            } else if (codePoint < 0x10000) {
                bytes.push(0xE0 | (codePoint >> 12));
                bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
                bytes.push(0x80 | (codePoint & 0x3F));
            } else if (codePoint < 0x200000) {
                bytes.push(0xF0 | (codePoint >> 18));
                bytes.push(0x80 | ((codePoint >> 12) & 0x3F));
                bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
                bytes.push(0x80 | (codePoint & 0x3F));
            }
        }

        return new Uint8Array(bytes);
    }
}

// Initialize BymChnConnector namespace
window.BymChnConnector = window.BymChnConnector || {};

// Export client to namespace
window.BymChnConnector.client = window.BymChnConnector.client || {};
window.BymChnConnector.client.BouyomiChanClient = BouyomiChanClient;
