// app.js
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    const serverUrl = 'http://localhost:3000/dialogflow';

    // Función para añadir un mensaje al chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll automático al final
    }

    // Función para enviar la consulta al servidor
    async function sendMessage() {
        const queryText = userInput.value.trim();
        if (queryText === '') {
            return;
        }

        // Añadir el mensaje del usuario al chat
        addMessage('user', queryText);
        userInput.value = ''; // Limpiar el input

        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ queryText }),
            });

            if (!response.ok) {
                throw new Error('Respuesta de la red no fue correcta');
            }

            const data = await response.json();
            const botResponse = data.fulfillmentText || 'Lo siento, no entendí eso.';

            // Añadir la respuesta del bot al chat
            addMessage('bot', botResponse);

        } catch (error) {
            console.error('Error:', error);
            addMessage('bot', 'Hubo un problema al conectar con el servidor.');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});