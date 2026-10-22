const { SqlError } = require('../enums/sqlError');

const erroresClaveDuplicada = [
  SqlError.ViolacionRestriccionUnica,
  SqlError.ViolacionIndiceUnico,
  SqlError.SentenciaCancelada
];

class AppError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.mensaje = mensaje;
    this.detalles = detalles;
  }
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function errorNumbers(error) {
  if (!error) return [];
  const numbers = [];
  if (typeof error.number === 'number') numbers.push(error.number);
  if (error.originalError && typeof error.originalError.code === 'number') {
    numbers.push(error.originalError.code);
  }
  if (Array.isArray(error.precedingErrors)) {
    for (const previous of error.precedingErrors) {
      numbers.push(...errorNumbers(previous));
    }
  }
  return numbers;
}

function isDuplicateKey(error) {
  const numbers = errorNumbers(error);
  if (erroresClaveDuplicada.some((codigo) => numbers.includes(codigo))) return true;
  const messages = [error && error.message];
  if (error && Array.isArray(error.precedingErrors)) {
    for (const previous of error.precedingErrors) messages.push(previous.message);
  }
  return /unique|duplicate key|UQ_Usuarios_Email/i.test(messages.filter(Boolean).join(' '));
}

module.exports = { AppError, parseId, isDuplicateKey };
