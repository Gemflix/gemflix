# Reglas Críticas para Gemflix

## 1. Archivos Temporales (Limpieza)
ESTÁ ESTRICTAMENTE PROHIBIDO dejar archivos temporales (como `fix_lints.js`, `test.js`, `.log`, etc.) en el repositorio o hacer commit de ellos.
Siempre que uses un archivo de scratch o un script temporal, debes asegurarte de **eliminarlo** antes de finalizar tu tarea y especialmente **antes de hacer `git push`**.

## 2. Prevención de Conflictos CSS (Tailwind)
Al usar herramientas de búsqueda y reemplazo masivas, o al realizar refactorizaciones de clases de Tailwind:
- PRESTA EXTREMA ATENCIÓN para no generar clases duplicadas o contradictorias (ej. `block flex`, `shadow-md shadow-lg`).
- VERIFICA los archivos que has editado usando `view_file` o analizando los logs de lint para confirmar que las clases de Tailwind son válidas.

## 3. Revisión de Reglas
Al inicio de cualquier sesión o tarea de alta complejidad, debes detenerte a verificar mentalmente si estás cumpliendo estas directrices. 
No procedas con modificaciones apresuradas si no has verificado estas reglas de limpieza y precisión primero.
