const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVulnerabilities = async (req, res) => {
  try {
    const assetVulns = await prisma.assetVulnerability.findMany({
      include: {
        vulnerability: true,
        asset: true
      },
      orderBy: {
        risk_score: 'desc'
      }
    });

    res.json(assetVulns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching vulnerabilities', error: error.message });
  }
};

const updateVulnerability = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, due_date } = req.body;

    const currentVuln = await prisma.assetVulnerability.findUnique({ where: { id } });
    if (!currentVuln) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.assetVulnerability.update({
      where: { id },
      data: {
        status: status || currentVuln.status,
        assigned_to: assigned_to !== undefined ? assigned_to : currentVuln.assigned_to,
        due_date: due_date ? new Date(due_date) : currentVuln.due_date
      }
    });

    // Record history if status changed
    if (status && status !== currentVuln.status) {
      await prisma.remediationHistory.create({
        data: {
          asset_vuln_id: id,
          changed_by: req.user.id,
          old_status: currentVuln.status,
          new_status: status,
          notes: 'Status updated via dashboard'
        }
      });
    }

    res.json({ message: 'Updated successfully', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating vulnerability' });
  }
};

module.exports = { getVulnerabilities, updateVulnerability };
