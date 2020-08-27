import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/post';
import mikroORMConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';


const main = async () => {
    //connect to db
    const orm = await MikroORM.init(mikroORMConfig);

    //run migrations automatically
    const migrator = orm.getMigrator();
    await migrator.up(); // runs migrations up to the latest

    const app = express();

    //creating apollo graphql server
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver], //enable us to query/mutate graphql data
            validate: false
        }),

        context: () => ({ em: orm.em }) //for giving Pgsql data access to graphql we are passing MicroORM entitymanager to apollo server.
    })

    apolloServer.applyMiddleware({ app });

    app.get('/', (req, res) => {
        res.send("hello");
    })

    app.listen(5000, () => console.log("Server started at port: "+5000));
}

main().catch(err => console.log(err));


