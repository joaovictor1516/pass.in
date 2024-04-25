import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function getEventAttendees(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/events/:eventId/attendees", {
            schema: {
                params: z.object({
                    eventId: z.string().uuid()
                }),
                querystring: z.object({
                    query: z.string().nullish(),//o nullish informa que pode ser null ou undefined
                    pageIndex: z.string().nullish().default("0").transform(Number)
                }),
                response: {}
            }
        }, async (request, reply) => {
            const { eventId } = request.params;
            const { pageIndex, query } = request.query;

            const attendees = await prisma.attendees.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    checkIn: {
                        select: {
                            createdAt: true
                        }
                    }
                },
                where: query ? {
                    eventId,
                    name: {
                        contains: query
                    }
                } : {
                    eventId
                },
                take: 10,
                skip: pageIndex * 10
            });

            return reply.status(200).send({ 
                attendees: attendees.map((attendees) => {
                    const object = {
                        id: attendees.id,
                        name: attendees.name,
                        email: attendees.email,
                        createdAt: attendees.createdAt,
                        checkedInAt: attendees.checkIn ? attendees.checkIn.createdAt : null
                    };

                    return object;
                })
            });
        });
};