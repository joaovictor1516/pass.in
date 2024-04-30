import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import {  z } from "zod";
import { FastifyInstance } from "fastify";

export async function registerForEvent(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post("/events/:eventId/attendee", {
            schema: {
                summary: "Check all participant datas.",
                tags: ["event"],
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
        }, async (request, reply) => {
            const {eventId} = request.params;
            const {name, email} = request.body;

            const attendeeExists = await prisma.attendees.findUnique({
                where: {
                    eventId_email:{
                        eventId,
                        email,
                    }
                }
            });

            const [event, amountOfAttendeesForEvent] = await Promise.all([
                prisma.event.findUnique({
                    where: {
                        id: eventId
                    }
                }),

                prisma.attendees.count({
                    where: {
                        eventId
                    }
                })
            ]);

            if(attendeeExists !== null){
                reply.status(404);

                throw new Error("This email is already registered for this event.");
            };

            if(event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees){
                reply.status(404);

                throw new Error("The event is already full of attendees.");
            };

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