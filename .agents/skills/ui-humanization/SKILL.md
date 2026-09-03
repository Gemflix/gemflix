---
name: ui-humanization
description: >-
  Aplica principios de UI/UX modernos (2026) y "Diseño Humanizado" (inspirado en Addy Osmani).
  Activa este skill cuando estés diseñando, maquetando o refactorizando componentes
  frontend para asegurarte de que entreguen una experiencia premium, interactiva y empática.
---

# UI/UX Humanization Skill (Stack Gemflix 2026)

Este skill define el estándar de calidad visual y de experiencia de usuario para Gemflix. Cuando el usuario solicite un diseño "profesional", "premium" o "humanizado", debes seguir **estrictamente** estas pautas.

Nuestro Stack: **Next.js (App Router), Tailwind CSS v4, Framer Motion, Lucide React.**

## 1. Diseño Humanizado y Empático (Principios de Addy Osmani)

El diseño humanizado busca reducir la carga cognitiva, anticipar errores de forma amable y deleitar al usuario en las micro-interacciones.

- **Empty States (Estados Vacíos):** Nunca muestres una pantalla en blanco. Si una tabla no tiene datos, muestra un icono grande (`Lucide-React`), un título amistoso y un CTA (Call To Action) para ayudar al usuario a dar el primer paso.
- **Micro-interacciones (Delight):** Utiliza `framer-motion` para suavizar las transiciones. Ningún modal debe aparecer "de golpe" (pop-in brusco).
  - *Regla de Oro:* Todo modal/dropdown debe usar `<AnimatePresence>` y entrar con `initial={{ opacity: 0, scale: 0.95 }}`.
- **Copys Claros y Accesibles:** Los mensajes de error no deben decir "Error 500". Deben decir "Vaya, parece que los servidores están descansando. Reintenta en unos segundos."

## 2. Estética "Premium Dark Mode" (2026)

El estándar para Gemflix es una interfaz oscura que inspire tecnología punta, similar a paneles de Vercel, Stripe o Linear.

- **Glassmorphism Inteligente:** No uses colores de fondo sólidos para tarjetas o modales. Usa capas translúcidas.
  - *Ejemplo Tailwind v4:* `bg-white/2 backdrop-blur-xl border border-white/5`.
- **Bordes Sutiles (Subtle Borders):** Los elementos flotantes SIEMPRE deben tener un borde tenue.
  - *Ejemplo:* `border-white/10` o `border-white/5`.
- **Jerarquía de Texto:**
  - Títulos principales: `text-white font-bold tracking-tight`. Opcionalmente con gradientes en el texto usando la sintaxis v4: `bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent`.
  - Subtítulos/Ayudas: `text-gray-400 text-sm`.
- **Glows y Sombras Acentuadas:** Los botones de "Guardar" o elementos principales deben emitir un sutil "glow" de su color principal.
  - *Ejemplo:* `shadow-lg shadow-blue-500/20`.

## 3. Uso de Tailwind v4 (Reglas Estrictas)

- **Gradientes:** Usa la sintaxis v4 `bg-linear-to-[direction]`. NUNCA uses la sintaxis antigua `bg-gradient-to-`.
  - *Correcto:* `bg-linear-to-r from-blue-500 to-purple-500`
- **Opacidades Integradas:** Usa fracciones directamente en el color. NUNCA uses corchetes arbitrarios para opacidades comunes.
  - *Correcto:* `bg-blue-500/10`
  - *Incorrecto:* `bg-blue-500/[0.1]`
- **Evitar Clases Arbitrarias en lo Posible:** A menos que sea estrictamente necesario para medidas exactas (`w-[300px]`), prefiere el espaciado semántico (`w-72`, `p-6`).

## 4. Patrones de Interacción Obligatorios

- **Loading States (Skeletons & Spinners):** 
  - Los botones de envío DEBEN deshabilitarse (`disabled={loading}`) y cambiar su icono por un *spinner* durante transiciones asíncronas para evitar doble-clic.
- **Inputs Modernos:**
  - Los formularios oscuros deben tener inputs con fondos sutiles (`bg-black/50`), bordes tenues (`border-white/10`) y anillos de focus vibrantes (`focus:border-blue-500 focus:ring-1 focus:ring-blue-500`).
- **Iconografía:** Usa siempre íconos de `lucide-react`. Acompáñalos de un "badge" contenedor para darles presencia.
  - *Patrón de ícono prominente:* `<div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl"> <Icon size={24} /> </div>`

## 5. Workflow al Recibir una Tarea de UI
1. Piensa: *"¿Cómo puedo hacer que este componente se sienta vivo?"* (Añade hover effects: `hover:bg-white/5 transition-all`).
2. Revisa el contraste de los colores sobre fondos oscuros.
3. Asegúrate de implementar el componente con `framer-motion` para las entradas y salidas de la vista.
