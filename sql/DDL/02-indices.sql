USE CafeteriaCampus;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Pedidos_UsuarioId'
      AND object_id = OBJECT_ID(N'dbo.Pedidos')
)
BEGIN
    CREATE INDEX IX_Pedidos_UsuarioId ON dbo.Pedidos (UsuarioId);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Pedidos_ProductoId'
      AND object_id = OBJECT_ID(N'dbo.Pedidos')
)
BEGIN
    CREATE INDEX IX_Pedidos_ProductoId ON dbo.Pedidos (ProductoId);
END
GO
