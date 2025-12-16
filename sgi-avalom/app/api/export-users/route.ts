// app/api/export-users/route.ts
import { NextRequest } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from '@/lib/prisma'
import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const fechaGeneracion = new Date()

  // 1) Traer usuarios con más información
  const usuarios = await prisma.ava_usuario.findMany({
    orderBy: { usu_nombre: 'asc' },
    select: {
      usu_nombre: true,
      usu_papellido: true,
      usu_sapellido: true,
      usu_correo: true,
      usu_telefono: true,
      usu_estado: true,
      usu_rol: true,
      usu_fechacreacion: true,
    },
  })

  // Calcular estadísticas
  const totalUsuarios = usuarios.length
  const usuariosActivos = usuarios.filter((u) => u.usu_estado === 'A').length
  const usuariosInactivos = totalUsuarios - usuariosActivos
  
  const rolesCounts = {
    A: usuarios.filter((u) => u.usu_rol === 'A').length,
    J: usuarios.filter((u) => u.usu_rol === 'J').length,
    E: usuarios.filter((u) => u.usu_rol === 'E').length,
    R: usuarios.filter((u) => u.usu_rol === 'R').length,
  }

  // 2) Crear PDF y página
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([841.89, 595.28]) // A4 landscape
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  // Márgenes y columnas
  const marginX = 50
  const marginTop = height - 50
  const rowH = 18
  const colWs = [30, 130, 150, 80, 50, 80, 80]  // No., Nombre, Correo, Tel, Est, Rol, F.Creación
  const colXs = colWs.reduce<number[]>((acc, w, i) => {
    if (i === 0) return [marginX]
    return [...acc, acc[i - 1] + colWs[i - 1]]
  }, [])
  const tableWidth = colWs.reduce((a, b) => a + b, 0)

  let cursorY = marginTop

  // Título principal
  page.drawText('REPORTE DE USUARIOS DEL SISTEMA', {
    x: marginX,
    y: cursorY + 20,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  // Fecha de generación
  const fechaGenStr = formatInTimeZone(
    fechaGeneracion,
    'America/Costa_Rica',
    'PPpp',
    { locale: es }
  )
  page.drawText(`Generado: ${fechaGenStr}`, {
    x: marginX,
    y: cursorY,
    size: 9,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  })

  cursorY -= 30

  // Sección de estadísticas
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 65,
    width: tableWidth + 20,
    height: 70,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  })

  page.drawText('ESTADÍSTICAS GENERALES', {
    x: marginX,
    y: cursorY - 15,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  })

  cursorY -= 35

  const estadisticas = [
    `Total de Usuarios: ${totalUsuarios}`,
    `Usuarios Activos: ${usuariosActivos}`,
    `Usuarios Inactivos: ${usuariosInactivos}`,
    `Administradores: ${rolesCounts.A}`,
    `Jefes: ${rolesCounts.J}`,
    `Empleados: ${rolesCounts.E}`,
    `Reportes: ${rolesCounts.R}`,
  ]

  const colGap = 120
  estadisticas.forEach((stat, i) => {
    const x = marginX + (i % 4) * colGap
    const y = cursorY - Math.floor(i / 4) * 18
    page.drawText(stat, {
      x,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
  })

  cursorY -= 50

  // 3) Cabecera de tabla
  page.drawLine({
    start: { x: marginX - 5, y: cursorY + 5 },
    end: { x: marginX - 5 + tableWidth + 5, y: cursorY + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  page.drawLine({
    start: { x: marginX - 5, y: cursorY - rowH + 5 },
    end: { x: marginX - 5 + tableWidth + 5, y: cursorY - rowH + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  const headers = ['No.', 'Nombre', 'Correo', 'Teléfono', 'Estado', 'Rol', 'F. Creación']
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colXs[i],
      y: cursorY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
  })

  cursorY -= rowH

  // 4) Filas
  usuarios.forEach((u, idx) => {
    if (cursorY < 50) {
      page = pdfDoc.addPage([841.89, 595.28])
      cursorY = height - 50
    }

    const nombreCompleto = [u.usu_nombre, u.usu_papellido, u.usu_sapellido]
      .filter(Boolean).join(' ')
    const estado = u.usu_estado === 'A' ? 'Activo' : 'Inactivo'
    
    const rolMap: Record<string, string> = {
      A: 'Admin',
      J: 'Jefe',
      E: 'Empleado',
      R: 'Reportes',
    }
    const rol = rolMap[u.usu_rol] || u.usu_rol

    const fechaCreacion = u.usu_fechacreacion
      ? formatInTimeZone(u.usu_fechacreacion, 'UTC', 'dd/MM/yyyy', { locale: es })
      : '—'

    const row = [
      String(idx + 1),
      nombreCompleto,
      u.usu_correo,
      u.usu_telefono ?? '—',
      estado,
      rol,
      fechaCreacion,
    ]

    row.forEach((text, i) => {
      page.drawText(text, {
        x: colXs[i],
        y: cursorY,
        size: 9,
        font: helvetica,
        color: rgb(0, 0, 0),
        maxWidth: colWs[i] - 5,
      })
    })

    page.drawLine({
      start: { x: marginX - 5, y: cursorY - 2 },
      end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    })

    cursorY -= rowH
  })

  // 5) Responder con el PDF
  const pdfBytes = await pdfDoc.save()
  const filename = `Reporte_usuarios_${formatInTimeZone(fechaGeneracion, 'UTC', 'yyyy-MM-dd', { locale: es })}.pdf`
  
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
