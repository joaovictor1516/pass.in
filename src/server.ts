import fastify from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "./utils/generateSlug";

const app = fastify();
const prisma = new PrismaClient({
    log:["query"]
});

//API -> Rest
//Protocolo HTTP -> É o protocolo responsável pela semantica do tipo da operacao feita na rota da api 
//Metodos HTTP -> GET, POST, PUT, DELET, PATCH, HEAD, OPTIONS, ...

//corpo da requisição (request body) => envio dos dados
//parametros de busca (search params) => http://localhost:3333/users?name=Joao (opcional, usado para filtros)
//parametros de rotas (routs params) => identificação de recursos  http://localhost:3333/users/5 (obrigatorio)
//cabeçalhos (headers) => contexto da requisição

app.post("/events", async (request, reply) => {
    const creatEventSchema = z.object({
        tittle: z.string().min(4),
        details: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
    });

    const {
        tittle,
        details,
        maximumAttendees
    } = creatEventSchema.parse(request.body); //verifica se os dados recebidos sao validos pelos campos de validacao criados no creatEventSchema.

    const slug = generateSlug(tittle);

    const eventWithSameSlug = await prisma.event.findUnique({
        where:{
            slug,
        }
    });

    if(eventWithSameSlug !== null){
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