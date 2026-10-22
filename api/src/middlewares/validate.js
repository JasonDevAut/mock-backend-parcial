function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function requiredText(name, label) {
  return {
    name,
    check(value) {
      if (isBlank(value)) return `${label} es obligatorio`;
      return null;
    }
  };
}

function optionalText(name) {
  return {
    name,
    check(value) {
      if (value === undefined || value === null || value === '') return null;
      if (typeof value !== 'string') return `${name} debe ser texto`;
      return null;
    }
  };
}

const emailField = {
  name: 'email',
  check(value) {
    if (isBlank(value)) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'El correo no es válido';
    return null;
  }
};

function passwordField(required) {
  return {
    name: 'password',
    check(value) {
      if (value === undefined || value === null || value === '') {
        return required ? 'La contraseña es obligatoria' : null;
      }
      if (typeof value !== 'string' || value.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      return null;
    }
  };
}

function perfilField() {
  return {
    name: 'perfil',
    check(value) {
      if (value === undefined || value === null || value === '') return null;
      if (value !== 'Administrador' && value !== 'Cliente') {
        return 'El perfil debe ser Administrador o Cliente';
      }
      return null;
    }
  };
}

function positiveDecimal(name, label) {
  return {
    name,
    check(value) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return `${label} debe ser un número mayor que cero`;
      }
      return null;
    }
  };
}

function stockField() {
  return {
    name: 'stock',
    check(value) {
      if (!Number.isInteger(value) || value < 0) {
        return 'El stock debe ser un entero mayor o igual que cero';
      }
      return null;
    }
  };
}

function positiveInt(name) {
  return {
    name,
    check(value) {
      if (!Number.isInteger(value) || value < 1) {
        return `${name} debe ser un entero mayor que cero`;
      }
      return null;
    }
  };
}

function usuarioSchema(options = {}) {
  const password = options.password || 'required';
  const fields = [
    requiredText('nombre', 'El nombre'),
    requiredText('apellido', 'El apellido'),
    emailField,
    optionalText('telefono'),
    perfilField()
  ];
  if (password === 'required') fields.push(passwordField(true));
  if (password === 'optional') fields.push(passwordField(false));
  return fields;
}

function loginSchema() {
  return [emailField, passwordField(true)];
}

function productoSchema() {
  return [
    requiredText('nombre', 'El nombre'),
    positiveDecimal('precio', 'El precio'),
    stockField(),
    optionalText('descripcion')
  ];
}

function pedidoSchema() {
  return [
    positiveInt('usuarioId'),
    positiveInt('productoId'),
    positiveInt('cantidad')
  ];
}

function comentarioSchema() {
  return [
    {
      name: 'texto',
      check(value) {
        if (isBlank(value)) return 'El texto es obligatorio';
        return null;
      }
    }
  ];
}

function validate(schema) {
  return function validationMiddleware(req, res, next) {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const detalles = [];

    for (const field of schema) {
      const mensaje = field.check(body[field.name], body);
      if (mensaje) detalles.push({ campo: field.name, mensaje });
    }

    if (detalles.length > 0) {
      const mensaje = 'Datos inválidos';
      res.locals.detalleLog = {
        mensaje,
        descripcion: detalles.map((detalle) => `${detalle.campo}: ${detalle.mensaje}`).join('; ')
      };
      res.status(400).json({
        error: {
          mensaje,
          detalles
        }
      });
      return;
    }

    next();
  };
}

module.exports = {
  validate,
  usuarioSchema,
  loginSchema,
  productoSchema,
  pedidoSchema,
  comentarioSchema
};
