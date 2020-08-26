import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
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
        @Arg('id') id: number, //argument for query
        @Ctx()  { em }: MyContext 
    ): Promise<Post | null>{
        return em.findOne(Post, {id});
    }

    //create a post
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string, //argument for query
        @Ctx()  { em }: MyContext 
    ): Promise<Post>{
        const post = em.create(Post, {title}); //creating the post
        await em.persistAndFlush(post); //insert into pgsql database
        return post;
    }

    //update a post
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string, //argument for query
        @Ctx()  { em }: MyContext 
    ): Promise<Post | null>{
        
        const post = await em.findOne(Post, {id});
        
        if(!post){
            return null;
        }

        if(typeof title !== 'undefined') post.title = title;
        await em.persistAndFlush(post);

        return post;
    }

    //delete a post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx()  { em }: MyContext 
    ): Promise<boolean>{
        
        await em.nativeDelete(Post, {id});
        return true;
    }
}