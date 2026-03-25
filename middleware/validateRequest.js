const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone?.replace(/\D/g, '') || '');
const validateDate = (date) => !isNaN(new Date(date).getTime());

module.exports = (schema) => (req, res, next) => {
  const { email, phone, date, password } = req.body;
  
  if (email && !validateEmail(email)) 
    return res.status(400).json({ error: 'Invalid email format' });
  if (phone && !validatePhone(phone)) 
    return res.status(400).json({ error: 'Invalid phone (10 digits)' });
  if (date && !validateDate(date)) 
    return res.status(400).json({ error: 'Invalid date format' });
  if (password && password.length < 8) 
    return res.status(400).json({ error: 'Password must be 8+ chars' });
  
  next();
};