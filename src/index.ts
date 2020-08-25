import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/post';
import mikroORMConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';


const main = async () => {
    //connect to db
    const orm = await MikroORM.init(mikroORMConfig);

    //run migrations automatically
    await orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        })
    })

    apolloServer.applyMiddleware({ app });

    app.get('/', (req, res) => {
        res.send("hello");
    })

    app.listen(5000, () => console.log("Server started at port: "+5000));
}

main().catch(err => console.log(err));


