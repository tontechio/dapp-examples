const {gql, ApolloClient, InMemoryCache} = require('@apollo/client');
const {WebSocketLink} = require("@apollo/client/link/ws");
const {SubscriptionClient} = require("subscriptions-transport-ws");
const {WebSocket} = require("ws");
const util = require('util')

const URL = "wss://dapp-01.tontech.io/graphql"
const ADDRESS = "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF";
const QUERY = gql`
    subscription AccountTransactions($address: String!) {
        transactions(
            filter: {
                account_addr: { eq: $address }
            }
        ) {
            now
            id
            lt
            block_id
            block { 
                id
                workchain_id
                seq_no
            }
            in_message {
                id
                src
                dst
                value
            }
            out_messages {
                id
                src
                dst
                value
            }
            balance_delta
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
            variables: {address: ADDRESS}
        }).subscribe({
            next: onNext,
            error: onError,
            complete: onComplete,
        });

    } catch (e) {
        console.error(e);
    }
})();
