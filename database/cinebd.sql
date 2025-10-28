-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-10-2025 a las 23:27:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cinebd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asientos`
--

CREATE TABLE `asientos` (
  `id_asiento` int(11) NOT NULL,
  `id_sala` int(11) NOT NULL,
  `fila` enum('A','B','C','D','E','F','G','H','I') NOT NULL,
  `numero` int(11) NOT NULL,
  `tipo_asiento` enum('Normal','Discapacitado','Vip') DEFAULT 'Normal',
  `estado` enum('Activo','Fuera_servicio') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cine`
--

CREATE TABLE `cine` (
  `id_cine` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `telefono` varchar(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `apellido` varchar(25) NOT NULL,
  `email` varchar(40) NOT NULL,
  `telefono` varchar(13) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `id_membresia` int(11) DEFAULT NULL,
  `contrasenia` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descuento_aplicado`
--

CREATE TABLE `descuento_aplicado` (
  `id_descuento_aplicado` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `id_tipo_descuento` int(11) NOT NULL,
  `monto_descontado` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id_estado` int(11) NOT NULL,
  `Nombre` enum('Durango','Nuevo Leon','Guadalajara','CDMX','Tabasco','Yucatan','Oaxaca') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `funcion`
--

CREATE TABLE `funcion` (
  `id_funcion` int(11) NOT NULL,
  `id_sala` int(11) NOT NULL,
  `id_pelicula` int(11) NOT NULL,
  `id_horario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Disponible','Llena','Cancelada','Finalizada') DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresia`
--

CREATE TABLE `membresia` (
  `id_membresia` int(11) NOT NULL,
  `tipo` enum('Ninguna','Vip','Platino') DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT 0.00,
  `beneficios` text DEFAULT NULL,
  `precio_mensual` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peliculas`
--

CREATE TABLE `peliculas` (
  `id_pelicula` int(11) NOT NULL,
  `titulo` varchar(90) NOT NULL,
  `duracion_minutos` int(11) NOT NULL,
  `clasificacion` enum('AA','A','B','B-15','C','D') DEFAULT NULL,
  `genero` enum('Drama','Comedia','Accion','Romance','Ciencia ficcion','Suspenso','Animacion','Terror','Fantasia') DEFAULT NULL,
  `idioma` enum('Original','Espa?ol','Ingles') DEFAULT NULL,
  `subtitulos` enum('Espa?ol','Ingles','No disponible') DEFAULT NULL,
  `sinopsis` text DEFAULT NULL,
  `director` varchar(60) DEFAULT NULL,
  `anio_estreno` int(11) DEFAULT NULL,
  `estado` enum('En_cartelera','Proximo_estreno','Fuera_cartelera') DEFAULT 'En_cartelera'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salas`
--

CREATE TABLE `salas` (
  `id_sala` int(11) NOT NULL,
  `id_cine` int(11) NOT NULL,
  `categoria` enum('Platino','Normal','3D') DEFAULT NULL,
  `numeracion` int(11) NOT NULL,
  `capacidad_total` int(11) NOT NULL,
  `estado` enum('Activa','Mantenimiento') DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket`
--

CREATE TABLE `ticket` (
  `id_ticket` int(11) NOT NULL,
  `id_funcion` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_compra` datetime DEFAULT current_timestamp(),
  `precio_base` decimal(10,2) NOT NULL,
  `descuento_aplicado` decimal(10,2) DEFAULT 0.00,
  `monto_total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Tarjeta','Efectivo') DEFAULT NULL,
  `estado` enum('Pagado','Pendiente','Cancelado','Usado') DEFAULT 'Pagado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_asientos`
--

CREATE TABLE `ticket_asientos` (
  `id_ticket_asiento` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `id_asiento` int(11) NOT NULL,
  `estado` enum('Reservado','Ocupado','Cancelado') DEFAULT 'Reservado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_descuento`
--

CREATE TABLE `tipo_descuento` (
  `id_tipo_descuento` int(11) NOT NULL,
  `nombre` enum('Estudiante','Adulto Mayor','Ni?o','Promocion') DEFAULT NULL,
  `porcentaje_descuento` decimal(5,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dias_aplicables` enum('Todos los dias','Miercoles','Sabado','Domingo') DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asientos`
--
ALTER TABLE `asientos`
  ADD PRIMARY KEY (`id_asiento`),
  ADD UNIQUE KEY `unique_asiento` (`id_sala`,`fila`,`numero`),
  ADD KEY `idx_asientos_sala` (`id_sala`);

--
-- Indices de la tabla `cine`
--
ALTER TABLE `cine`
  ADD PRIMARY KEY (`id_cine`),
  ADD KEY `id_estado` (`id_estado`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_membresia` (`id_membresia`);

--
-- Indices de la tabla `descuento_aplicado`
--
ALTER TABLE `descuento_aplicado`
  ADD PRIMARY KEY (`id_descuento_aplicado`),
  ADD KEY `id_ticket` (`id_ticket`),
  ADD KEY `id_tipo_descuento` (`id_tipo_descuento`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `funcion`
--
ALTER TABLE `funcion`
  ADD PRIMARY KEY (`id_funcion`),
  ADD UNIQUE KEY `unique_funcion` (`id_sala`,`fecha`,`id_horario`),
  ADD KEY `id_pelicula` (`id_pelicula`),
  ADD KEY `id_horario` (`id_horario`),
  ADD KEY `idx_funcion_fecha` (`fecha`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`);

--
-- Indices de la tabla `membresia`
--
ALTER TABLE `membresia`
  ADD PRIMARY KEY (`id_membresia`);

--
-- Indices de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  ADD PRIMARY KEY (`id_pelicula`);

--
-- Indices de la tabla `salas`
--
ALTER TABLE `salas`
  ADD PRIMARY KEY (`id_sala`),
  ADD KEY `id_cine` (`id_cine`);

--
-- Indices de la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id_ticket`),
  ADD KEY `idx_ticket_cliente` (`id_cliente`),
  ADD KEY `idx_ticket_funcion` (`id_funcion`);

--
-- Indices de la tabla `ticket_asientos`
--
ALTER TABLE `ticket_asientos`
  ADD PRIMARY KEY (`id_ticket_asiento`),
  ADD UNIQUE KEY `unique_ticket_asiento` (`id_ticket`,`id_asiento`),
  ADD KEY `id_asiento` (`id_asiento`);

--
-- Indices de la tabla `tipo_descuento`
--
ALTER TABLE `tipo_descuento`
  ADD PRIMARY KEY (`id_tipo_descuento`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asientos`
--
ALTER TABLE `asientos`
  MODIFY `id_asiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cine`
--
ALTER TABLE `cine`
  MODIFY `id_cine` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `descuento_aplicado`
--
ALTER TABLE `descuento_aplicado`
  MODIFY `id_descuento_aplicado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `funcion`
--
ALTER TABLE `funcion`
  MODIFY `id_funcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `membresia`
--
ALTER TABLE `membresia`
  MODIFY `id_membresia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  MODIFY `id_pelicula` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `salas`
--
ALTER TABLE `salas`
  MODIFY `id_sala` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ticket_asientos`
--
ALTER TABLE `ticket_asientos`
  MODIFY `id_ticket_asiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_descuento`
--
ALTER TABLE `tipo_descuento`
  MODIFY `id_tipo_descuento` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asientos`
--
ALTER TABLE `asientos`
  ADD CONSTRAINT `asientos_ibfk_1` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`);

--
-- Filtros para la tabla `cine`
--
ALTER TABLE `cine`
  ADD CONSTRAINT `cine_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_membresia`) REFERENCES `membresia` (`id_membresia`);

--
-- Filtros para la tabla `descuento_aplicado`
--
ALTER TABLE `descuento_aplicado`
  ADD CONSTRAINT `descuento_aplicado_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`),
  ADD CONSTRAINT `descuento_aplicado_ibfk_2` FOREIGN KEY (`id_tipo_descuento`) REFERENCES `tipo_descuento` (`id_tipo_descuento`);

--
-- Filtros para la tabla `funcion`
--
ALTER TABLE `funcion`
  ADD CONSTRAINT `funcion_ibfk_1` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`),
  ADD CONSTRAINT `funcion_ibfk_2` FOREIGN KEY (`id_pelicula`) REFERENCES `peliculas` (`id_pelicula`),
  ADD CONSTRAINT `funcion_ibfk_3` FOREIGN KEY (`id_horario`) REFERENCES `horarios` (`id_horario`);

--
-- Filtros para la tabla `salas`
--
ALTER TABLE `salas`
  ADD CONSTRAINT `salas_ibfk_1` FOREIGN KEY (`id_cine`) REFERENCES `cine` (`id_cine`);

--
-- Filtros para la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`id_funcion`) REFERENCES `funcion` (`id_funcion`),
  ADD CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Filtros para la tabla `ticket_asientos`
--
ALTER TABLE `ticket_asientos`
  ADD CONSTRAINT `ticket_asientos_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`),
  ADD CONSTRAINT `ticket_asientos_ibfk_2` FOREIGN KEY (`id_asiento`) REFERENCES `asientos` (`id_asiento`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
