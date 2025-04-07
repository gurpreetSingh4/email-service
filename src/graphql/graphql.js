import { ApolloServer } from "@apollo/server";
import { emailTypeDefs } from "./graphqlTypeDefs/email-typeDefs.js";
import { graphQlResolvers } from "./graphqlResolvers/email-resolvers.js";


export const connectToApolloServer = () => {
    return new ApolloServer({
        typeDefs:emailTypeDefs,
        resolvers:graphQlResolvers
    });
}