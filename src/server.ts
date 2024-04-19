import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { registerForEvent } from "./routs/registerForEvent";
import { creatEvent } from "./routs/createEvents";
import fastify from "fastify";
import { getEvent } from "./routs/getEvent";
import { getAttendeeBadge } from "./routs/getAttendeeBadge";
import { checkIn } from "./routs/checkIn";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(checkIn);
app.register(getEvent);
app.register(creatEvent);
app.register(getAttendeeBadge);
app.register(registerForEvent);

app.listen({port: 3333}).then(() => {
    console.log("HTTP server running");
});