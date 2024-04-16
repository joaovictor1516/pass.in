import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import fastify from "fastify";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.listen({port: 3333}).then(() => {
    console.log("HTTP server running");
});