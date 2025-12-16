# API de Reportes - SGI Avalom

Este documento describe todos los endpoints disponibles para generar reportes en formato PDF del sistema de gestión inmobiliaria.

## Tabla de Contenidos

- [1. Reporte de Edificios y Propiedades](#1-reporte-de-edificios-y-propiedades)
- [2. Reporte de Clientes](#2-reporte-de-clientes)
- [3. Reporte de Alquiler Detallado](#3-reporte-de-alquiler-detallado)
- [4. Reporte de Usuarios](#4-reporte-de-usuarios)
- [5. Generación de Contrato de Arrendamiento](#5-generación-de-contrato-de-arrendamiento)

---

## 1. Reporte de Edificios y Propiedades

### Endpoint
```
GET /api/export-buildings
```

### Descripción
Genera un reporte en PDF con la información completa de todos los edificios, sus propiedades y el detalle de alquileres mensuales. Incluye estadísticas generales como tasa de ocupación y morosidad.

### Parámetros Query (Opcionales)

| Parámetro | Tipo   | Formato    | Descripción                                    | Ejemplo      |
|-----------|--------|------------|------------------------------------------------|--------------|
| `from`    | string | YYYY-MM    | Fecha de inicio del rango para filtrar alquileres | 2024-01     |
| `to`      | string | YYYY-MM    | Fecha de fin del rango para filtrar alquileres    | 2024-12     |

### Ejemplo de Uso

#### Sin filtros (todos los datos):
```javascript
const response = await fetch('/api/export-buildings', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'reporte_edificios.pdf';
a.click();
```

#### Con rango de fechas:
```javascript
const from = '2024-01';
const to = '2024-12';
const response = await fetch(`/api/export-buildings?from=${from}&to=${to}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### Respuesta

**Content-Type:** `application/pdf`

**Content-Disposition:** `attachment; filename="reporte_edificios_<fecha>.pdf"`

El PDF incluye:
- **Estadísticas Generales:**
  - Total de edificios
  - Total de propiedades
  - Propiedades ocupadas
  - Tasa de ocupación (%)
  - Tasa de morosidad (%)
  
- **Tabla por cada edificio con:**
  - Identificador del edificio
  - Listado de propiedades con:
    - Identificador de propiedad
    - Tipo de propiedad
    - Estado del alquiler
    - Cliente(s) asociado(s)
    - Mensualidades en el rango especificado
    - Fecha de inicio y fin
    - Monto mensual
    - Estado de pago

---

## 2. Reporte de Clientes

### Endpoint
```
GET /api/export-clients
```

### Descripción
Genera un reporte en PDF con el listado completo de clientes registrados en el sistema, incluyendo su información de contacto y el estado de sus contratos.

### Parámetros Query
Ninguno. Este endpoint no acepta parámetros de filtrado.

### Ejemplo de Uso

```javascript
const response = await fetch('/api/export-clients', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'reporte_clientes.pdf';
a.click();
```

### Respuesta

**Content-Type:** `application/pdf`

**Content-Disposition:** `attachment; filename="reporte_clientes_<fecha>.pdf"`

El PDF incluye:
- **Estadísticas Generales:**
  - Total de clientes
  - Clientes con contrato activo
  - Clientes con contrato finalizado
  - Clientes con contrato cancelado
  - Clientes sin contrato

- **Tabla de clientes con:**
  - Número correlativo
  - Nombre completo (nombre + apellidos)
  - Correo electrónico
  - Teléfono
  - Fecha de creación
  - Estado del contrato más reciente
  - Número total de contratos

---

## 3. Reporte de Alquiler Detallado

### Endpoint
```
GET /api/export-rental
```

### Descripción
Genera un reporte detallado en PDF de un alquiler específico, incluyendo información completa del contrato, mensualidades, pagos realizados, depósito y servicios contratados.

### Parámetros Query

| Parámetro | Tipo   | Requerido | Formato    | Descripción                                    | Ejemplo      |
|-----------|--------|-----------|------------|------------------------------------------------|--------------|
| `alq_id`  | number | **Sí**    | number     | ID del alquiler a reportar                     | 123          |
| `from`    | string | No        | YYYY-MM    | Fecha de inicio del rango para filtrar mensualidades | 2024-01 |
| `to`      | string | No        | YYYY-MM    | Fecha de fin del rango para filtrar mensualidades     | 2024-12 |

### Ejemplo de Uso

#### Reporte completo de un alquiler:
```javascript
const alquilerId = 123;
const response = await fetch(`/api/export-rental?alq_id=${alquilerId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `reporte_alquiler_${alquilerId}.pdf`;
a.click();
```

#### Con rango de fechas:
```javascript
const alquilerId = 123;
const from = '2024-01';
const to = '2024-06';
const response = await fetch(
  `/api/export-rental?alq_id=${alquilerId}&from=${from}&to=${to}`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  }
);
```

### Validación

Si el `alq_id` no es proporcionado o es inválido, retorna:
```
Status: 400 Bad Request
Body: "alq_id inválido"
```

### Respuesta

**Content-Type:** `application/pdf`

**Content-Disposition:** `attachment; filename="reporte_alquiler_<alq_id>_<fecha>.pdf"`

El PDF incluye:

- **Información del Contrato:**
  - ID del alquiler
  - Fecha de inicio y fin
  - Monto mensual
  - Estado del contrato
  - Información de la propiedad (edificio, identificador, tipo)
  - Cliente(s) asociado(s)

- **Estadísticas del Período:**
  - Total de mensualidades en el rango
  - Mensualidades pagadas completamente
  - Mensualidades parcialmente pagadas
  - Mensualidades pendientes/atrasadas
  - Total recaudado
  - Total pendiente

- **Tabla de Mensualidades:**
  - Identificador de mensualidad
  - Período (fecha inicio - fecha fin)
  - Monto total
  - Monto pagado
  - Saldo pendiente
  - Estado (Pagado, Parcial, Atrasado, Pendiente)
  - Detalle de pagos (fecha, método, banco, referencia, monto)
  - Información de pagos anulados (si aplica)

- **Información del Depósito:**
  - Monto total del depósito
  - Monto actual (después de deducciones)
  - Pagos realizados al depósito
  - Estado

- **Servicios Adicionales:**
  - Listado de servicios contratados
  - Descripción de cada servicio

---

## 4. Reporte de Usuarios

### Endpoint
```
GET /api/export-users
```

### Descripción
Genera un reporte en PDF con el listado completo de usuarios del sistema, incluyendo su información de contacto, rol y estado.

### Parámetros Query
Ninguno. Este endpoint no acepta parámetros de filtrado.

### Ejemplo de Uso

```javascript
const response = await fetch('/api/export-users', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'reporte_usuarios.pdf';
a.click();
```

### Respuesta

**Content-Type:** `application/pdf`

**Content-Disposition:** `attachment; filename="reporte_usuarios_<fecha>.pdf"`

El PDF incluye:
- **Estadísticas Generales:**
  - Total de usuarios
  - Usuarios activos
  - Usuarios inactivos
  - Desglose por rol:
    - Administradores (A)
    - Jefes (J)
    - Empleados (E)
    - Revisores (R)

- **Tabla de usuarios con:**
  - Número correlativo
  - Nombre completo (nombre + apellidos)
  - Correo electrónico
  - Teléfono
  - Estado (A: Activo, I: Inactivo)
  - Rol
  - Fecha de creación

### Leyenda de Roles

| Código | Descripción  |
|--------|--------------|
| A      | Administrador|
| J      | Jefe         |
| E      | Empleado     |
| R      | Revisor      |

### Leyenda de Estados

| Código | Descripción |
|--------|-------------|
| A      | Activo      |
| I      | Inactivo    |

---

## 5. Generación de Contrato de Arrendamiento

### Endpoint
```
POST /api/generate-contract
```

### Descripción
Genera un contrato de arrendamiento en PDF con la información proporcionada, siguiendo el formato legal estándar para contratos de alquiler de vivienda en Costa Rica.

### Método
`POST`

### Content-Type
`application/json`

### Body (JSON)

| Campo                  | Tipo   | Requerido | Descripción                                      | Ejemplo                           |
|------------------------|--------|-----------|--------------------------------------------------|-----------------------------------|
| `arrendante`           | string | **Sí**    | Nombre completo del arrendante (dueño)          | "Juan Pérez García"               |
| `cedulaArrendante`     | string | **Sí**    | Cédula del arrendante                           | "1-0234-0567"                     |
| `arrendatario`         | string | **Sí**    | Nombre completo del arrendatario (inquilino)    | "María Rodríguez López"           |
| `cedulaArrendatario`   | string | **Sí**    | Cédula del arrendatario                         | "2-0456-0789"                     |
| `estadoCivil`          | string | **Sí**    | Estado civil del arrendatario                   | "Casada"                          |
| `direccion`            | string | **Sí**    | Dirección de procedencia del arrendatario       | "San Isidro de Pérez Zeledón"     |
| `aptoNumero`           | string | **Sí**    | Número o identificador del apartamento          | "101"                             |
| `contratoDesde`        | string | **Sí**    | Fecha de inicio del contrato                    | "01 de enero del 2024"            |
| `contratoHasta`        | string | **Sí**    | Fecha de finalización del contrato              | "31 de diciembre del 2026"        |
| `montoTotal`           | number | **Sí**    | Monto mensual de alquiler (en colones)          | 250000                            |
| `diaPago`              | number | **Sí**    | Día del mes para realizar el pago               | 15                                |
| `duracionAnios`        | number | **Sí**    | Duración del contrato en años                   | 3                                 |

### Ejemplo de Uso

```javascript
const contractData = {
  arrendante: "Juan Pérez García",
  cedulaArrendante: "1-0234-0567",
  arrendatario: "María Rodríguez López",
  cedulaArrendatario: "2-0456-0789",
  estadoCivil: "Casada",
  direccion: "San Isidro de Pérez Zeledón",
  aptoNumero: "101",
  contratoDesde: "01 de enero del 2024",
  contratoHasta: "31 de diciembre del 2026",
  montoTotal: 250000,
  diaPago: 15,
  duracionAnios: 3
};

const response = await fetch('/api/generate-contract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(contractData)
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `contrato_${contractData.aptoNumero}.pdf`;
a.click();
```

### Respuesta

**Content-Type:** `application/pdf`

**Content-Disposition:** `attachment; filename="contrato_<aptoNumero>.pdf"`

El PDF incluye:

- **Título:** "CONTRATO DE ARRENDAMIENTO"

- **Introducción:** Identificación de las partes (arrendante y arrendatario)

- **14 Cláusulas del Contrato:**
  1. Descripción de la propiedad y su inscripción registral
  2. Descripción del apartamento arrendado
  3. Precio del alquiler y forma de pago
  4. Plazo del contrato
  5. Prohibición de subarriendo
  6. (Reservada)
  7. Uso exclusivo como vivienda
  8. Servicios incluidos (agua y electricidad)
  9. Renovación del contrato
  10. Derecho de inspección del arrendante
  11. Depósito de garantía
  12. Obligación de avisar sobre desperfectos
  13. Responsabilidad por daños
  14. Cámaras de seguridad

- **Espacio para firmas:** Arrendante y Arrendatario con líneas de firma

---

## Notas Importantes

### Autenticación

Todos los endpoints requieren autenticación mediante token Bearer. El token debe incluirse en el header `Authorization`:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Formato de Fechas

Los parámetros de fecha utilizan el formato `YYYY-MM` (año-mes). Por ejemplo:
- `2024-01` para enero de 2024
- `2024-12` para diciembre de 2024

### Manejo de Errores

| Código | Descripción                                              |
|--------|----------------------------------------------------------|
| 200    | Éxito - PDF generado correctamente                       |
| 400    | Bad Request - Parámetros inválidos o faltantes          |
| 401    | Unauthorized - Token inválido o faltante                 |
| 404    | Not Found - Recurso no encontrado (ej: alq_id inválido)  |
| 500    | Internal Server Error - Error del servidor               |

### Tamaño y Orientación de PDFs

- **Reportes de listados** (Edificios, Clientes, Usuarios): A4 horizontal (landscape)
- **Reporte detallado** (Alquiler): A4 horizontal (landscape) con múltiples páginas
- **Contrato**: A4 vertical (portrait)

### Zona Horaria

Todas las fechas en los reportes se formatean en la zona horaria de Costa Rica (`America/Costa_Rica`) utilizando la localización en español (`es-CR`).

### Paginación Automática

Los reportes con múltiples registros tienen paginación automática. Cuando una página se llena, automáticamente se crea una nueva página para continuar con los datos.

---

## Ejemplos de Integración

### React/Next.js Component

```typescript
import { useState } from 'react';

export function DownloadReportButton({ alquilerId }: { alquilerId: number }) {
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export-rental?alq_id=${alquilerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_alquiler_${alquilerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={downloadReport} disabled={loading}>
      {loading ? 'Generando...' : 'Descargar Reporte'}
    </button>
  );
}
```

### Generar Contrato desde Formulario

```typescript
import { useState } from 'react';

export function GenerateContractForm() {
  const [formData, setFormData] = useState({
    arrendante: '',
    cedulaArrendante: '',
    arrendatario: '',
    cedulaArrendatario: '',
    estadoCivil: '',
    direccion: '',
    aptoNumero: '',
    contratoDesde: '',
    contratoHasta: '',
    montoTotal: 0,
    diaPago: 1,
    duracionAnios: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/generate-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato_${formData.aptoNumero}.pdf`;
    a.click();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit">Generar Contrato</button>
    </form>
  );
}
```

---

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades en los reportes, por favor contactar al equipo de desarrollo.

**Última actualización:** Diciembre 2024
