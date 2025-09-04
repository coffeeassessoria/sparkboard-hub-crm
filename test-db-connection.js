import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  console.log('📋 URL do banco:', process.env.DATABASE_URL || 'Não configurada');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurada no arquivo .env');
    console.log('\n📝 Configure a variável DATABASE_URL no arquivo .env:');
    console.log('DATABASE_URL="mysql://usuario:senha@host:porta/nome_do_banco"');
    process.exit(1);
  }

  try {
    // Criar conexão usando a URL do banco
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar uma query simples
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de teste executada:', rows[0]);
    
    // Verificar se as tabelas do Prisma existem
    try {
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `);
      
      console.log('\n📊 Tabelas encontradas no banco:');
      if (tables.length === 0) {
        console.log('⚠️  Nenhuma tabela encontrada. Execute "npx prisma db push" para criar as tabelas.');
      } else {
        tables.forEach(table => {
          console.log(`  - ${table.TABLE_NAME}`);
        });
      }
    } catch (error) {
      console.log('⚠️  Não foi possível listar as tabelas:', error.message);
    }
    
    await connection.end();
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error('📝 Código do erro:', error.code || 'N/A');
    console.error('📝 Mensagem:', error.message || 'Erro desconhecido');
    console.error('📝 Stack:', error.stack || 'N/A');
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Dicas para resolver (Host não encontrado):');
      console.log('  - Verifique se o host do banco está correto');
      console.log('  - Para desenvolvimento local, use "localhost" ou "127.0.0.1"');
      console.log('  - Para produção, use o host fornecido pelo provedor (ex: Hostinger)');
      console.log('  - Verifique sua conexão com a internet');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Dicas para resolver (Acesso negado):');
      console.log('  - Verifique o usuário e senha do banco');
      console.log('  - Verifique se o usuário tem permissões no banco');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Dicas para resolver (Banco não encontrado):');
      console.log('  - Verifique se o nome do banco de dados está correto');
      console.log('  - Verifique se o banco de dados existe');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dicas para resolver (Conexão recusada):');
      console.log('  - Verifique se o servidor MySQL está rodando');
      console.log('  - Verifique se a porta está correta (geralmente 3306)');
      console.log('  - Para desenvolvimento local, inicie o servidor MySQL');
    }
    
    console.log('\n🔧 Configuração atual:');
    console.log('  DATABASE_URL:', process.env.DATABASE_URL);
    
    process.exit(1);
  }
}

// Executar o teste
testDatabaseConnection();