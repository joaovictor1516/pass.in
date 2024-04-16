import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { generateSlug } from "./utils/generateSlug";
import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from "zod";

const app = fastify();
const prisma = new PrismaClient({
    log:["query"]
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

//API -> Rest
//Protocolo HTTP -> É o protocolo responsável pela semantica do tipo da operacao feita na rota da api 
//Metodos HTTP -> GET, POST, PUT, DELET, PATCH, HEAD, OPTIONS, ...

//corpo da requisição (request body) => envio dos dados
//parametros de busca (search params) => http://localhost:3333/users?name=Joao (opcional, usado para filtros)
//parametros de rotas (routs params) => identificação de recursos  http://localhost:3333/users/5 (obrigatorio)
//cabeçalhos (headers) => contexto da requisição

app
    .withTypeProvider<ZodTypeProvider>()
    .post("/events", {
        schema: {
            body: z.object({
                tittle: z.string().min(4),
                details: z.string().nullable(),
                maximumAttendees: z.number().int().positive().nullable()
            }),
            response: {
                201: z.object({
                    eventId: z.string().uuid()
                })
            }
        } //faz o parse automaticamente, logo tudo o que estiver incluido no schema sera validado automaticamente pelo fastify.
         //tambem e validada a resposta (response).
    }, async (request, reply) => {
        const {
            tittle,
            details,
            maximumAttendees
        } = (request.body);

        const slug = generateSlug(tittle);

        const eventWithSameSlug = await prisma.event.findUnique({
            where:{
                slug,
            }
        });

        if(eventWithSameSlug !== null){
            reply.status(404);

            throw new Error("Already exist a event with this title.");
        };

        const event = await prisma.event.create({
            data:{
                tittle,
                details,
                maximumAttendees,
                slug,
            }
        });

        return reply.status(201).send({eventId: event.id});
});

app.listen({port: 3333}).then(() => {
    console.log("HTTP server running");
});