REPORTE TÉCNICO — Integración de Tavus CVI en Aquila360

Efrén Rivas · Programación Asistida con IA, Módulo 2 · Ing. Roberto Aguirre Rodríguez · UACH · 19 deAgosto 2026
Sistema: Aquila360 (GestorPyme) — https://gestorpyme-cfee.onrender.com

API elegida y justificación

Elegí Tavus (Conversational Video Interface). El sistema ya contaba con un asistente de texto que responde consultas sobre el uso de la aplicación; Tavus permite darle rostro y voz al mismo conocimiento, ofreciendo al usuario del despacho una alternativa hablada en lugar de leer instrucciones. Es una extensión del asistente existente, no un módulo aislado.

Descarté Google Veo 3 porque requiere facturación habilitada en Google Cloud y su generación asíncrona tarda entre 60 y 180 segundos, lo que impide una demostración fluida. Tavus ofrece un plan Free con 20 minutos de video conversacional y soporte de español confirmado en su documentación.

Problema 1: la API key no puede vivir en el frontend

La guía del proyecto menciona que la opción más sencilla para integrar Tavus es el widget <tavus-widget>, que se agrega con una sola etiqueta de script. Al revisarlo identifiqué un problema: ese código se descarga y ejecuta en el navegador del usuario, por lo que cualquier credencial que contenga queda visible al abrir las herramientas de desarrollo. La propia guía lo advierte: nunca debe colocarse TAVUS_API_KEY en el frontend.

El riesgo es concreto. Con la llave expuesta, cualquier persona podría crear conversaciones contra mi cuenta y agotar los 20 minutos del plan gratuito.

Resolución: construí un endpoint propio en src/routes/api/tavus/+server.js. El navegador hace una petición POST a esa ruta de mi propia aplicación, sin enviar ningún dato. El servidor verifica que exista sesión activa mediante Clerk, lee la TAVUS_API_KEY desde $env/dynamic/private, llama a la API de Tavus y devuelve únicamente el conversation_url. La credencial nunca sale del servidor: al inspeccionar la respuesta en la consola del navegador solo aparecen conversationUrl y conversationId.

Aprendizaje: todo lo que se ejecuta en el navegador es visible para el usuario. Un servicio con cuota medida necesita que sus credenciales vivan en el servidor, y la forma de lograrlo es que el cliente hable con tu backend, no directamente con el proveedor.

Problema 2: el PAL configurado en el editor visual no persistía

Configuré el asistente desde el PAL Builder de Tavus: identidad, personalidad, reglas de comportamiento y el conocimiento de la aplicación. El indicador superior mostraba permanentemente "Not saved yet" y no localicé un botón de guardado. Al salir del editor, la sección PALs quedó vacía: la configuración se había perdido.

Resolución: consultando la documentación de la API entendí que Tavus maneja dos versiones de cada PAL. El editor guarda un borrador (draft), mientras que la API pública y las conversaciones usan la versión publicada (live). El "Not saved yet" indicaba cambios sin publicar, no una falla. Creé el PAL mediante POST /v2/pals enviando el system_prompt, el default_face_id y el nombre. La respuesta devolvió el identificador pa50349a3ec9, y al consultarlo con GET /v2/pals/{id} confirmé is_published: true: crear por API publica directamente.

Aprendizaje: cuando una interfaz gráfica no da retroalimentación clara, la documentación de la API revela el modelo de datos real. Trabajar directo contra la API resultó más rápido y verificable.

Problema 3: consumo de minutos por conversaciones sin cerrar

El plan Free de Tavus incluye 20 minutos de video conversacional. Al probar la integración detecté que cerrar el iframe en el navegador no termina la conversación del lado de Tavus: la sesión permanece activa en su servidor y sigue consumiendo minutos aunque el usuario ya no la vea.

Resolución: agregué un método DELETE al endpoint /api/tavus que llama a POST /v2/conversations/{id}/end de la API de Tavus. En el componente, la función terminarVideo() invoca ese método y limpia el estado. Además hice que la función que cierra el panel del asistente dispare el cierre si hay una conversación activa, para que no quede ninguna sesión abierta por olvido.

Aprendizaje: en servicios con cuota medida por tiempo, hay que cerrar los recursos explícitamente. Que la interfaz deje de mostrar algo no significa que el recurso se haya liberado.

Qué haría diferente

Precargaría el nombre del participante al crear la conversación. Actualmente el lobby de Daily.co solicita que el usuario lo escriba antes de entrar a la videollamada, lo que agrega un paso innecesario: el sistema ya conoce al usuario mediante Clerk y podría enviarlo directamente en la petición.

Registraría las conversaciones en la base de datos. Guardar el conversation_id, el usuario que la inició y las marcas de tiempo permitiría llevar control del consumo de minutos. Actualmente ese dato solo puede consultarse desde el panel de Tavus.

Utilizaría test_mode: true desde el inicio del desarrollo. Esta opción crea conversaciones sin que el avatar se conecte, lo que habría evitado consumir minutos reales durante las pruebas de integración.