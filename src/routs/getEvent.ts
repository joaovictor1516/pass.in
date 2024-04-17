
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function getEvent(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get("/events/:eventId", {
        schema: {
            params: z.object({
                eventId: z.string().uuid()
            }),
            response: {}
        },
    }, async (request, reply) => {
        const {eventId} = request.params;

        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if(event === null){
            reply.status(404);

            throw new Error("This event does not exist.");
        };

        return reply.status(200).send({event});
    });
};