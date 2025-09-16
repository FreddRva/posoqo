-- ========================================
-- Migración: Create payments table
-- ========================================

-- Tabla para registrar pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    order_id UUID,
    reservation_id UUID,
    stripe_payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    method VARCHAR(50) NOT NULL DEFAULT 'stripe',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
);

-- Trigger para actualizar `updated_at` en `payments`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON payments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Comentarios para documentación
COMMENT ON TABLE payments IS 'Tabla de pagos procesados';
COMMENT ON COLUMN payments.user_id IS 'ID del usuario que realizó el pago';
COMMENT ON COLUMN payments.order_id IS 'ID del pedido asociado (opcional)';
COMMENT ON COLUMN payments.reservation_id IS 'ID de la reserva asociada (opcional)';
COMMENT ON COLUMN payments.stripe_payment_id IS 'ID del pago en Stripe';
COMMENT ON COLUMN payments.amount IS 'Monto del pago en soles';
COMMENT ON COLUMN payments.status IS 'Estado del pago: pending, paid, failed, refunded';
COMMENT ON COLUMN payments.method IS 'Método de pago: stripe, cash, etc.';
