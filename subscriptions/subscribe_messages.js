const {gql, ApolloClient, InMemoryCache} = require('@apollo/client');
const {WebSocketLink} = require("@apollo/client/link/ws");
const {SubscriptionClient} = require("subscriptions-transport-ws");
const {WebSocket} = require("ws");
const util = require('util')

const URL = "wss://dapp-01.tontech.io/graphql"
const MESSAGE_TYPE = 0; // 0 - internal, 1 - extIn, 2 - extOut
const QUERY = gql`
    subscription Messages($type: Int!) {
        messages(
            filter: { msg_type: { eq: $type }, src: { ne: "Ef8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAU" } }
        ) {
            id
            src
            dst
            value
            msg_type
            msg_type_name
            body
            boc
        }
    }
`;

(async () => {
    const wsLink = new WebSocketLink(
        new SubscriptionClient(URL,
            {
                reconnect: true,
            },
            WebSocket
        )
    );

    const client = new ApolloClient({
        link: wsLink,
        cache: new InMemoryCache()
    });

    try {
        // handle incoming values
        const onNext = (result) => {
            console.log(util.inspect(result.data, {showHidden: false, depth: null, colors: true}));
        };

        // handle error
        const onError = (err) => {
            console.log("error", err);
        };

        // complete the subscription
        let onComplete = () => {
            console.log("done");
        };

        client.subscribe({
            query: QUERY,
            variables: {type: MESSAGE_TYPE}
        }).subscribe({
            next: onNext,
            error: onError,
            complete: onComplete,
        });

    } catch (e) {
        console.error(e);
    }
})();
