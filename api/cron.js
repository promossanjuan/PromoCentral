import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. Validar seguridad del Cron de Vercel (opcional pero recomendado)
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Si se llama manualmente desde el panel de Vercel, permitimos la ejecución
        console.log("Ejecución manual o autorizada detectada.");
    }

    // 2. Conectar a Supabase con la clave de servicio (Service Role) para tener permisos de escritura
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        console.log("🚀 Iniciando sincronización automática de ofertas...");

        // Aquí es donde en el futuro llamarás a las APIs de Amazon, Mercado Libre o AliExpress.
        // Por ahora, inyectaremos un lote fresco de productos reales para poblar la tienda:
        const productosNuevos = [
            {
                titulo: 'Smart TV 55 pulgadas 4K UHD Smart HDR',
                tienda: 'mercadolibre',
                precio: 450.00,
                precio_original: 600.00,
                descuento_porcentaje: 25,
                puntuacion: 9.6,
                imagen_url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80',
                url_afiliado: `https://articulo.mercadolibre.com.ar/MLA-999888777-smart-tv-55?tag=${process.env.TAG_ML || 'default'}`,
                codigo_producto: 'MLA-999888777',
                categoria: 'tecnologia',
                activo: true,
                updated_at: new Date().toISOString()
            },
            {
                titulo: 'Smartphone Samsung Galaxy S23 256GB Ultra HD',
                tienda: 'mercadolibre',
                precio: 649.00,
                precio_original: 899.00,
                descuento_porcentaje: 28,
                puntuacion: 9.8,
                imagen_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80',
                url_afiliado: `https://articulo.mercadolibre.com.ar/MLA-1412345678-samsung?tag=${process.env.TAG_ML || 'default'}`,
                codigo_producto: 'MLA-1412345678',
                categoria: 'tecnologia',
                activo: true,
                updated_at: new Date().toISOString()
            },
            {
                titulo: 'Auriculares Sony WH-1000XM5 Cancelación Ruido',
                tienda: 'amazon',
                precio: 298.00,
                precio_original: 399.00,
                descuento_porcentaje: 25,
                puntuacion: 9.5,
                imagen_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
                url_afiliado: `https://www.amazon.com/dp/B09XS7JWHH?tag=${process.env.TAG_AMAZON || 'default'}`,
                codigo_producto: 'B09XS7JWHH',
                categoria: 'tecnologia',
                activo: true,
                updated_at: new Date().toISOString()
            }
        ];

        // 3. Ejecutar UPSERT en Supabase (Inserta si no existe, actualiza precio si ya existe)
        for (const prod of productosNuevos) {
            const { error } = await supabase
                .from('ofertas')
                .upsert(prod, { onConflict: 'codigo_producto' });

            if (error) {
                console.error(`❌ Error con el producto ${prod.codigo_producto}:`, error.message);
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Base de datos sincronizada correctamente con Vercel Cron.' 
        });

    } catch (error) {
        console.error('Error crítico en Cron Job:', error);
        return res.status(500).json({ error: error.message });
    }
}
