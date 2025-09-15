// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Carga tu clave de servicio desde el archivo JSON
// Asegúrate de que este archivo está en la misma carpeta que server.js
const credentials = require('./lia-ybcn-c346ff2896f1.json');

// Configuración del cliente de Dialogflow usando tus credenciales
const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
  projectId: credentials.project_id,
});

// Define el endpoint POST para /send que manejará los mensajes del chat
app.post("/send", async (req, res) => {
  const message = req.body.message;
  console.log("📩 Mensaje recibido del cliente:", message);

  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(
    credentials.project_id, // Usa el Project ID de tu clave JSON
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "es", // Establece el idioma a español
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult.fulfillmentText;
    console.log("🤖 Respuesta de Dialogflow:", result);
    res.json({ reply: result });
  } catch (err) {
    console.error("❌ ERROR en Dialogflow:", err);
    res.json({ reply: "Error al conectar con el bot 😢" });
  }
});

// Sirve el archivo index.html en la ruta principal (/)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Sirve los archivos estáticos como app.js y style.css
app.use(express.static(path.join(__dirname)));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});