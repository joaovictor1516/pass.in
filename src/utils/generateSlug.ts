export function generateSlug(text: string): string {
    //[\u0300-\u036f] e o limite da tabela unicode responsavel pela assentuacao
    return text.normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")
               .replace(/\s+/g, "")
               .toLowerCase();
}