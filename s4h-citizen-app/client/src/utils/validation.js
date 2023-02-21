export const patterns = {
  email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
};

export const isEmail = email => new RegExp(patterns.email, 'i').test(email);

export const isBlank = str => !str || /^\s*$/.test(str);
