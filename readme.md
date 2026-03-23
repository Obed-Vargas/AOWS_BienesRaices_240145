# Proyecto de clase: sistema de bienes raices

En este proyecto pondran en practica la creacion de APIs propias asi como el consumo de las APIs de terceros Gestion de mapas, Envio de correos, Autentificacion por redes sociales, Gestion de archivos, Seguridad, Control de sesiones, y Validaciones. En el contexto real de compra, venta o renta de propiedades.


## Consideraciones

El proyecto estar basado en una Arquitectura SOA (Service Oriental Architecture), el patron de Diseño MVC (Model, View, Controlador) y servicios API´s REST, debera gestionar debidamente en el uso del control de versiones de ramas.

## Tabla de Fases

| No. | Descripción | Potenciador | Estatus |
|-----|-------------|------------|---------|
|1|Configuración inicial del proyecto (NodeJS) | 2 | ✅ finalizado  |
|2|Routing y request (Particiones)  | 5 | ✅ finalizado  |
|3|Layouts, Template Engines y Tailwind (frontemd) | 5 | ✅ finalizado  |
|4|Creacion de paginas login y creacion de usuarios|  6 | ✅ finalizado  |
|5|ORM´s y Base de datos| 4  |  ✅ |
|6|Insertando registros en la tabla de usuarios|   | ✅  |
|7|Implementacion de la funcionalidad (Feature), Recuperacion de contraseña (Password recovery)|  20 | ✅  |
|8|Auntenticacion de los usuarios (Auth)|  ❌ | ❌  |
|9|Definicion de clase propiedades (Property)|  ❌ | ❌  |
|10|Operaciones CRUD (Create, Read, Update, Delete) de propiedades|  ❌ | ❌  |
|11|Proteccion de rutas y validacion de tokens de sesion (JWT)|  ❌ | ❌  |
|12|Añadir imagenes a la propiedad (Gestion de archivos)    |  ❌ | ❌  |
|13|Elaboracion panel de Administracion (Dashboard)   |  ❌ | ❌  |
|14|Formulrio de edicion de propiedades   |  ❌ | ❌  |
|15|Fromulario de eliminacion de propiedades|  ❌ | ❌  |
|16|Pagina de consulta de la propiedad   |  ❌ | ❌  |
|17|Implementacion del paginador   |  ❌ | ❌  |
|18|Creando la pagina inicial (index)   |  ❌ | ❌  |
|19|Creando las paginas de ctegorias y paginas de error (404)   |❌   | ❌  |
|20|Envio de email para un formulario de contacto   |❌   | ❌  |
|21|Cambiar el estatus de la propiedad   |❌   | ❌  |
|22|Barras de Navegacion y cierre de sesion   |❌   | ❌  |
|23|Publicacion del API y el frontend   |❌   | ❌  |


## Evaluación del Módulo de Login (Pruebas y Resultados)

A continuación se presentan las evidencias de las distintas pruebas funcionales realizadas sobre el módulo de Autenticación, cumpliendo con los requerimientos de la evaluación práctica.

### Test 1: Interacción Rotativa (Registro, Login y Recuperación)
1. login:
![Interaccion rotativa](/img/r1.png)
2. registro:
![Interaccion rotativa](/img/r2.png)
3. recuperacion:
![Interaccion rotativa](/img/r3.png)

### Test 2: Registro Exitoso de un Nuevo Usuario
1. ingreso a la pantalla de registro:
![Interaccion rotativa](/img/r1.png)
2. llenado de los campos:
![Interaccion rotativa](/img/re1.png)
3. confirmacion de registro:
![Interaccion rotativa](/img/re2.png)
4. registro en la BD:
![Interaccion rotativa](/img/re3.png)


### Test 3: Registro Fallido de un Nuevo Usuario por Formulario mal llenado
1. errores de Login:
![Interaccion rotativa](/img/erroresLogin.png)
2. errores de registro:
![Interaccion rotativa](/img/erroresRegistro.png)
3. errores de recuperacion:
![Interaccion rotativa](/img/erroresRecuperacion.png)

### Test 4: Registro Fallido por correo duplicado
1. correo duplicado:
![Interaccion rotativa](/img/correoDuplicado.png)

### Test 5: Validación de Usuario por Email
1. activar la cuenta en mailtrap:
![Interaccion rotativa](/img/activarCuenta1.png)
2. confirmacion de registro:
![Interaccion rotativa](/img/activarCuenta2.png)
3. prueba en BD:
![Interaccion rotativa](/img/activarCuenta3.png)

### Test 6: Actualización exitosa de contraseña de un usuario validado
1. llenado de campos:
![Interaccion rotativa](/img/recuperarContraseña1.png)
2. confirmacion de actualizacion:
![Interaccion rotativa](/img/recuperarContraseña2.png)
3. correo en mailtrap:
![Interaccion rotativa](/img/rc3.png)
4. formulario de actualizacion:
![Interaccion rotativa](/img/rc4.png)
5. llenar contraseña:
![Interaccion rotativa](/img/rc5.png)
6. confirmacion de exito:
![Interaccion rotativa](/img/rc6.png)

### Test 7: Actualización fallida de contraseña de un usuario no validado
1. prueba de nuevo usuario sin confirmar cuenta en BD:
![Interaccion rotativa](/img/unc1.png)
2. error de confirmacion de contraseña:
![Interaccion rotativa](/img/unc2.png)

### Test 8: Actualización fallida por errores de formulario o token inválido
1. cobtraseña muy corta:
![Interaccion rotativa](/img/ci1.png)


### Test 9: Logeo Exitoso del Usuario mostrado en página de Mis Propiedades
1. llenado de campos en el login:
![Interaccion rotativa](/img/logeo1.png)
2. entrada a la pagina de mis propiedades:
![Interaccion rotativa](/img/logeo2.png)

### Test 10: Bloqueo de cuenta por exceso de intentos fallidos (5 intentos)
1. bloqueo de cuenta por exceso de intentos fallidos:
![Interaccion rotativa](/img/bloqueo1.png)
2. email en mailtrap informado el problema:
![Interaccion rotativa](/img/bloqueo2.png)
3. confirmacion de desbloqueo:
![Interaccion rotativa](/img/bloqueo3.png)



## Creado por:
**Obed Vargas Luna**

**Matricula:** 240145

**Materia:** Aplicaciones Web Orientada a Servicios

**profesor:** Marco Antonio Ramírez

**Fecha:** 22/03/2026

