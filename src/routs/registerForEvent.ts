import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import {  z } from "zod";

import { BadRequest } from "./_errors/badRequest";

export async function registerForEvent(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post("/events/:eventId/attendee", {
            schema: {
                summary: "Check all participant datas.",
                tags: ["event"],
                body: z.object({
                    name: z.string({invalid_type_error: "The attendee's name need be a text."}).min(5),
                    email: z.string({invalid_type_error: "The attendee's name need be a email type."}).email(),
                }),
                params: z.object({
                    eventId: z.string({invalid_type_error: "Invalid event identification."}).uuid()
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
                throw new BadRequest("This email is already registered for this event.");
            };

            if(event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees){
                throw new BadRequest("The event is already full of attendees.");
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