const {gql, ApolloClient, InMemoryCache} = require('@apollo/client');
const {WebSocketLink} = require("@apollo/client/link/ws");
const {SubscriptionClient} = require("subscriptions-transport-ws");
const {WebSocket} = require("ws");
const util = require('util')

const URL = "wss://dapp-01.tontech.io/graphql"
const ADDRESS = "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi"; // Telegram Usernames
const QUERY = gql`
    subscription NftItems($address: String!) {
        nft_items (filter: {collection_address: {eq: $address}})
        {
            address
            collection_address
            owner_address
            last_trans_lt
            fragment_token_info {
                name
                domain
            }
            content {
                content_type
                data {
                    key
                    value
                }
                uri
            }
            fragment_auction {
                state {
                    end_time
                    last_bid {
                        bid
                        bid_ts
                        bidder_address
                    }
                    min_bid
                }
            }
            interfaces
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
