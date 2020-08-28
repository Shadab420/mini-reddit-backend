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
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';


const main = async () => {
    //connect to db
    const orm = await MikroORM.init(mikroORMConfig);

    //run migrations automatically
    const migrator = orm.getMigrator();
    await migrator.up(); // runs migrations up to the latest

    const app = express();

    //Setting up Redis
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',

            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years!
                httpOnly: true, //now I can't access cookie from client side.
                secure: __prod__, //use https during production
                sameSite: 'lax' //protection for csrf
            },
            saveUninitialized: false, //stop creating default session with no data.
            secret: 'keyboard cat',
            resave: false,

        })
    )


    //creating apollo graphql server
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver], //enable us to query/mutate graphql data
            validate: false
        }),

        context: ({req, res}): MyContext => ({ em: orm.em, req, res }) //for giving Pgsql data access to graphql we are passing MicroORM entitymanager to apollo server.
    })

    apolloServer.applyMiddleware({ app });

    app.get('/', (_, res) => {
        res.send("hello");
    })

    app.listen(5000, () => console.log("Server started at port: "+5000));
}

main().catch(err => console.log(err));


