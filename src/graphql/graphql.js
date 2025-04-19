import { ApolloServer } from "@apollo/server";
import { emailTypeDefs } from "./graphqlTypeDefs/email-typeDefs.js";
import { graphQlEmailResolvers } from "./graphqlResolvers/email-resolvers.js";


export const connectToApolloServer = () => {
    return new ApolloServer({
        typeDefs:emailTypeDefs,
        resolvers:graphQlEmailResolvers
    });
}