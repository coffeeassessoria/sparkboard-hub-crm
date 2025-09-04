# Guia de Deploy - SparkBoard Hub

## Pré-requisitos

### 1. Configuração do Banco de Dados MySQL na Hostinger

1. Acesse o painel de controle da Hostinger
2. Vá para "Bancos de Dados" > "MySQL"
3. Crie um novo banco de dados:
   - Nome do banco: `sparkboard_db`
   - Usuário: `sparkboard_user`
   - Senha: (gere uma senha segura)
4. Anote as informações de conexão:
   - Host: (fornecido pela Hostinger)
   - Porta: 3306
   - Nome do banco, usuário e senha

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configuração do Banco de Dados - PRODUÇÃO HOSTINGER
DATABASE_URL="mysql://sparkboard_user:SUA_SENHA@SEU_HOST:3306/sparkboard_db"

# Configuração do Prisma
PRISMA_GENERATE_DATAPROXY="true"

# Configurações de Produção
NODE_ENV="production"
VITE_API_URL="https://seudominio.com"
```

**Importante:** Substitua `SUA_SENHA`, `SEU_HOST` e `seudominio.com` pelos valores reais fornecidos pela Hostinger.

## Processo de Deploy

### Passo 1: Preparação do Banco de Dados

1. Execute as migrações do Prisma:
```bash
npx prisma migrate deploy
```

2. Gere o cliente Prisma:
```bash
npx prisma generate
```

### Passo 2: Build de Produção

1. Instale as dependências:
```bash
npm install
```

2. Gere o build de produção:
```bash
npm run build
```

### Passo 3: Upload dos Arquivos

#### Opção A: Via File Manager da Hostinger

1. Acesse o File Manager no painel da Hostinger
2. Navegue até a pasta `public_html` (ou pasta do seu domínio)
3. Faça upload de todos os arquivos da pasta `dist/`:
   - `index.html`
   - Pasta `assets/` com todos os arquivos CSS e JS
   - Qualquer outro arquivo gerado no build

#### Opção B: Via FTP/SFTP

1. Use um cliente FTP como FileZilla
2. Conecte-se usando as credenciais FTP da Hostinger
3. Faça upload dos arquivos da pasta `dist/` para `public_html/`

### Passo 4: Configuração do Servidor Web

#### Para Single Page Application (SPA)

Crie um arquivo `.htaccess` na pasta `public_html/` com o seguinte conteúdo:

```apache
RewriteEngine On
RewriteBase /

# Handle Angular and Vue.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Verificação do Deploy

### 1. Teste de Conectividade

1. Acesse seu domínio no navegador
2. Verifique se a aplicação carrega corretamente
3. Teste o login com as credenciais padrão:
   - Email: `admin@sparkboard.com`
   - Senha: `admin123`

### 2. Teste das Funcionalidades

1. **Dashboard**: Verifique se as métricas são carregadas
2. **Clientes**: Teste criação, edição e listagem
3. **Projetos**: Teste todas as operações CRUD
4. **Tarefas**: Verifique o kanban e operações
5. **Deals**: Teste o pipeline de vendas

### 3. Monitoramento

- Verifique os logs de erro no painel da Hostinger
- Monitore a performance da aplicação
- Teste em diferentes dispositivos e navegadores

## Solução de Problemas Comuns

### Erro de Conexão com Banco de Dados

1. Verifique se as credenciais no `.env` estão corretas
2. Confirme se o banco de dados foi criado na Hostinger
3. Teste a conexão usando um cliente MySQL

### Páginas não Carregam (404)

1. Verifique se o arquivo `.htaccess` foi criado corretamente
2. Confirme se todos os arquivos da pasta `dist/` foram enviados
3. Verifique as permissões dos arquivos (644 para arquivos, 755 para pastas)

### Performance Lenta

1. Ative a compressão gzip no servidor
2. Configure cache adequadamente
3. Otimize imagens e assets

### Erro de CORS

1. Configure os headers CORS no `.htaccess`
2. Verifique se a URL da API está correta no `.env`

## Manutenção

### Atualizações

1. Para atualizações, repita os passos 2 e 3
2. Sempre faça backup antes de atualizar
3. Teste em ambiente de desenvolvimento primeiro

### Backup

1. **Banco de Dados**: Use o phpMyAdmin da Hostinger para exportar
2. **Arquivos**: Faça download regular dos arquivos via FTP
3. **Código**: Mantenha o código versionado no Git

### Monitoramento Contínuo

1. Configure alertas de uptime
2. Monitore logs de erro regularmente
3. Verifique performance periodicamente
4. Mantenha backups atualizados

## Contatos de Suporte

- **Hostinger**: Suporte via chat ou ticket
- **Documentação Prisma**: https://www.prisma.io/docs
- **Documentação Vite**: https://vitejs.dev/guide

---

**Nota**: Este guia assume o uso da Hostinger como provedor de hospedagem. Para outros provedores, adapte as instruções conforme necessário.