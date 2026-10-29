import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Seguridad: Verificar que la petición provenga del Cron Job de Vercel
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        console.log("🚀 Ejecutando Cron Job del Bot Recopilador...");

        // Aquí colocas la lógica de búsqueda o llamada a tus APIs
        // Ejemplo de inserción/actualización (upsert) en Supabase:
        const productosNuevos = [
            {
                codigo_producto: 'MLA-1412345678',
                titulo: 'Smartphone Samsung Galaxy S23 256GB',
                tienda: 'mercadolibre',
                precio: 649,
                precio_original: 899,
                descuento_porcentaje: 28,
                imagen_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
                url_afiliado: `https://articulo.mercadolibre.com.ar/MLA-1412345678?tag=${process.env.TAG_ML}`,
                updated_at: new Date().toISOString()
            }
        ];

        for (const prod of productosNuevos) {
            await supabase.from('ofertas').upsert(prod, { onConflict: 'codigo_producto' });
        }

        return res.status(200).json({ success: true, message: 'Ofertas actualizadas con éxito en Supabase' });
    } catch (error) {
        console.error('Error en Cron Job:', error);
        return res.status(500).json({ error: error.message });
    }
}
