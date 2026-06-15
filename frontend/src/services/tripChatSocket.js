const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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
    let SockJS;
    let Stomp;

    async function init() {
        try {
            const sockjsMod = await import("sockjs-client");
            const stompMod  = await import("@stomp/stompjs");
            SockJS = sockjsMod.default;
            Stomp  = stompMod.Client;
        } catch {
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