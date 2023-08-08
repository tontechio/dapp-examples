const {gql, ApolloClient, InMemoryCache} = require('@apollo/client');
const {WebSocketLink} = require("@apollo/client/link/ws");
const {SubscriptionClient} = require("subscriptions-transport-ws");
const {WebSocket} = require("ws");
const util = require('util')

const URL = "wss://dapp-01.tontech.io/graphql"
const WORKCHAIN_ID = -1;
const QUERY = gql`
    subscription OnUpdate($workchain_id: Int!) {
        blocks(filter: { workchain_id: { eq: $workchain_id } }) {
            id
            workchain_id
            seq_no
            gen_utime
            account_blocks {
                account_addr
                transactions {
                    transaction_id
                    lt
                }
            }
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
            variables: {workchain_id: WORKCHAIN_ID}
        }).subscribe({
            next: onNext,
            error: onError,
            complete: onComplete,
        });

    } catch (e) {
        console.error(e);
    }
})();
