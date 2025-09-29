const isKidFriendly = (content, threshold = 13) => {
  if (!content) return false;
  const raw = content.limit;
  const age = parseInt(typeof raw === 'string' ? raw.replace(/[^0-9]/g, '') : raw, 10);
  if (Number.isFinite(age)) {
    return age <= threshold;
  }
  return false;
};

module.exports = {
  isKidFriendly,
};

