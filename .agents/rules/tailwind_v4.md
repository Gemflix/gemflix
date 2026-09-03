# Tailwind CSS v4 Guidelines

This project uses **Tailwind CSS v4**. Please ensure you use the updated v4 syntax for utility classes:

1. **Gradients**: Use `bg-linear-to-*` instead of `bg-gradient-to-*`.
   - Correct: `bg-linear-to-r`, `bg-linear-to-br`
   - Incorrect: `bg-gradient-to-r`, `bg-gradient-to-br`

2. **Opacities on Arbitrary Values**: Avoid using arbitrary float values in brackets for opacity when a simpler division syntax works.
   - Correct: `bg-white/2` (for 2% opacity), `bg-white/1` (for 1% opacity)
   - Incorrect: `bg-white/[0.02]`, `bg-white/[0.01]`

3. **Arbitrary Lengths**: Avoid arbitrary lengths in brackets if a standard spacing scale exists.
   - Correct: `min-h-20` (80px), `min-h-30` (120px), `max-w-50` (200px)
   - Incorrect: `min-h-[80px]`, `min-h-[120px]`, `max-w-[200px]`
