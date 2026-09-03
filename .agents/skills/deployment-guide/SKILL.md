---
name: deployment-guide
description: Guía de despliegue y arquitectura de CI/CD para Gemflix
---

# Gemflix Deployment Guide (Komodo)

Esta guía explica cómo funciona el flujo de despliegue continuo (CI/CD) de Gemflix, para que los agentes futuros no intenten usar CLI locales.

## Flujo de Despliegue
Gemflix utiliza un flujo de **Continuous Deployment (CD)** basado en GitHub y Komodo.

1. **Commit y Push:** Todo el código listo para staging o producción debe ser commiteado y empujado a la rama `main` en GitHub.
2. **Trigger:** Komodo (u otras plataformas conectadas al repositorio) detectará automáticamente el push.
3. **Build y Deploy:** Komodo se encarga de compilar el frontend (Next.js) y el backend (Go) y desplegarlos en los servidores correspondientes.

### Reglas para Agentes
- **NUNCA** intentes usar comandos de CLI como `vercel deploy` o `railway up` a menos que el usuario proporcione un token explícitamente en la conversación.
- **NO** guardes tokens ni credenciales en memoria.
- Para desplegar, simplemente usa `git add .`, `git commit -m "mensaje"`, y `git push origin main`.
- Informa al usuario que el push se realizó con éxito y que Komodo se encargará del resto.
