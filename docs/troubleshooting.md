# Solución de Problemas

## Next.js dev: lock activo / puerto en uso

Síntoma: `Unable to acquire lock ... is another instance of next dev running?`

Solución (macOS):

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
npm run dev
```

## Warning: middleware → proxy

Mensaje: `The "middleware" file convention is deprecated. Please use "proxy" instead.`

Acción: migrar a la convención `proxy` cuando se toque esa parte.

## Descarga de .docx no inicia

- Verifica que `space` y `profile` estén cargados.
- En `agreement/[id]/page.tsx` el botón se deshabilita hasta tener datos.
- Si falla, revisa la consola por errores de `docx` o `file-saver`.

## Tipos de `file-saver`

Si TypeScript reporta falta de declaraciones, instala tipos:

```bash
npm i -D @types/file-saver
```

## CORS al subir documentos

- Verifica cabeceras en backend y que `NEXT_PUBLIC_API_URL` apunte al host correcto.
