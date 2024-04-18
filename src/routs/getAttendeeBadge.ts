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
                            name: z.string(),
                            email: z.string().email(),
                            eventTitle: z.string(),
                            checkingUrl: z.string().url()
                        })
                    })
                }
            }
        }, async (request, reply) => {
            const {attendeeId} = request.params;

            const attendee = await prisma.attendees.findUnique({
                select: {
                    name: true,
                    email: true,
                    event: {
                        select: {
                            tittle: true
                        }
                    }
                },
                where: {
                    id: attendeeId
                }
            })

            if(attendee === null){
                throw new Error("The attendee doesn`t exist.");
            };

            const baseUrl = `${request.protocol}://${request.hostname}`;

            const checkInUrl = new URL(`/attendees/${attendeeId}/check-in`, baseUrl);

            return reply.code(200).send({
                attendee: {
                    name: attendee.name,
                    email: attendee.email,
                    eventTitle: attendee.event.tittle,
                    checkingUrl: checkInUrl.toString()
                }
            });
        });
};