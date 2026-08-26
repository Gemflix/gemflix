---
description: Regla de codificación estricta para Frontend (TypeScript, React, Next.js).
---

# Regla de Codificación Frontend (Strict TypeScript & Next.js)

## Contexto
El usuario exige un código extremadamente limpio y libre de advertencias de linter. El ruido generado por cientos de advertencias menores (warnings/errors de ESLint) dificulta la depuración de problemas reales en producción. A partir de ahora, todo código Frontend generado o modificado por agentes debe cumplir con el rigor más alto.

## Instrucciones de Comportamiento (Frontend Strict Mode)

1. **PROHIBIDO EL USO DE `any`:** 
   - Nunca utilices el tipo `any`.
   - Utiliza tipado fuerte e interfaces explícitas. 
   - Si el tipo es dinámico o desconocido, usa `unknown` y realiza validaciones de tipo (type guards).

2. **Imágenes Optimizadas (Next.js):**
   - NUNCA uses la etiqueta HTML estándar `<img>`.
   - Utiliza SIEMPRE el componente `<Image />` importado de `next/image`.
   - Asegúrate de proveer `width`, `height`, y `alt` para evitar problemas de Cumulative Layout Shift (CLS).

3. **Navegación y Enrutamiento (Next.js):**
   - NUNCA uses `window.location.href`, `window.location.replace` o etiquetas `<a>` tradicionales para navegar entre páginas internas de la aplicación.
   - Utiliza SIEMPRE el componente `<Link>` de `next/link` para navegación declarativa.
   - Utiliza SIEMPRE `useRouter().push()` de `next/navigation` para navegación programática en Client Components.

4. **Efectos de React (useEffect):**
   - No llames a funciones actualizadoras de estado (`setState`) sincrónicamente dentro del cuerpo de un `useEffect` si esto puede causar cascadas de renderizado innecesarias.
   - Respeta estrictamente el arreglo de dependencias (`exhaustive-deps`).
   - Declara las variables y funciones antes de usarlas dentro del efecto.

5. **Variables no utilizadas:**
   - Elimina todas las importaciones y variables declaradas que no se estén utilizando (ej. `motion` importado pero no usado).
   - No dejes código comentado ni dependencias muertas.

## Consecuencias
Antes de dar una tarea de Frontend por concluida, el código debe pasar limpiamente (0 Errores, 0 Warnings) al ejecutar `npm run lint` y `npx tsc --noEmit`. Si introduces un warning, soluciónalo inmediatamente antes de hacer commit.
