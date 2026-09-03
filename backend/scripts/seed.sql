-- ==========================================
-- SEED DATA: Realistic cases for Gemflix
-- ==========================================

TRUNCATE roles, plans, plan_prices, ads, shop_items, promo_codes RESTART IDENTITY CASCADE;

-- 1. Roles
INSERT INTO roles (name, description, is_system) VALUES 
('moderator', 'Moderador de Contenido y Comunidad', true),
('support', 'Soporte Técnico', false),
('vip_user', 'Usuario con privilegios VIP', false)
ON CONFLICT DO NOTHING;

-- 2. Planes de Suscripción (Billing)
INSERT INTO plans (key, name, description, is_active, is_featured, features, max_profiles, max_devices, category) VALUES 
('basic', 'Básico', 'Acceso a todo el catálogo en HD con anuncios.', true, false, '["Acceso a películas y series", "Resolución 720p HD", "Soporte estándar"]', 1, 1, 'Suscripción'),
('standard', 'Estándar', 'La mejor calidad para disfrutar en familia, sin anuncios.', true, true, '["Sin anuncios", "Resolución 1080p FHD", "Soporte prioritario", "5 descargas mensuales"]', 3, 2, 'Suscripción'),
('ultravip', 'Ultra VIP', 'Para los verdaderos cinéfilos. 4K, descargas ilimitadas y recompensas.', true, false, '["Resolución 4K HDR", "Descargas offline ilimitadas", "Soporte 24/7", "Tokens de regalo mensuales"]', 5, 4, 'Suscripción');

INSERT INTO plan_prices (plan_id, currency, interval, price_cents, is_active) VALUES 
(1, 'USD', 'monthly', 499, true),
(2, 'USD', 'monthly', 899, true),
(3, 'USD', 'monthly', 1499, true),
(3, 'USD', 'yearly', 14999, true);

-- 3. Anuncios (Waterfall)
INSERT INTO ads (company, type, content, is_rewarded, reward_tokens, daily_limit, is_active, priority) VALUES 
('Monetag', 'popunder', 'https://monetag.com/direct/link?id=923847', false, 0, 0, true, 10),
('Adsterra', 'smartlink', 'https://adsterra.com/smart?id=102938', false, 0, 0, true, 20),
('Unity Ads', 'interstitial', 'UNITY_API_KEY_99283', true, 50, 10, true, 30),
('Google AdManager', 'vast', 'https://pubads.g.doubleclick.net/gampad/ads?iu=/123456/video_ad', false, 0, 0, true, 40);

-- 4. Artículos de la Tienda (Avatares, Marcos, Insignias)
INSERT INTO shop_items (name, description, type, price, is_active, meta, preview_css) VALUES 
('Avatar Neón', 'Un estilo ciberpunk brillante para tu perfil.', 'avatar', 500, true, '{"preview_url": "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=200&auto=format&fit=crop"}', ''),
('Marco Dorado VIP', 'Demuestra tu estatus con este marco exclusivo.', 'frame', 1000, true, '{}', 'ring-4 ring-amber-500 shadow-lg shadow-amber-500/50'),
('Insignia Fundador', 'Solo para los primeros usuarios.', 'badge', 2500, true, '{"preview_url": "https://cdn-icons-png.flaticon.com/512/5556/5556468.png"}', '');

-- 5. Códigos Promocionales
INSERT INTO promo_codes (code, type, value, max_uses, uses, is_active) VALUES 
('BIENVENIDA2026', 'fixed', 500, 1000, 45, true),
('OFERTAVIP', 'percentage', 20, 100, 12, true),
('PRUEBAGRATIS', 'free_days', 7, 0, 890, true);
