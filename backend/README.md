# Proyecto Software

## By

- Isaac Meléndez Gatgens
- Gerald Matarrita Alvarado
- Emmanuel López Ramírez 

## Información del Proyecto

- Última Edición: 8 / 10 / 2024
- Fecha de Creación: 14 / 8 / 2024

## Tecnologías Utilizadas

- Node (Versión v20.14.0)
- Express
- Joi
- Dotenv
- Cors
- Mongo con Mongoose

## Instrucciones para Iniciar la Aplicación

Siga estos pasos para ejecutar la aplicación en su máquina local.

### 1. Instalación de Dependencias

Primero, navegue hasta el directorio del proyecto backend y ejecute el siguiente comando para instalar las dependencias necesarias:

```
npm install
```

Luego una vez instaladas las dependencias

```
node server.js
```

por defecto corre en el puerto:

http://localhost:8080/

Configure el archivo '.env' dentro de la raíz del proyecto. Puede seguir el siguiente ejemplo.
El target se deberá configurar el entorno en que se ejecute el proyecto. PROD es para produción y DEV para Desarrollo.

```
DB = mongodb://ip_del_servidor/nombre_de_la_base
SALT = 4
TARGET = PROD
PORT = 8080
SMTP_HOST=smtp.proveedorDeServicioSMTP.com 
SMTP_PORT=587
SMTP_USER=correocreado@proveedorDeServicioSMTP.com
SMTP_PASS=[contraseña de aplicación generada desde el proveedor de correo]
RESET_PASSWORD_DEV_URL=http://localhost:4200/reset-password
RESET_PASSWORD_PROD_URL=http://ip_del_servidor:8080/reset-password
INVITATION_DEV_URL=http://localhost:4200/Invitations
INVITATION_PROD_URL=http://ip_del_servidor:8080/Invitations
```