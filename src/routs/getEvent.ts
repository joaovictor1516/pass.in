
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
            response: {
                200: z.object({
                        id: z.string().uuid(),
                        title: z.string().min(4),
                        details: z.string().nullable(),
                        maximumAttendees: z.number().int().positive().nullable(),
                        attendeesAmount: z.number().int().positive()
                })
            }
        },
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
            reply.status(404);

            throw new Error("This event does not exist.");
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