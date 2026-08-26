---
description: Regla estricta para limpieza automática de archivos temporales y de prueba antes de finalizar tareas o commits.
---

# Regla de Limpieza Estricta (Strict Cleanup Rule)

## Contexto
El usuario ha solicitado de manera explícita y estricta que **NO** se deben dejar archivos basura, scripts de prueba (scratch), binarios compilados o logs en el código fuente principal. El agente debe entender esto automáticamente sin que el usuario tenga que recordárselo.

## Instrucciones de Comportamiento
1. **Limpieza Proactiva:** Antes de dar por finalizada una tarea, de preparar un commit de Git, o de dar el trabajo por concluido, debes revisar activamente el espacio de trabajo en busca de archivos temporales.
2. **Archivos a Eliminar Automáticamente:**
   - Todo el contenido del directorio `scratch/` (a menos que se indique explícitamente guardarlo como referencia permanente).
   - Archivos con prefijos o sufijos como `scratch_*.go`, `test_api_*.go`, `tmp*.go`.
   - Archivos ejecutables compilados (`*.exe`, `*.bin`, directorios `tmp/`).
   - Archivos de log generados durante pruebas locales (`server.log`, `server_err.log`).
   - Archivos JSON o dumps generados por scripts de prueba (`*_out.json`).
3. **Ejecución sin permiso adicional:** No pidas permiso para borrar estos archivos si sabes que fueron creados temporalmente por ti para pruebas o depuración. Bórralos (o haz `git rm` si están en el índice) y limpia el historial antes de notificar al usuario.
4. **Respeto al .gitignore:** Asegúrate de que el `.gitignore` esté correctamente configurado para ignorar binarios y logs, pero la limpieza física de scripts de prueba (scratch scripts) sigue siendo obligatoria.
