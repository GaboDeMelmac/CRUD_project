const express = require("express");
const path = require("path"); // Importamos el módulo path
const fs = require("fs");

const app = express();
const port = 6600;

// Servir archivos estáticos desde una carpeta específica (si es necesario)
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`¡Servidor encendido en http://localhost:${port}`);
});

// ---------- 1. GET --- DEVUELVE TODAS LAS CANCIONES REGISTRADAS-----------------
app.get("/canciones", (req, res) => {
  const canciones = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "canciones.json"))
  );
  res.json(canciones); // Devuelve el JSON con todas las canciones
});

// ---------- 2. POST ---AGREGA CANCIONES AL REPERTORIO -----------------
// ---------- 2. POST ---AGREGA CANCIONES AL REPERTORIO -----------------
app.use(express.json()); // Para que Express pueda manejar datos en formato JSON

app.post("/canciones", (req, res) => {
  const nuevaCancion = req.body; // Obtenemos la nueva canción desde el cuerpo de la solicitud

  // Leer el repertorio actual desde el archivo JSON
  const canciones = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "canciones.json"))
  );

  // Asignar un nuevo ID numérico (basado en el último ID existente)
  // Si no hay canciones, el ID será 1, de lo contrario el último ID + 1
  const nuevoId =
    canciones.length > 0 ? canciones[canciones.length - 1].id + 1 : 1;
  nuevaCancion.id = nuevoId; // Asigna el nuevo id

  // Añadir la nueva canción al arreglo de canciones
  canciones.push(nuevaCancion);

  // Guardar la nueva lista de canciones en el archivo JSON
  fs.writeFileSync(
    path.join(__dirname, "data", "canciones.json"),
    JSON.stringify(canciones, null, 2)
  );

  // Devolver la canción recién agregada con un estado 201
  res.status(201).json(nuevaCancion);
});

// ---------- 3. PUT --- Edita canciones existentes por su ID -----------------
app.put("/canciones/:id", (req, res) => {
  const id = parseInt(req.params.id); // ID de la canción que queremos actualizar
  const canciones = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "canciones.json"))
  );

  // Encontrar la canción por ID
  const cancionIndex = canciones.findIndex((c) => c.id === id);
  if (cancionIndex === -1) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  // Actualizamos la canción con los nuevos datos
  const cancionActualizada = { ...canciones[cancionIndex], ...req.body };
  canciones[cancionIndex] = cancionActualizada;

  // Guardamos el archivo actualizado
  fs.writeFileSync(
    path.join(__dirname, "data", "canciones.json"),
    JSON.stringify(canciones, null, 2)
  );

  res.json(cancionActualizada); // Devolvemos la canción actualizada
});

// ---------- 4. DELETE --- Elimina cancioens por su ID -----------------
app.delete("/canciones/:id", (req, res) => {
  const id = parseInt(req.params.id); // ID de la canción que queremos eliminar
  const canciones = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "canciones.json"))
  );

  // Filtramos la canción por ID
  const cancionesRestantes = canciones.filter((c) => c.id !== id);

  if (cancionesRestantes.length === canciones.length) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  // Guardamos el archivo actualizado sin la canción eliminada
  fs.writeFileSync(
    path.join(__dirname, "data", "canciones.json"),
    JSON.stringify(cancionesRestantes, null, 2)
  );

  res.status(200).json({ message: "Canción eliminada exitosamente" });
});
