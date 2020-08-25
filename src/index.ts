import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/post';
import mikroORMConfig from './mikro-orm.config';


const main = async () => {
    //connect to db
    const orm = await MikroORM.init(mikroORMConfig);

    //run migrations automatically
    await orm.getMigrator().up();

    //insert a post
    // const post = await orm.em.create(Post, { title: "My second post" });
    // await orm.em.persistAndFlush(post);

    //select query
    // const posts = await orm.em.find(Post, {});
    // console.log(posts);
}

main().catch(err => console.log(err));


