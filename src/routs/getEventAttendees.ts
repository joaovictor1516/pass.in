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
                    pageIndex: z.string().nullable().default("0").transform(Number)
                }),
                response: {}
            }
        }, async (request, reply) => {
            const { eventId } = request.params;
            const { pageIndex } = request.query;

            const attendees = await prisma.attendees.findMany({
                where: {
                    eventId
                },
                take: 10,
                skip: pageIndex * 10
            });

            return reply.status(200).send(attendees);
        });
};