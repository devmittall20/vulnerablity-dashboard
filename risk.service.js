const calculateRiskScore = (cvssScore, criticality, exposure) => {
  const baseScore = cvssScore || 5.0; // Fallback to 5.0 if no CVSS

  let criticalityMultiplier = 1.0;
  if (criticality === 'Critical') criticalityMultiplier = 1.5;
  else if (criticality === 'High') criticalityMultiplier = 1.2;
  else if (criticality === 'Low') criticalityMultiplier = 0.8;

  let exposureMultiplier = 1.0;
  if (exposure === 'External') exposureMultiplier = 1.2;

  // Calculate final score and cap it at 10.0
  let score = baseScore * criticalityMultiplier * exposureMultiplier;
  return Math.min(parseFloat(score.toFixed(2)), 10.0);
};

const getSeverityFromCVSS = (cvssScore) => {
  if (!cvssScore) return 'Low';
  if (cvssScore >= 9.0) return 'Critical';
  if (cvssScore >= 7.0) return 'High';
  if (cvssScore >= 4.0) return 'Medium';
  return 'Low';
};

// Simple rule engine to mock compliance tags based on description keywords
const generateTags = (description) => {
  const tags = [];
  const descLower = description.toLowerCase();
  
  if (descLower.includes('sql injection') || descLower.includes('xss') || descLower.includes('cross-site')) {
    tags.push('OWASP-Top10', 'PCI-DSS');
  }
  if (descLower.includes('password') || descLower.includes('authentication') || descLower.includes('credential')) {
    tags.push('ISO-27001');
  }
  
  return tags.length > 0 ? tags.join(', ') : null;
};

module.exports = { calculateRiskScore, getSeverityFromCVSS, generateTags };
