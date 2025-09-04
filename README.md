# SparkBoard Hub - Sistema de Gestão Empresarial

![SparkBoard Hub](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

Um sistema completo de gestão empresarial desenvolvido com React, TypeScript, Node.js e MySQL. O SparkBoard Hub oferece funcionalidades abrangentes para gerenciamento de clientes, projetos, tarefas, vendas e muito mais.

## 🚀 Funcionalidades

### 📊 Dashboard Executivo
- Visão geral de métricas importantes
- Gráficos de vendas e performance
- Indicadores de produtividade
- Resumo de atividades recentes

### 👥 Gestão de Clientes (CRM)
- Cadastro completo de clientes
- Histórico de interações
- Segmentação de clientes
- Acompanhamento de relacionamento

### 📋 Gestão de Projetos
- Criação e acompanhamento de projetos
- Definição de marcos e entregas
- Controle de orçamento
- Timeline de execução

### ✅ Gestão de Tarefas
- Sistema Kanban integrado
- Atribuição de responsáveis
- Controle de prazos
- Priorização de atividades

### 💰 Gestão de Vendas
- Pipeline de vendas
- Controle de propostas
- Acompanhamento de deals
- Relatórios de performance

### 👤 Gestão de Usuários
- Sistema de autenticação
- Controle de permissões
- Perfis de usuário
- Logs de atividade

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.2.0** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento para SPA
- **Lucide React** - Ícones modernos
- **Recharts** - Biblioteca de gráficos

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM moderno
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Hash de senhas

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8.0+ instalado
- Git instalado

### 1. Clone o repositório
```bash
git clone https://github.com/coffeeassessoria/sparkboard-hub-crm.git
cd sparkboard-hub-crm
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/sparkboard_hub"

# Application Configuration
NODE_ENV="development"
PORT=3000
VITE_API_URL="http://localhost:3000"

# JWT Configuration (opcional)
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar as migrações
npx prisma migrate deploy

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm run preview
```

## 🌐 Deploy na Vercel

### 1. Conecte seu repositório GitHub à Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `sparkboard-hub-crm`

### 2. Configure as variáveis de ambiente na Vercel
No painel da Vercel, vá em Settings > Environment Variables e adicione:

```
DATABASE_URL=mysql://username:password@host:port/database
NODE_ENV=production
VITE_API_URL=https://your-app.vercel.app
JWT_SECRET=your-production-jwt-secret
```

### 3. Configure o banco de dados de produção
- Use um serviço como PlanetScale, Railway ou AWS RDS
- Execute as migrações no banco de produção:
```bash
npx prisma migrate deploy
```

### 4. Deploy automático
A Vercel fará o deploy automaticamente a cada push na branch `main`.

## 📁 Estrutura do Projeto

```
sparkboard-hub-crm/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   ├── types/              # Definições de tipos TypeScript
│   └── styles/             # Arquivos de estilo
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── migrations/         # Migrações do banco
├── public/                 # Arquivos estáticos
├── dist/                   # Build de produção
├── vercel.json            # Configuração da Vercel
└── package.json           # Dependências e scripts
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza o build de produção
npm run lint         # Executa o linter
npm run vercel-build # Build específico para Vercel
```

## 🗄️ Schema do Banco de Dados

O projeto utiliza as seguintes tabelas principais:

- **users** - Usuários do sistema
- **clients** - Clientes da empresa
- **projects** - Projetos em andamento
- **tasks** - Tarefas e atividades
- **deals** - Oportunidades de venda
- **companies** - Empresas clientes

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: coffeeassessoria@gmail.com
- GitHub Issues: [Criar Issue](https://github.com/coffeeassessoria/sparkboard-hub-crm/issues)

---

**Desenvolvido com ❤️ pela Coffee Assessoria**
