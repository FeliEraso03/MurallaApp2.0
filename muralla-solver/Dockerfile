# Dockerfile para el servicio P-Graph Solver con Wine

FROM ubuntu:22.04

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias necesarias
RUN dpkg --add-architecture i386 && \
    apt-get update && apt-get install -y \
    wget \
    wine64 \
    wine32 \
    openjdk-21-jre \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json primero para instalar dependencias
COPY package.json .

# Instalar dependencias de Node.js
RUN npm install

# Copiar archivos del servidor
COPY server.js .
COPY public ./public
COPY WDG2PNSv2.jar .
COPY pgraph_solver.exe .
COPY *.dll .

# Crear directorio para archivos temporales
RUN mkdir -p /app/copy

# Configurar Wine (inicializar Wine)
RUN wine wineboot --init

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV COPY_DIR=/app/copy
ENV JAR_FILE=/app/WDG2PNSv2.jar
ENV EXE_FILE=/app/pgraph_solver.exe
ENV PORT=3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]
