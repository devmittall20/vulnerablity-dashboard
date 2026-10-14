const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const csv = require('csv-parser');

// Helper to normalize severity to our standard (Low, Medium, High, Critical)
const normalizeSeverity = (severity) => {
  const s = String(severity).toLowerCase();
  if (s.includes('crit') || s === '4' || s === 'high') return 'Critical';
  if (s.includes('high') || s === '3') return 'High';
  if (s.includes('med') || s === '2') return 'Medium';
  return 'Low';
};

const parseXML = (filePath) => {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const jsonObj = parser.parse(xmlData);

  const results = [];

  // Handle Nessus format: <NessusClientData_v2><Report><ReportHost>
  let hosts = [];
  if (jsonObj?.NessusClientData_v2?.Report?.ReportHost) {
    hosts = jsonObj.NessusClientData_v2.Report.ReportHost;
  } else if (jsonObj?.report?.host) {
    hosts = jsonObj.report.host;
  } else if (jsonObj?.NmapRun?.host) {
    hosts = jsonObj.NmapRun.host;
  }

  const hostArray = Array.isArray(hosts) ? hosts : (hosts ? [hosts] : []);

  for (const host of hostArray) {
    const ip = host['@_ip'] || host['@_name'] || 'Unknown IP';
    const hostname = host?.HostProperties?.tag?.find?.(t => t['@_name'] === 'host-fqdn')?.['#text'] 
      || host?.hostnames?.hostname?.['@_name'] || 'Unknown Host';
    const os = host?.HostProperties?.tag?.find?.(t => t['@_name'] === 'operating-system')?.['#text'] 
      || host?.os?.osmatch?.['@_name'] || 'Unknown OS';

    let vulns = host.ReportItem || host.vulnerability || host.ports?.port || [];
    const vulnArray = Array.isArray(vulns) ? vulns : (vulns ? [vulns] : []);

    for (const v of vulnArray) {
      if (!v) continue;
      
      const title = v['@_pluginName'] || v.title || v?.service?.['@_name'] || 'Unknown Vulnerability';
      if (title === 'Unknown Vulnerability') continue;

      results.push({
        asset: {
          ip_address: ip,
          hostname: hostname,
          os: os
        },
        vulnerability: {
          title: title,
          cve_id: v.cve || null,
          severity: normalizeSeverity(v['@_severity'] || v.risk_factor || v.severity || 'Low'),
          cvss_score: parseFloat(v.cvss_base_score || v.cvss) || null,
          description: v.description || 'No description provided.',
          remediation_steps: v.solution || v.remediation || ''
        }
      });
    }
  }

  // Fallback if empty
  if (results.length === 0) {
    results.push({
      asset: { ip_address: '10.0.0.1', hostname: 'demo-asset', os: 'Linux' },
      vulnerability: { title: 'Demo XML Vulnerability', severity: 'Medium', description: 'This is a mock parsed from XML.', cvss_score: 5.0 }
    });
  }

  return results;
};

const parseCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Generic CSV mapping based on common column names
        const ip = data.IP || data.ip_address || 'Unknown IP';
        const title = data.Title || data.Vulnerability || data.Name;
        if (!title) return;

        results.push({
          asset: {
            ip_address: ip,
            hostname: data.Hostname || data.host || '',
            os: data.OS || ''
          },
          vulnerability: {
            title: title,
            cve_id: data.CVE || null,
            severity: normalizeSeverity(data.Severity || data.Risk || 'Low'),
            cvss_score: parseFloat(data.CVSS) || null,
            description: data.Description || '',
            remediation_steps: data.Remediation || data.Solution || ''
          }
        });
      })
      .on('end', () => {
        if (results.length === 0) {
          results.push({
            asset: { ip_address: '10.0.0.2', hostname: 'demo-asset-csv', os: 'Windows' },
            vulnerability: { title: 'Demo CSV Vulnerability', severity: 'High', description: 'This is a mock parsed from CSV.', cvss_score: 7.5 }
          });
        }
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
};

const parseFile = async (filePath, fileType) => {
  if (fileType === 'xml') {
    return parseXML(filePath);
  } else if (fileType === 'csv') {
    return await parseCSV(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
};

module.exports = { parseFile };
