import { ZodTypeProvider } from "fastify-type-provider-zod";
import { generateSlug } from "../utils/generateSlug";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

import { BadRequest } from "./_errors/badRequest";

export async function creatEvent(app: FastifyInstance){
    app
       .withTypeProvider<ZodTypeProvider>()
       .post("/events", {
            schema: {
                summary: "Create an event.",
                tags: ["event"],
                body: z.object({
                    tittle: z.string({invalid_type_error: "The title need be a text."}).min(4),
                    details: z.string({invalid_type_error: "The detail need be a text."}).nullable(),
                    maximumAttendees: z.number({invalid_type_error: "The maximum attendees need be a number."}).int().positive().nullable()
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
            } = request.body;

            const slug = generateSlug(tittle);

            const eventWithSameSlug = await prisma.event.findUnique({
                where:{
                    slug,
                }
            });

            if(eventWithSameSlug !== null){
                throw new BadRequest("Already exist a event with this title.");
            };

            const event = await prisma.event.create({
                data:{
                    slug,
                    tittle,
                    details,
                    maximumAttendees
                }
            });

            return reply.status(201).send({eventId: event.id});
        });
};