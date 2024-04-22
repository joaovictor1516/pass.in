import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function checkIn(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/attendees/:attendeeId/check-in", {
            schema: {
                params: z.object({
                    attendeeId: z.coerce.number().int()
                }),
                response:{
                    201: z.object({
                        attendeeId: z.number().int()
                    })
                }
            }
        }, async (request, reply) => {
            const {attendeeId} = request.params;

           const checkIn = await prisma.checkIn.findUnique({
            where: {
                attendeesId: attendeeId
            }
           });

           if(checkIn !== null){
                reply.code(404);
                throw new Error("Attendee already checked in.");
           };

           await prisma.checkIn.create({
                data: {
                    attendeesId: attendeeId
                }
           });

           return reply.code(201).send({attendeeId});
        });
};