IF DB_ID(N'CafeteriaCampus') IS NULL
BEGIN
    CREATE DATABASE CafeteriaCampus;
END
GO

USE CafeteriaCampus;
GO

IF OBJECT_ID(N'dbo.Pedidos', N'U') IS NOT NULL DROP TABLE dbo.Pedidos;
IF OBJECT_ID(N'dbo.Productos', N'U') IS NOT NULL DROP TABLE dbo.Productos;
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID(N'dbo.Perfiles', N'U') IS NOT NULL DROP TABLE dbo.Perfiles;
GO

CREATE TABLE dbo.Perfiles
(
    PerfilId INT IDENTITY(1, 1) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_Perfiles PRIMARY KEY (PerfilId),
    CONSTRAINT UQ_Perfiles_Nombre UNIQUE (Nombre)
);
GO

CREATE TABLE dbo.Usuarios
(
    UsuarioId INT IDENTITY(1, 1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Telefono NVARCHAR(30) NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    PerfilId INT NOT NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT (1),
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT (SYSUTCDATETIME()),
    FechaActualizacion DATETIME2 NULL,
    CONSTRAINT PK_Usuarios PRIMARY KEY (UsuarioId),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email),
    CONSTRAINT FK_Usuarios_Perfiles FOREIGN KEY (PerfilId) REFERENCES dbo.Perfiles (PerfilId)
);
GO

CREATE TABLE dbo.Productos
(
    ProductoId INT IDENTITY(1, 1) NOT NULL,
    Nombre NVARCHAR(120) NOT NULL,
    Precio DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL,
    Descripcion NVARCHAR(500) NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Productos_Activo DEFAULT (1),
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Productos_FechaCreacion DEFAULT (SYSUTCDATETIME()),
    FechaActualizacion DATETIME2 NULL,
    CONSTRAINT PK_Productos PRIMARY KEY (ProductoId),
    CONSTRAINT CK_Productos_Precio CHECK (Precio > 0),
    CONSTRAINT CK_Productos_Stock CHECK (Stock >= 0)
);
GO

CREATE TABLE dbo.Pedidos
(
    PedidoId INT IDENTITY(1, 1) NOT NULL,
    UsuarioId INT NOT NULL,
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10, 2) NOT NULL,
    Estado NVARCHAR(20) NOT NULL CONSTRAINT DF_Pedidos_Estado DEFAULT (N'CONFIRMADO'),
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Pedidos_FechaCreacion DEFAULT (SYSUTCDATETIME()),
    FechaActualizacion DATETIME2 NULL,
    CONSTRAINT PK_Pedidos PRIMARY KEY (PedidoId),
    CONSTRAINT FK_Pedidos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios (UsuarioId),
    CONSTRAINT FK_Pedidos_Productos FOREIGN KEY (ProductoId) REFERENCES dbo.Productos (ProductoId),
    CONSTRAINT CK_Pedidos_Estado CHECK (Estado IN (N'CONFIRMADO', N'CANCELADO')),
    CONSTRAINT CK_Pedidos_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_Pedidos_PrecioUnitario CHECK (PrecioUnitario > 0)
);
GO
