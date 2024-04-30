import { ZodError } from "zod";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./routs/_errors/badRequest";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, resquest, reply) => {
    if(error instanceof ZodError){
        return reply.status(400).send({
            message: "Error during validation.",
            error: error.flatten().fieldErrors
        });
    };

    if(error instanceof BadRequest){
        return reply.status(400).send({ message: error.message });
    };

    return reply.status(Number(error.statusCode)).send({message: "Sorry we have a error here"});
};