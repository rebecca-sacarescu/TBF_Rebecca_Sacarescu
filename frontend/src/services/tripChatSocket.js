import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Connects to the trip group chat WebSocket using STOMP over SockJS.
 *
 * JWT is passed as a query param (?token=...) because SockJS does not
 * support custom headers during the HTTP upgrade handshake.
 *
 * @param {{
 *   tripId:    number,
 *   token:     string,
 *   onMessage: (msg: object) => void,
 *   onConnect: () => void,
 *   onError:   (err: any) => void,
 * }} options
 *
 * @returns {{
 *   sendMessage: (content: string) => void,
 *   disconnect:  () => void,
 * }}
 */
export function connectTripChatSocket({ tripId, token, onMessage, onConnect, onError }) {
    // Encode token to be safe in a query param
    const wsUrl = `${BASE_URL}/ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
        // SockJS factory — called by stompjs when (re)connecting
        webSocketFactory: () => new SockJS(wsUrl),

        // Reconnect automatically after 5 s on unexpected disconnect
        reconnectDelay: 5000,

        onConnect: () => {
            // Subscribe to the trip-scoped broadcast topic
            client.subscribe(`/topic/trips/${tripId}/chat`, (frame) => {
                try {
                    const msg = JSON.parse(frame.body);
                    onMessage?.(msg);
                } catch {
                    // Malformed frame — ignore silently
                }
            });
            onConnect?.();
        },

        onDisconnect: () => {
            // Stompjs handles reconnect via reconnectDelay;
            // surface the event so the UI can show "reconnecting…"
            onError?.({ type: "disconnect" });
        },

        onStompError: (frame) => {
            onError?.({ type: "stomp", frame });
        },

        onWebSocketError: (event) => {
            onError?.({ type: "websocket", event });
        },
    });

    client.activate();

    /**
     * Sends a chat message to the server destination.
     * Content is validated on the backend as well, but we guard here too.
     * @param {string} content
     */
    function sendMessage(content) {
        if (!client.connected) return;
        if (!content || !content.trim()) return;

        client.publish({
            destination: `/app/trips/${tripId}/chat/send`,
            body: JSON.stringify({ content: content.trim() }),
        });
    }

    /**
     * Gracefully closes the STOMP session and underlying SockJS connection.
     */
    function disconnect() {
        client.deactivate();
    }

    return { sendMessage, disconnect };
}