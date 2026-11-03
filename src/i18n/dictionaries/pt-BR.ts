export const ptBR = {
  metadata: {
    title: "Gerenciador de Tarefas",
    description: "Gerenciamento de tarefas com Next.js 15 e tRPC",
  },
  languageSwitcher: {
    label: "Idioma",
  },
  taskList: {
    heading: "Tarefas",
    newTask: "Nova tarefa",
    empty: "Nenhuma tarefa cadastrada ainda. Que tal criar a primeira?",
    created: "Tarefa criada com sucesso!",
    updated: "Tarefa atualizada com sucesso!",
  },
  taskItem: {
    createdAt: (date: string) => `Criada em ${date}`,
    edit: "Editar",
    delete: "Excluir",
    deleting: "Excluindo...",
    confirmDelete: (title: string) => `Deseja excluir a tarefa "${title}"?`,
    deleted: (title: string) => `Tarefa "${title}" excluída com sucesso!`,
  },
  taskForm: {
    createHeading: "Nova tarefa",
    editHeading: "Editar tarefa",
    title: "Título",
    titlePlaceholder: "Ex.: Estudar tRPC",
    description: "Descrição",
    optional: "(opcional)",
    cancel: "Cancelar",
    create: "Criar tarefa",
    save: "Salvar alterações",
    saving: "Salvando...",
  },
  feedback: {
    close: "Fechar mensagem",
  },
  notFound: {
    heading: "Não encontrado",
    message: "A tarefa ou página que você procura não existe.",
    back: "Voltar para a lista de tarefas",
  },
  errorPage: {
    message: "Ocorreu um erro inesperado ao carregar esta página.",
    retry: "Tentar novamente",
  },
  errors: {
    titleRequired: "O título é obrigatório",
    titleTooLong: "O título deve ter no máximo 100 caracteres",
    descriptionInvalid: "A descrição deve ser um texto",
    descriptionTooLong: "A descrição deve ter no máximo 500 caracteres",
    invalidId: "ID de tarefa inválido",
    taskNotFound: "Tarefa não encontrada. Ela pode ter sido excluída.",
    network: "Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.",
  },
};

export type Dictionary = typeof ptBR;
