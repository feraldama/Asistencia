import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Endpoint para registrar asistencia (Entrada/Salida)
app.post('/api/attendance', async (req, res) => {
  try {
    const { documento, tipo } = req.body;

    if (!documento || !tipo) {
      return res.status(400).json({ error: 'Documento y tipo son requeridos' });
    }

    if (tipo !== 'ENTRADA' && tipo !== 'SALIDA') {
      return res.status(400).json({ error: 'Tipo de asistencia inválido' });
    }

    // Buscar empleado por documento
    const empleado = await prisma.empleado.findUnique({
      where: { documento }
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Crear el registro de asistencia
    const asistencia = await prisma.asistencia.create({
      data: {
        employee_id: empleado.id,
        tipo
      }
    });

    res.status(201).json({ 
      mensaje: `Asistencia de ${tipo} registrada exitosamente para ${empleado.nombre_completo}`,
      asistencia 
    });

  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para traer información de todos los empleados (opcional, para selectores o busqueda)
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.empleado.findMany();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint temporal para crear un empleado de prueba
app.post('/api/employees', async (req, res) => {
  try {
    const { documento, nombre_completo } = req.body;
    const empleado = await prisma.empleado.create({
      data: { documento, nombre_completo }
    });
    res.status(201).json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno o el documento ya existe' });
  }
});

// Editar un empleado existente
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { documento, nombre_completo } = req.body;

    const empleado = await prisma.empleado.update({
      where: { id: Number(id) },
      data: { documento, nombre_completo }
    });

    res.json(empleado);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El documento ya está registrado en otro empleado' });
    }
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

// Eliminar un empleado
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.empleado.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar. Es posible que tenga asistencias registradas.' });
  }
});
// --- RUTAS DE REPORTES ---

// Reporte General por rango de fechas
app.get('/api/reports/general', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Faltan fechas de inicio o fin' });
    }

    // Convertimos a fechas considerando la zona horaria local para cubrir todo el día
    const initDate = new Date(`${startDate}T00:00:00.000`);
    const finishDate = new Date(`${endDate}T23:59:59.999`);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        timestamp: {
          gte: initDate,
          lte: finishDate,
        }
      },
      include: {
        empleado: { select: { nombre_completo: true, documento: true } }
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando reporte general' });
  }
});

// Reporte Individual por Empleado y rango de fechas
app.get('/api/reports/employee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Faltan fechas de inicio o fin' });
    }

    const initDate = new Date(`${startDate}T00:00:00.000`);
    const finishDate = new Date(`${endDate}T23:59:59.999`);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        employee_id: Number(id),
        timestamp: {
          gte: initDate,
          lte: finishDate,
        }
      },
      include: {
        empleado: { select: { nombre_completo: true, documento: true } }
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando reporte individual' });
  }
});

// --- RUTAS DE ADMINISTRADORES ---

// Endpoint de login para admins (usamos POST para enviar credenciales de forma segura)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.usuarioAdmin.findUnique({
      where: { username }
    });

    // Validar existencia y contraseña (en producción usar compare de bcrypt)
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ success: true, message: 'Login exitoso', username: admin.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener lista de admins (sin contraseñas)
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await prisma.usuarioAdmin.findMany({
      select: { id: true, username: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo admin
app.post('/api/admins', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const admin = await prisma.usuarioAdmin.create({
      data: { username, password }
    });
    
    // Devolver objeto sin contraseña
    res.status(201).json({ id: admin.id, username: admin.username });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ error: 'Error interno al crear admin' });
  }
});

// Cambiar contraseña de un admin
app.put('/api/admins/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La nueva contraseña es requerida' });
    }

    await prisma.usuarioAdmin.update({
      where: { id: Number(id) },
      data: { password }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
});

// Eliminar un admin
app.delete('/api/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.usuarioAdmin.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Administrador eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar administrador' });
  }
});
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
