export const sanitizeInput = (input) => {
  try {
    if (input === null || input === undefined) return '';
    if (typeof input !== 'string') return String(input);
    
    return input.replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replaceAll(/javascript:/gi, '')
                .replaceAll(/on\w+=/gi, '')
                .replaceAll(/[<>"'&]/g, (match) => {
                  const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
                  return entities[match];
                })
                .trim();
  } catch (error) {
    console.error('Error sanitizing input:', error);
    return '';
  }
};

export const validateEmail = (email) => {
  try {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
};

export const validatePassword = (password) => {
  try {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
};

export const sanitizeRequestBody = (req, res, next) => {
  try {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      }
    }
    next();
  } catch (error) {
    console.error('Error sanitizing request body:', error);
    res.status(500).json({ error: 'Request processing failed' });
  }
};