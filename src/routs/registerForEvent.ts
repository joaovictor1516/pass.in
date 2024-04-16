import { ZodTypeProvider } from "fastify-type-provider-zod";
import { generateSlug } from "../utils/generateSlug";
import { prisma } from "../lib/prisma";
import { string, z } from "zod";
import { FastifyInstance } from "fastify";

export function registerForEvent(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post("/event/:eventId/", {
            schema: {
                body: z.object({
                    name: z.string().min(5),
                    email: z.string().email(),
                }),
                params: z.object({
                    eventId: z.string().uuid()
                }),
                response: {
                    201: z.object({
                        attendeeId: z.number()
                    })
                }
            }
        }, async (response, reply) => {
            const {eventId} = response.params;
            const {name, email} = response.body;

            const attendee = await prisma.attendees.create({
                data: {
                    name,
                    email,
                    eventId
                }
            });

            return(reply.status(201).send({attendeeId: attendee.id}));
        });
};