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
    count: (total: number) => (total === 1 ? "1 tarefa" : `${total} tarefas`),
    empty: "Nenhuma tarefa cadastrada ainda. Que tal criar a primeira?",
  },
  taskItem: {
    createdAt: (date: string) => `Criada em ${date}`,
    edit: "Editar",
    delete: "Excluir",
    deleting: "Excluindo...",
    confirmDelete: (title: string) => `Deseja excluir a tarefa "${title}"?`,
    deleted: (title: string) => `Tarefa "${title}" excluída com sucesso!`,
    completed: "Concluída",
    markedCompleted: (title: string) => `Tarefa "${title}" marcada como concluída!`,
    reopened: (title: string) => `Tarefa "${title}" reaberta!`,
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
    created: (title: string) => `Tarefa "${title}" criada com sucesso!`,
    updated: (title: string) => `Tarefa "${title}" atualizada com sucesso!`,
  },
  toast: {
    close: "Fechar mensagem",
  },
  notFound: {
    heading: "Não encontrado",
    message: "A tarefa ou página que você procura não existe.",
    back: "Voltar para a lista de tarefas",
  },
  errorPage: {
    heading: "Algo deu errado",
    message: "Ocorreu um erro inesperado ao carregar esta página.",
    retry: "Tentar novamente",
  },
  errors: {
    titleRequired: "O título é obrigatório",
    titleTooLong: "O título deve ter no máximo 100 caracteres",
    descriptionInvalid: "A descrição deve ser um texto",
    descriptionTooLong: "A descrição deve ter no máximo 500 caracteres",
    invalidId: "ID de tarefa inválido",
    completedInvalid: "O status de conclusão deve ser verdadeiro ou falso",
    taskCompleted: "Tarefas concluídas não podem ser editadas. Reabra a tarefa para editá-la.",
    taskNotFound: "Tarefa não encontrada. Ela pode ter sido excluída.",
    unexpected: "Ocorreu um erro inesperado no servidor. Tente novamente em instantes.",
    network: "Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.",
  },
};

export type Dictionary = typeof ptBR;
