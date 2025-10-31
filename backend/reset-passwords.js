const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clickbeard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function resetPasswords() {
  try {
    console.log('Conectando ao banco de dados...');

    // Gerar hash para "password123"
    const password = 'password123';
    console.log(`\nGerando hash bcrypt para senha: "${password}"`);
    const hash = await bcrypt.hash(password, 10);
    console.log(`Hash gerado: ${hash}`);

    // Atualizar senhas dos usuários de teste
    console.log('\nAtualizando senhas dos usuários de teste...');

    const users = [
      'admin@clickbeard.com',
      'joao@email.com',
      'maria@email.com',
      'pedro@email.com'
    ];

    for (const email of users) {
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, name',
        [hash, email]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Senha atualizada para: ${result.rows[0].name} (${result.rows[0].email})`);
      } else {
        console.log(`✗ Usuário não encontrado: ${email}`);
      }
    }

    console.log('\n✓ Senhas resetadas com sucesso!');
    console.log(`\nTodos os usuários agora podem fazer login com a senha: "${password}"`);

    // Testar se o hash funciona
    console.log('\nTestando validação do hash...');
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Validação: ${isValid ? '✓ SUCESSO' : '✗ FALHOU'}`);

  } catch (error) {
    console.error('Erro ao resetar senhas:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

resetPasswords();
