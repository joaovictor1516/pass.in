import fastify from "fastify";

const app = fastify();

//API -> Rest
//Protocolo HTTP -> É o protocolo responsável pela semantica do tipo da operacao feita na rota da api 
//Metodos HTTP -> GET, POST, PUT, DELET, PATCH, HEAD, OPTIONS, ...

//corpo da requisição (request body) => envio dos dados
//parametros de busca (search params) => http://localhost:3333/users?name=Joao (opcional, usado para filtros)
//parametros de rotas (routs params) => identificação de recursos  http://localhost:3333/users/5 (obrigatorio)
//cabeçalhos (headers) => contexto da requisição



app.get("/", () => {
    return "Ola mundo";
});

app.listen({port: 3333}).then(() => {
    console.log("HTTP server running");
});