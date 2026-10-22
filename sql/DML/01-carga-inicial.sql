USE CafeteriaCampus;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Perfiles WHERE Nombre = N'Administrador')
BEGIN
    INSERT INTO dbo.Perfiles (Nombre) VALUES (N'Administrador');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Perfiles WHERE Nombre = N'Cliente')
BEGIN
    INSERT INTO dbo.Perfiles (Nombre) VALUES (N'Cliente');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = N'ana@cafeteria.test')
BEGIN
    INSERT INTO dbo.Usuarios (Nombre, Apellido, Email, Telefono, PasswordHash, PerfilId)
    VALUES (
        N'Ana',
        N'Rojas',
        N'ana@cafeteria.test',
        N'999111222',
        N'$2b$10$QCOnQH9YA5lg4ecEELGfEuzOwNvwO9mkwg1HpDInZw6Z7K3P869hy',
        (SELECT PerfilId FROM dbo.Perfiles WHERE Nombre = N'Administrador')
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = N'luis@cafeteria.test')
BEGIN
    INSERT INTO dbo.Usuarios (Nombre, Apellido, Email, Telefono, PasswordHash, PerfilId)
    VALUES (
        N'Luis',
        N'Paredes',
        N'luis@cafeteria.test',
        N'999333444',
        N'$2b$10$HBXjOfA/zkPgUK1ocXi5AeDqJHWOaOtjHacpnpKTctVAPlLtZhilu',
        (SELECT PerfilId FROM dbo.Perfiles WHERE Nombre = N'Cliente')
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Productos WHERE Nombre = N'Café americano')
BEGIN
    INSERT INTO dbo.Productos (Nombre, Precio, Stock, Descripcion)
    VALUES (N'Café americano', 5.00, 20, N'Taza de 12 onzas');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Productos WHERE Nombre = N'Sándwich de pollo')
BEGIN
    INSERT INTO dbo.Productos (Nombre, Precio, Stock, Descripcion)
    VALUES (N'Sándwich de pollo', 12.50, 8, NULL);
END
GO

DECLARE @UsuarioId INT;
DECLARE @ProductoId INT;
DECLARE @PedidoId INT;
DECLARE @Codigo INT;
DECLARE @StockAntes INT;

SELECT @UsuarioId = UsuarioId FROM dbo.Usuarios WHERE Email = N'luis@cafeteria.test';
SELECT @ProductoId = ProductoId, @StockAntes = Stock FROM dbo.Productos WHERE Nombre = N'Café americano';

IF NOT EXISTS (SELECT 1 FROM dbo.Pedidos)
BEGIN
    EXEC dbo.sp_registrar_pedido
        @UsuarioId = @UsuarioId,
        @ProductoId = @ProductoId,
        @Cantidad = 2,
        @PedidoId = @PedidoId OUTPUT,
        @Codigo = @Codigo OUTPUT;
END
GO
