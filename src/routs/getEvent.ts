import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

import { BadRequest } from "./_errors/badRequest";

export async function getEvent(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/events/:eventId", {
            schema: {
                summary: "Consult an event datas.",
                tags: ["event"],
                params: z.object({
                    eventId: z.string({invalid_type_error: "Invalid event identificator."}).uuid()
                }),
                response: {
                    200: z.object({
                        event: z.object({
                            id: z.string().uuid(),
                            title: z.string(),
                            details: z.string().nullable(),
                            maximumAttendees: z.number().int().nullable(),
                            attendeesAmount: z.number().int()
                        })
                    })
                }
            }
        }, async (request, reply) => {
            const {eventId} = request.params;

            const event = await prisma.event.findUnique({
                select: {
                    id: true,
                    tittle: true,
                    details: true,
                    maximumAttendees: true,
                    _count: {
                        select: {
                            attendees: true
                        }
                    }
                },

                where: {
                    id: eventId
                }
            });

            if(event === null){
                throw new BadRequest("This event does not exist.");
            };

            return reply.status(200).send({
                event: {
                    id: event.id,
                    title: event.tittle,
                    details: event.details,
                    maximumAttendees: event.maximumAttendees,
                    attendeesAmount: event._count.attendees
                }
            });
    });
};