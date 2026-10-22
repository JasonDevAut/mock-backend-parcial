USE CafeteriaCampus;
GO

CREATE OR ALTER PROCEDURE dbo.sp_insertar_usuario
    @Nombre NVARCHAR(100),
    @Apellido NVARCHAR(100),
    @Email NVARCHAR(255),
    @Telefono NVARCHAR(30),
    @PasswordHash NVARCHAR(255),
    @Perfil NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PerfilId INT;
    SELECT @PerfilId = PerfilId FROM dbo.Perfiles WHERE Nombre = @Perfil;
    IF @PerfilId IS NULL
    BEGIN
        THROW 50001, 'El perfil no existe', 1;
    END

    INSERT INTO dbo.Usuarios (Nombre, Apellido, Email, Telefono, PasswordHash, PerfilId)
    VALUES (@Nombre, @Apellido, @Email, @Telefono, @PasswordHash, @PerfilId);

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    WHERE u.UsuarioId = CONVERT(INT, SCOPE_IDENTITY());
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_actualizar_usuario
    @UsuarioId INT,
    @Nombre NVARCHAR(100),
    @Apellido NVARCHAR(100),
    @Email NVARCHAR(255),
    @Telefono NVARCHAR(30),
    @PasswordHash NVARCHAR(255),
    @Perfil NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE UsuarioId = @UsuarioId)
    BEGIN
        RETURN;
    END

    DECLARE @PerfilId INT = NULL;
    IF @Perfil IS NOT NULL
    BEGIN
        SELECT @PerfilId = PerfilId FROM dbo.Perfiles WHERE Nombre = @Perfil;
        IF @PerfilId IS NULL
        BEGIN
            THROW 50001, 'El perfil no existe', 1;
        END
    END

    UPDATE dbo.Usuarios
    SET
        Nombre = @Nombre,
        Apellido = @Apellido,
        Email = @Email,
        Telefono = @Telefono,
        PasswordHash = COALESCE(@PasswordHash, PasswordHash),
        PerfilId = COALESCE(@PerfilId, PerfilId),
        FechaActualizacion = SYSUTCDATETIME()
    WHERE UsuarioId = @UsuarioId;

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    WHERE u.UsuarioId = @UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_desactivar_usuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuarios
    SET Activo = 0, FechaActualizacion = SYSUTCDATETIME()
    WHERE UsuarioId = @UsuarioId;

    IF @@ROWCOUNT = 0
    BEGIN
        RETURN;
    END

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    WHERE u.UsuarioId = @UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_buscar_usuario_por_email
    @Email NVARCHAR(255),
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT UsuarioId
    FROM dbo.Usuarios
    WHERE Email = @Email
      AND (@UsuarioId IS NULL OR UsuarioId <> @UsuarioId);
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_listar_usuarios
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    ORDER BY u.UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_obtener_usuario_por_email
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        u.PasswordHash,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    WHERE u.Email = @Email;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_obtener_usuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Telefono,
        p.Nombre AS Perfil,
        u.Activo,
        u.FechaActualizacion
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Perfiles AS p ON p.PerfilId = u.PerfilId
    WHERE u.UsuarioId = @UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_insertar_producto
    @Nombre NVARCHAR(120),
    @Precio DECIMAL(10, 2),
    @Stock INT,
    @Descripcion NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Productos (Nombre, Precio, Stock, Descripcion)
    VALUES (@Nombre, @Precio, @Stock, @Descripcion);

    SELECT
        ProductoId,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Activo,
        FechaActualizacion
    FROM dbo.Productos
    WHERE ProductoId = CONVERT(INT, SCOPE_IDENTITY());
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_actualizar_producto
    @ProductoId INT,
    @Nombre NVARCHAR(120),
    @Precio DECIMAL(10, 2),
    @Stock INT,
    @Descripcion NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
            WHERE ProductoId = @ProductoId
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE dbo.Productos
        SET
            Nombre = @Nombre,
            Precio = @Precio,
            Stock = @Stock,
            Descripcion = @Descripcion,
            FechaActualizacion = SYSUTCDATETIME()
        WHERE ProductoId = @ProductoId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH

    SELECT
        ProductoId,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Activo,
        FechaActualizacion
    FROM dbo.Productos
    WHERE ProductoId = @ProductoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_desactivar_producto
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Productos
    SET Activo = 0, FechaActualizacion = SYSUTCDATETIME()
    WHERE ProductoId = @ProductoId;

    IF @@ROWCOUNT = 0
    BEGIN
        RETURN;
    END

    SELECT
        ProductoId,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Activo,
        FechaActualizacion
    FROM dbo.Productos
    WHERE ProductoId = @ProductoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_listar_productos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProductoId,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Activo,
        FechaActualizacion
    FROM dbo.Productos
    ORDER BY ProductoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_obtener_producto
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProductoId,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Activo,
        FechaActualizacion
    FROM dbo.Productos
    WHERE ProductoId = @ProductoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_registrar_pedido
    @UsuarioId INT,
    @ProductoId INT,
    @Cantidad INT,
    @PedidoId INT OUTPUT,
    @Codigo INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @PedidoId = NULL;
    SET @Codigo = 0;

    IF @Cantidad IS NULL OR @Cantidad < 1
    BEGIN
        SET @Codigo = 4;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @UsuarioActivo BIT;
        SELECT @UsuarioActivo = Activo
        FROM dbo.Usuarios WITH (UPDLOCK, HOLDLOCK)
        WHERE UsuarioId = @UsuarioId;

        IF @UsuarioActivo IS NULL
        BEGIN
            SET @Codigo = 1;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @UsuarioActivo = 0
        BEGIN
            SET @Codigo = 2;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE @ProductoActivo BIT;
        DECLARE @Stock INT;
        DECLARE @Precio DECIMAL(10, 2);

        SELECT
            @ProductoActivo = Activo,
            @Stock = Stock,
            @Precio = Precio
        FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
        WHERE ProductoId = @ProductoId;

        IF @ProductoActivo IS NULL
        BEGIN
            SET @Codigo = 1;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @ProductoActivo = 0
        BEGIN
            SET @Codigo = 2;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @Stock < @Cantidad
        BEGIN
            SET @Codigo = 3;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE dbo.Productos
        SET Stock = Stock - @Cantidad
        WHERE ProductoId = @ProductoId;

        INSERT INTO dbo.Pedidos (UsuarioId, ProductoId, Cantidad, PrecioUnitario, Estado)
        VALUES (@UsuarioId, @ProductoId, @Cantidad, @Precio, N'CONFIRMADO');

        SET @PedidoId = CONVERT(INT, SCOPE_IDENTITY());
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_cancelar_pedido
    @PedidoId INT,
    @Codigo INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @Codigo = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Estado NVARCHAR(20);
        DECLARE @ProductoId INT;
        DECLARE @Cantidad INT;

        SELECT
            @Estado = Estado,
            @ProductoId = ProductoId,
            @Cantidad = Cantidad
        FROM dbo.Pedidos WITH (UPDLOCK, HOLDLOCK)
        WHERE PedidoId = @PedidoId;

        IF @Estado IS NULL
        BEGIN
            SET @Codigo = 1;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @Estado <> N'CONFIRMADO'
        BEGIN
            SET @Codigo = 2;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE @StockActual INT;
        SELECT @StockActual = Stock
        FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
        WHERE ProductoId = @ProductoId;

        UPDATE dbo.Pedidos
        SET Estado = N'CANCELADO', FechaActualizacion = SYSUTCDATETIME()
        WHERE PedidoId = @PedidoId;

        UPDATE dbo.Productos
        SET Stock = Stock + @Cantidad
        WHERE ProductoId = @ProductoId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH

    SELECT
        PedidoId,
        UsuarioId,
        ProductoId,
        Cantidad,
        PrecioUnitario,
        Estado,
        FechaActualizacion
    FROM dbo.Pedidos
    WHERE PedidoId = @PedidoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_listar_pedidos
    @ProductoId INT,
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PedidoId,
        UsuarioId,
        ProductoId,
        Cantidad,
        PrecioUnitario,
        Estado,
        FechaActualizacion
    FROM dbo.Pedidos
    WHERE (@ProductoId IS NULL OR ProductoId = @ProductoId)
      AND (@UsuarioId IS NULL OR UsuarioId = @UsuarioId)
    ORDER BY PedidoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_obtener_pedido
    @PedidoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PedidoId,
        UsuarioId,
        ProductoId,
        Cantidad,
        PrecioUnitario,
        Estado,
        FechaActualizacion
    FROM dbo.Pedidos
    WHERE PedidoId = @PedidoId;
END
GO
