import { ZodTypeProvider } from "fastify-type-provider-zod";
import { generateSlug } from "../utils/generateSlug";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { FastifyInstance } from "fastify";

export async function creatEvent(app: FastifyInstance){
    app
       .withTypeProvider<ZodTypeProvider>()
       .post("/events", {
            schema: {
                body: z.object({
                    tittle: z.string().min(4),
                    details: z.string().nullable(),
                    maximumAttendees: z.number().int().positive().nullable()
                }),
                response: {
                    201: z.object({
                        eventId: z.string().uuid()
                    })
                }
            } //faz o parse automaticamente, logo tudo o que estiver incluido no schema sera validado automaticamente pelo fastify.
            //tambem e validada a resposta (response).
        }, async (request, reply) => {
            const {
                tittle,
                details,
                maximumAttendees
            } = (request.body);

            const slug = generateSlug(tittle);

            const eventWithSameSlug = await prisma.event.findUnique({
                where:{
                    slug,
                }
            });

            if(eventWithSameSlug !== null){
                reply.status(404);

                throw new Error("Already exist a event with this title.");
            };

            const event = await prisma.event.create({
                data:{
                    tittle,
                    details,
                    maximumAttendees,
                    slug,
                }
            });

            return reply.status(201).send({eventId: event.id});
        });
};