# Fuentes Personalizadas para PlumaAI

Esta carpeta contiene las fuentes personalizadas utilizadas para la exportación de libros.

## Amazon Ember (Recomendada para KDP)

Amazon recomienda la familia de fuentes **Amazon Ember** para publicaciones en KDP.

### Archivos necesarios:

Coloca los siguientes archivos en esta carpeta:

```
fonts/
├── AmazonEmber-Regular.otf
├── AmazonEmber-Bold.otf
├── AmazonEmber-Italic.otf
├── AmazonEmber-BoldItalic.otf (opcional)
```

### ¿Dónde conseguir Amazon Ember?

Amazon Ember es una fuente propietaria de Amazon. Alternativas libres similares:

1. **Bookerly** - Fuente de Amazon para Kindle (si tienes acceso)
2. **Libre Baskerville** - Alternativa libre similar
3. **EB Garamond** - Clásica para libros
4. **Crimson Text** - Diseñada para lectura

### Alternativas Gratuitas Recomendadas:

Si no tienes acceso a Amazon Ember, estas fuentes funcionan perfectamente para KDP:

- **Garamond** (incluida en el sistema)
- **Georgia** (incluida en el sistema)
- **Crimson Text** - https://fonts.google.com/specimen/Crimson+Text
- **Libre Baskerville** - https://fonts.google.com/specimen/Libre+Baskerville
- **EB Garamond** - https://fonts.google.com/specimen/EB+Garamond

## Cómo Agregar Fuentes

### Opción 1: Archivos OTF/TTF locales

1. Coloca los archivos `.otf` o `.ttf` en esta carpeta
2. Ejecuta el script de conversión (próximamente)
3. Las fuentes se cargarán automáticamente

### Opción 2: Google Fonts (Más fácil)

Edita `index.html` y agrega en el `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

## Formatos Soportados

- **.otf** - OpenType Font
- **.ttf** - TrueType Font
- **.woff** - Web Open Font Format
- **.woff2** - Web Open Font Format 2

## Notas Importantes

- Las fuentes deben tener licencia para uso comercial si publicas tu libro
- Amazon Ember es propietaria de Amazon
- Para KDP, las fuentes serif son las más recomendadas
- El tamaño del archivo PDF aumentará con fuentes personalizadas embebidas

## Conversión de OTF a Base64 (para jsPDF)

Para usar fuentes personalizadas en jsPDF, necesitas convertirlas a base64.

### Herramienta online:
https://products.aspose.app/font/base64

### Comando local (requiere base64):
```bash
base64 fonts/AmazonEmber-Regular.otf > fonts/AmazonEmber-Regular.base64
```

Luego usa el archivo base64 en el código.
