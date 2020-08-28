import { Resolver, Mutation, InputType, Field, Ctx, Arg, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import argon2 from 'argon2';
import { User } from "../entities/user";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    
    @Mutation(() => UserResponse)
    async register(
        @Arg('options', ()=>UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {

        if(options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "Username should be at least 3 characters long!"
                }]
            }
        }

        if(options.password.length < 6) {
            return {
                errors: [{
                    field: "password",
                    message: "Password should be at least 6 characters long!"
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword
        });

        try{
            await em.persistAndFlush(user);
        }
        catch(err) {
            if(err.code === '23505') {
                return {
                    errors: [{
                      field: "username",
                      message: "Username already taken!"  
                    }]
                }
            }
        }
        
        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', ()=>UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username})
    
        if(!user) {
            return {
                errors: [{
                    field: "username",
                    message: "User doesn't exist!"
                }]
            }
        }

        const valid = await argon2.verify(user.password, options.password);

        if(!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "Wrong password!"
                }]
            }
        }

        req.session.userId = user.id;

        return {
            user
        }
    }

}