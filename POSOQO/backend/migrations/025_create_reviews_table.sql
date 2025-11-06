-- Crear tabla de reseñas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Agregar comentarios a la tabla
COMMENT ON TABLE reviews IS 'Tabla para almacenar las reseñas de los productos';
COMMENT ON COLUMN reviews.id IS 'Identificador único de la reseña';
COMMENT ON COLUMN reviews.user_id IS 'Usuario que escribió la reseña';
COMMENT ON COLUMN reviews.product_id IS 'Producto que se está reseñando';
COMMENT ON COLUMN reviews.rating IS 'Calificación del 1 al 5';
COMMENT ON COLUMN reviews.comment IS 'Comentario del usuario sobre el producto';

