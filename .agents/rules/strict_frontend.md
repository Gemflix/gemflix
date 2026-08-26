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

6. **Sintaxis Moderna de Tailwind CSS (v4+):**
   - El linter (o IDE) genera advertencias para la sintaxis antigua. NUNCA escribas clases con formato antiguo.
   - REGLAS DE REEMPLAZO OBLIGATORIAS:
     - En lugar de valores arbitrarios como `z-[100]`, `z-[110]`, usa clases nativas: `z-100`, `z-110`.
     - En lugar de `max-w-[200px]`, `w-[600px]`, usa el sistema espaciador moderno (ej. `max-w-50`, `w-150`).
     - En lugar de `bg-gradient-to-r`, usa SIEMPRE la nueva sintaxis `bg-linear-to-r`, `bg-linear-to-t`, etc.
     - En lugar de usar variables con corchetes repetitivos como `from-[var(--accent)]`, usa directamente la variable referenciada si existe en el sistema (ej. `from-accent`), o configúrala apropiadamente.
     - En lugar de clases display redundantes (`flex` vs `block`), elimina la que aplique de manera redundante según la estructura.
   - CUANDO ABRAS UN ARCHIVO EXISTENTE: Es tu responsabilidad escanear y actualizar instantáneamente TODA la sintaxis antigua de Tailwind a su versión moderna.

## Consecuencias
Antes de dar una tarea de Frontend por concluida, el código debe pasar limpiamente (0 Errores, 0 Warnings) al ejecutar `npm run lint` y `npx tsc --noEmit`. Si introduces un warning (incluyendo warnings de Tailwind en el IDE), soluciónalo inmediatamente. No ignores advertencias estéticas.
