const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports = { getUsers };
