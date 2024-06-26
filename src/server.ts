import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";

import { errorHandler } from "./errorHandler";

import { registerForEvent } from "./routs/registerForEvent";
import { getEventAttendees } from "./routs/getEventAttendees";
import { getAttendeeBadge } from "./routs/getAttendeeBadge";
import { creatEvent } from "./routs/createEvents";
import { getEvent } from "./routs/getEvent";
import { checkIn } from "./routs/checkIn";

const app = fastify();

app.register(fastifySwagger, {
    swagger: {
        consumes: ["application/json"],
        produces: ["aplication/json"],
        info: {
            title: "pass.in",
            description: "API da aplicação pass.in criada durante a NLW Unit.",
            version: "1.0.0"
        }
    },
    transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs"
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(getEventAttendees);
app.register(getAttendeeBadge);
app.register(registerForEvent);
app.register(creatEvent);
app.register(getEvent);
app.register(checkIn);

app.setErrorHandler(errorHandler);

app.listen({port: 3333}).then(() => {
    console.log("HTTP server running");
});