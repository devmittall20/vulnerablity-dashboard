const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function promoteToAdmin() {
  const users = await p.user.findMany();
  console.log('Current users:', JSON.stringify(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })), null, 2));
  
  if (users.length > 0) {
    const updated = await p.user.update({
      where: { id: users[0].id },
      data: { role: 'ADMIN' }
    });
    console.log('\n✅ Promoted to ADMIN:', updated.name, '(' + updated.email + ')');
  }
  
  await p.$disconnect();
}

promoteToAdmin().catch(console.error);
