# WotLK Launcher

<p align="center">
  <strong>Spanish</strong> | <a href="./README.en.md">English</a>
</p>

Launcher de escritorio para **World of Warcraft: Wrath of the Lich King 3.3.5a**.

Creado con **Electron**, **React**, **TypeScript**, **Vite**, **Tailwind CSS** e **i18next**.

## Características

- Selección y validación de la ruta local del cliente WotLK.
- Ejecución directa del juego mediante `Wow.exe`.
- Gestión automática de `realmlist.wtf`.
- Lista de servidores predeterminados y soporte para realmlists personalizados.
- Añadir, editar, eliminar y aplicar realmlists personalizados.
- Visualización del tamaño de Cache y limpieza controlada.
- Creación de backups de WTF comprimidos en archivos `.zip`.
- Restauración de WTF desde el backup más reciente.
- Acceso rápido a la carpeta de backups.
- Detección de la carpeta Screenshots y acceso rápido.
- Escaneo de espacio usado en carpetas importantes del cliente.
- Modal de ajustes con:
  - selector de idioma;
  - minimizar el launcher al abrir el juego;
  - limpiar Cache al abrir el juego.
- Soporte de interfaz en español e inglés.
- Notificaciones de éxito y modales de error.
- Soporte para build portable de Windows.

## Herramientas Actuales

- **Cache**: muestra el tamaño actual de Cache y puede limpiar su contenido.
- **Espacio usado**: escanea carpetas del cliente como `Data`, `Interface/AddOns`, `Screenshots`, `WTF`, `Cache` y `Logs`.
- **WTF**: crea y restaura backups de configuración.
- **Screenshots**: muestra el conteo de capturas y abre la carpeta Screenshots.

## Backups

Los backups de WTF se guardan en el directorio de datos del launcher:

```text
Backups/WTF
```

El launcher conserva hasta 10 backups de WTF y elimina los más antiguos cuando se supera ese límite.

## Internacionalización

El launcher actualmente soporta:

- Español (`es`)
- Inglés (`en`)

El idioma seleccionado se guarda en `settings.json` y se restaura al abrir nuevamente la app.

## Roadmap

### AddOns

Sección de AddOns planeada:

- Detectar AddOns instalados desde `Interface/AddOns`.
- Mostrar nombre, carpeta y estado básico del AddOn.
- Activar o desactivar AddOns desde el launcher.
- Abrir rápidamente la carpeta AddOns.
- Agregar soporte futuro para descargar o actualizar AddOns seleccionados.

### Mods

Sección de Mods planeada:

- Gestionar parches opcionales y mejoras visuales del cliente.
- Detectar archivos de parche instalados.
- Mostrar estado de mods disponibles o activados.
- Proveer enlaces o descargas controladas para parches HD externos.
- Validar archivos antes de aplicar o reemplazar mods del cliente.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Ejecutar verificación de tipos:

```bash
npm run typecheck
```

Ejecutar lint:

```bash
npm run lint
```

Compilar la app:

```bash
npm run build
```

Crear el ejecutable portable de Windows:

```bash
npm run build:win
```

## Tecnologías

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- i18next
- electron-builder

## Licencia

Todavía no se ha definido una licencia.
