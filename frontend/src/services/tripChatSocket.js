/**
 * tripChatSocket.js
 *
 * Connects to the Spring WebSocket (SockJS + STOMP) endpoint.
 * Used by both TripChatPanel (chat messages) and TripRoomPage (AI plan notifications).
 *
 * The `topic` prop is optional. If not provided, defaults to the chat topic:
 *   /topic/trips/{tripId}/chat
 *
 * For AI plan notifications, pass:
 *   topic: `/topic/trips/${tripId}/ai-plan`
 *
 * sendMessage is only relevant for the chat topic. For the AI plan topic,
 * only onMessage (read) is used.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/**
 * @param {{
 *   tripId:    number,
 *   token:     string,
 *   topic?:    string,           — override subscription topic
 *   onMessage: (data: any) => void,
 *   onConnect?: () => void,
 *   onError?:   () => void,
 * }} options
 * @returns {{ sendMessage: (content: string) => void, disconnect: () => void }}
 */
export function connectTripChatSocket({
                                          tripId,
                                          token,
                                          topic,
                                          onMessage,
                                          onConnect,
                                          onError,
                                      }) {
    let stompClient = null;
    let subscription = null;

    const subscriptionTopic = topic ?? `/topic/trips/${tripId}/chat`;
    const sendDestination   = `/app/trips/${tripId}/chat/send`;

    // Lazy-load SockJS and STOMP from CDN if not bundled.
    // These are already available via spring-boot-starter-websocket's SockJS client.
    // In Vite, install: npm install sockjs-client @stomp/stompjs
    let SockJS;
    let Stomp;

    async function init() {
        try {
            // Dynamic import — works if installed as npm packages
            const sockjsMod = await import("sockjs-client");
            const stompMod  = await import("@stomp/stompjs");
            SockJS = sockjsMod.default;
            Stomp  = stompMod.Client;
        } catch {
            // Fallback: assume globals are available (CDN)
            SockJS = window.SockJS;
            Stomp  = window.StompJs?.Client;
        }

        if (!SockJS || !Stomp) {
            console.error("[tripChatSocket] SockJS or STOMP not available.");
            onError?.();
            return;
        }

        stompClient = new Stomp({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws?token=${encodeURIComponent(token)}`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                subscription = stompClient.subscribe(subscriptionTopic, (frame) => {
                    try {
                        const data = JSON.parse(frame.body);
                        onMessage(data);
                    } catch {
                        // non-JSON frame — ignore
                    }
                });
                onConnect?.();
            },
            onStompError: () => {
                onError?.();
            },
            onWebSocketError: () => {
                onError?.();
            },
        });

        stompClient.activate();
    }

    init();

    return {
        sendMessage: (content) => {
            if (!stompClient?.connected) return;
            stompClient.publish({
                destination: sendDestination,
                body: JSON.stringify({ content }),
            });
        },
        disconnect: () => {
            subscription?.unsubscribe();
            stompClient?.deactivate();
            stompClient  = null;
            subscription = null;
        },
    };
}