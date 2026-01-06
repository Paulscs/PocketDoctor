export interface HelpArticle {
  id: string;
  title: string;
  content: string; // Markdown-like or just rich text description
  steps?: string[];
  tips?: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: string; // Ionicons name
  description: string;
  articles: HelpArticle[];
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos',
    icon: 'rocket-outline',
    description: 'Todo lo que necesitas saber para empezar a usar Pocket Doctor.',
    articles: [
      {
        id: 'create-account',
        title: 'Cómo crear una cuenta',
        content: 'Bienvenido a Pocket Doctor. Crear una cuenta es el primer paso para gestionar tu salud de manera inteligente.',
        steps: [
          'Abre la aplicación y toca "Registrarse".',
          'Ingresa tu correo electrónico, contraseña y nombre completo.',
          'Selecciona tu fecha de nacimiento (es importante para tu perfil médico).',
          'Acepta los Términos y Condiciones.',
          'Toca el botón "Registrarse".'
        ],
        tips: ['Asegúrate de usar un correo electrónico al que tengas acceso permanente.']
      },
      {
        id: 'complete-profile',
        title: 'Completar tu perfil médico',
        content: 'Un perfil completo ayuda a la IA a darte mejores recomendaciones.',
        steps: [
          'Ve a la pestaña "Perfil".',
          'Toca en "Editar Perfil" o "Información Médica".',
          'Completa tu tipo de sangre, alergias y condiciones preexistentes.',
          'Guarda los cambios.'
        ]
      }
    ]
  },
  {
    id: 'health-management',
    title: 'Gestión de Salud',
    icon: 'heart-outline',
    description: 'Aprende a subir análisis, gestionar recetas y validarlos.',
    articles: [
      {
        id: 'upload-documents',
        title: 'Subir documentos médicos',
        content: 'Puedes subir fotos de tus recetas o resultados de laboratorio para que la IA los analice.',
        steps: [
          'Toca el botón "+" en la pantalla de inicio o ve a la sección "Subir".',
          'Selecciona "Tomar foto" o "Elegir de galería".',
          'Asegúrate de que la imagen sea clara y legible.',
          'Confirma la subida y espera a que la IA procese la información.'
        ],
        tips: ['Intenta tener buena iluminación al tomar la foto para mejores resultados.']
      },
      {
        id: 'validate-data',
        title: 'Validar información extraída',
        content: 'A veces la IA necesita tu confirmación para asegurar que los datos sean 100% correctos.',
        steps: [
          'Después de subir un documento, verás una pantalla de validación.',
          'Revisa los campos (nombre del medicamento, fecha, resultados).',
          'Si algo es incorrecto, tócalo para editarlo.',
          'Toca "Guardar" o "Validar" para confirmar.'
        ]
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'Funciones IA',
    icon: 'sparkles-outline',
    description: 'Descubre cómo nuestra Inteligencia Artificial te ayuda.',
    articles: [
      {
        id: 'ai-chat',
        title: 'Chat con Pocket Doctor',
        content: 'Puedes hacer preguntas sobre salud, síntomas o tus documentos médicos.',
        steps: [
          'Ve a la pestaña "Chat".',
          'Escribe tu pregunta en el campo de texto.',
          'Recibirás una respuesta basada en información médica confiable y tus datos.'
        ],
        tips: ['El chat no reemplaza a un médico real. En caso de emergencia, acude a un centro de salud.']
      },
      {
        id: 'recommendations',
        title: 'Recomendaciones personalizadas',
        content: 'Recibe consejos de salud basados en tu perfil y análisis.',
        steps: [
          'Revisa la sección de "Recomendaciones" en el Inicio o Perfil.',
          'Sigue los consejos de hidratación, ejercicio o cuidados específicos.'
        ]
      }
    ]
  },
  {
    id: 'account-security',
    title: 'Cuenta y Seguridad',
    icon: 'shield-checkmark-outline',
    description: 'Mantén tu cuenta segura y gestiona tu privacidad.',
    articles: [
      {
        id: 'privacy',
        title: 'Privacidad de tus datos',
        content: 'Tus datos médicos son encriptados y confidenciales. Solo tú tienes acceso a ellos, a menos que decidas compartirlos.',
        steps: []
      },
      {
        id: 'change-password',
        title: 'Cambiar contraseña',
        content: 'Si necesitas actualizar tu contraseña por seguridad.',
        steps: [
          'Ve a Perfil > Configuración > Seguridad.',
          'Selecciona "Cambiar contraseña".',
          'Ingresa tu contraseña actual y la nueva.'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Solución de Problemas',
    icon: 'construct-outline',
    description: 'Respuestas a problemas comunes.',
    articles: [
      {
        id: 'upload-error',
        title: 'Error al subir imágenes',
        content: 'Si recibes un error al subir un documento, intenta lo siguiente:',
        steps: [
          'Verifica tu conexión a internet.',
          'Asegúrate de que la imagen no sea demasiado pesada (menos de 5MB).',
          'Intenta cerrar y volver a abrir la aplicación.'
        ]
      }
    ]
  }
];
