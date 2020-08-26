import { Resolver, Query, Ctx, Arg, Int } from "type-graphql";
import { Post } from "../entities/post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {

    //select query
    @Query(() => [Post], { nullable: true })
    posts(@Ctx()  { em }: MyContext ): Promise<Post[]> {
       return em.find(Post, {});
    }

    //select post by id
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number, //argument for query
        @Ctx()  { em }: MyContext 
    ): Promise<Post | null>{
        return em.findOne(Post, {id});
    }
}