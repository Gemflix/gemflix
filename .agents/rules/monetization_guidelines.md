# Monetization & Gamification Architecture (Gemflix)

This document describes the business rules and technical architecture of the monetization systems built in Go for Gemflix. 
Always refer to this file when implementing frontend components or modifying related logic.

## 1. Wallets (Billeteras) y Moneda Virtual (Tokens)
- **Propósito:** La moneda virtual (Tokens) es de uso exclusivo interno. No se puede utilizar para comprar suscripciones principales. 
- **Casos de uso:** 
  - Comprar ítems en la Tienda (`shop_items`) como avatares, marcos (frames), fondos o insignias (badges).
  - Comprar Códigos Promocionales (Descuentos) si el admin los pone a la venta.
- **Transacciones:** Todas las operaciones de recarga o descuento se realizan mediante **Transacciones ACID** en PostgreSQL (`tx, err := s.dbPool.Begin`) para garantizar que no haya saldo negativo o carreras de condiciones (race conditions).

## 2. Suscripciones y Planes (Direct Payments)
- **Propósito:** Las suscripciones (VIP, Gemdrive, etc.) se compran exclusivamente con dinero real o métodos de pago directos, NUNCA con Tokens de la wallet.
- **Renovaciones:** Las fechas de expiración se calculan usando periodos calendáricos (ej. si el usuario compra un plan mensual el 15 de febrero, este expirará el 15 de marzo, independientemente si tiene 28 o 31 días) mediante la función `time.AddDate(0, 1, 0)`.
- **Estructura Dinámica:** La columna `features JSONB` en la tabla `plans` guarda atributos configurables ilimitados, mientras que la tabla `plan_prices` almacena los precios en diferentes monedas e intervalos de tiempo.

## 3. Códigos Promocionales (Promocodes)
- **Tipos de Códigos (`type`):**
  1. `fixed`: Al canjear, se añaden Tokens directamente a la Wallet del usuario.
  2. `free_days`: Al canjear, se le crea o extiende una suscripción VIP con los días gratuitos indicados. NO se usa la wallet.
  3. `percentage`: Se guarda en el historial para que el usuario pueda aplicarlo como descuento en su próxima compra con moneda real (checkout).
- **Validaciones:** Se respetan estrictamente los límites de usos (`max_uses`) y las fechas de validez (`valid_from`, `valid_until`).

## 4. Referidos y Prevención de Fraude
- **Estrategia:** Se premia a los usuarios por invitar amigos al registrarse.
- **Anti-Farming (Fraude):** Para evitar que un usuario cree múltiples cuentas falsas y farmee tokens, se utiliza el `device_id` (huella del dispositivo) al momento del registro.
- **Límite:** Si un mismo dispositivo sobrepasa el límite (ej. 2 cuentas referidas registradas), la recompensa del nuevo registro es marcada como fraude (`status = 'invalid'`) y el referente no recibe puntos. Las recompensas válidas depositan tokens a la Wallet.

## 5. Anuncios (Ads) y Sistema Waterfall (Cascada)
- **Propósito:** Monetización pasiva mediante redes publicitarias y acortadores de enlaces, usando APIs propias y Keys del Administrador.
- **Estructura:** La tabla `ads` contiene el script/API, el tipo y la configuración.
- **Waterfall:** La columna `priority` define el orden de carga. El endpoint `/ads/waterfall` siempre retorna los anuncios ordenados de mayor prioridad a menor.
- **Límites:** El backend verifica `user_ad_views` y excluye automáticamente aquellos anuncios donde el usuario ya superó el `daily_limit` (límite diario).
- **Recompensas:** Si un anuncio tiene la bandera `is_rewarded = true`, cuando el reproductor del cliente envía el evento a `/ads/view`, se le transfieren automáticamente los tokens de recompensa (`reward_tokens`) a su Wallet.
