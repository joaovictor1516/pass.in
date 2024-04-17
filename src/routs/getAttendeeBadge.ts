import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function getAttendeeBadge(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/attendee/:attendeeId/badge", {
            schema: {
                params: z.object({
                    attendeeId: z.coerce.number().int()
                }),
                response: {
                    200: z.object({
                        attendee: z.object({
                            id: z.number().int(),
                            name: z.string(),
                            email: z.string().email(),
                            eventId: z.string().uuid()
                        })
                    })
                }
            }
        }, async (request, reply) => {
            const {attendeeId} = request.params;

            const attendee = await prisma.attendees.findUnique({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    eventId: true
                },
                where: {
                    id: attendeeId
                }
            })

            if(attendee === null){
                throw new Error("The attendee does`nt exist");
            };

            return reply.code(200).send({
                attendee: {
                    id: attendee.id,
                    name: attendee.name,
                    email: attendee.email,
                    eventId: attendee.eventId
                }
            });
        });
};