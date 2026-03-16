import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding (llenado de datos de prueba)...');

  // Limpiar datos existentes (opcional, para evitar duplicados al correr varias veces)
  await prisma.asistencia.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.usuarioAdmin.deleteMany();

  // Crear Usuario Administrador de prueba
  const admin = await prisma.usuarioAdmin.create({
    data: {
      username: 'admin',
      password: 'password123', // En un entorno real debería estar hasheada (ej. bcrypt)
    },
  });
  console.log(`✅ Admin creado: ${admin.username}`);

  // Crear Empleados de prueba
  const empleado1 = await prisma.empleado.create({
    data: {
      documento: '12345678',
      nombre_completo: 'Juan Pérez',
    },
  });
  console.log(`✅ Empleado creado: ${empleado1.nombre_completo}`);

  const empleado2 = await prisma.empleado.create({
    data: {
      documento: '87654321',
      nombre_completo: 'María Gómez',
    },
  });
  console.log(`✅ Empleado creado: ${empleado2.nombre_completo}`);

  const empleado3 = await prisma.empleado.create({
    data: {
      documento: '11223344',
      nombre_completo: 'Carlos López',
    },
  });
  console.log(`✅ Empleado creado: ${empleado3.nombre_completo}`);

  // Generar un par de asistencias de prueba
  await prisma.asistencia.create({
    data: {
      employee_id: empleado1.id,
      tipo: 'ENTRADA',
    },
  });
  
  await prisma.asistencia.create({
    data: {
      employee_id: empleado2.id,
      tipo: 'ENTRADA',
    },
  });

  console.log('✅ Asistencias iniciales registradas');
  console.log('Seeding terminado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
