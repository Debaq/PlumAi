import { Project } from '../types/domain';

export const DEMO_PROJECT: Project = {
  id: 'demo-project-001',
  title: 'El Viaje de los Hermanos',
  characters: [
    {
      id: 'char-001',
      name: 'Aria',
      role: 'protagonist',
      physicalDescription: 'Una joven valiente de 18 años con habilidades mágicas latentes',
      personality: 'Decidida, curiosa y protectora de su hermano menor',
      history: 'Creció en una aldea remota sin conocer sus verdaderos orígenes. Siempre sintió que era diferente a los demás.',
      notes: 'Protagonista principal. Descubrirá sus poderes a lo largo de la historia.',
      relationships: [],
      vitalStatusHistory: [
        {
          id: 'v-aria-001',
          status: 'alive',
          timestamp: new Date().toISOString(),
          description: 'Initial state'
        }
      ],
      currentVitalStatus: 'alive'
    },
    {
      id: 'char-002',
      name: 'Kael',
      role: 'supporting',
      physicalDescription: 'Hermano menor de Aria, 15 años, estratega natural',
      personality: 'Inteligente, analítico y leal. A veces impulsivo.',
      history: 'El más joven de los hermanos, pero con una mente brillante. Siempre ha admirado a su hermana.',
      relationships: [],
      notes: 'Personaje secundario importante. Complementa las habilidades de Aria.',
      vitalStatusHistory: [
        {
          id: 'v-kael-001',
          status: 'alive',
          timestamp: new Date().toISOString(),
          description: 'Initial state'
        }
      ],
      currentVitalStatus: 'alive'
    }
  ],
  locations: [
    {
      id: 'loc-001',
      name: 'Aldea de Lumina',
      description: 'Un pequeño pueblo rodeado de bosques antiguos, hogar de los hermanos durante toda su vida',
      type: 'settlement',
      notes: 'Punto de partida de la aventura'
    }
  ],
  chapters: [
    {
      id: 'chap-001',
      title: 'Capítulo 1: El Llamado',
      number: 1,
      summary: 'Aria y Kael descubren un antiguo medallón que revela pistas sobre su verdadero origen',
      content: 'El sol apenas comenzaba a asomar sobre las colinas cuando Aria despertó con un sobresalto. El mismo sueño otra vez: luces brillantes, voces susurrantes, y la sensación de que algo importante estaba por suceder.\n\n—¿Aria? —la voz de Kael llegó desde el piso de abajo—. ¿Estás bien?\n\nElla se levantó y miró por la ventana de su pequeña habitación. La Aldea de Lumina se despertaba lentamente, con el humo de las chimeneas elevándose en el aire fresco de la mañana.\n\n—Sí, solo... otro de esos sueños —respondió mientras bajaba las escaleras.\n\nKael ya estaba en la cocina, preparando el desayuno. A sus quince años, era casi tan alto como ella, aunque su hermana mayor siempre lo veía como el niño que había ayudado a criar.\n\n—El mismo sueño otra vez, ¿verdad? —preguntó sin levantar la vista de los huevos que preparaba.\n\nAria asintió. Habían pasado tres semanas desde que los sueños comenzaron, coincidiendo exactamente con el día en que encontraron el medallón en el desván de su casa.\n\n—Creo que deberíamos ir al bosque hoy —dijo Kael de repente—. Algo me dice que las respuestas están allí.\n\nAria lo miró sorprendida. Su hermano raramente sugería aventurarse más allá de los límites seguros de la aldea.\n\n—¿Estás seguro? Sabes que los ancianos dicen que...\n\n—Que el bosque es peligroso, lo sé —la interrumpió—. Pero también dicen que esconde secretos antiguos. Y ese medallón... tiene que significar algo.\n\nTenía razón. El medallón que habían encontrado no era una reliquia ordinaria. Brillaba con una luz tenue en la oscuridad y, cuando Aria lo tocaba, sentía una extraña conexión con algo... o alguien.\n\n—De acuerdo —dijo finalmente—. Pero nos preparamos bien. Y volvemos antes del anochecer.\n\nNo sabían que esta decisión cambiaría sus vidas para siempre.',
      wordCount: 350,
      status: 'draft',
      scenes: []
    },
    {
      id: 'chap-002',
      title: 'Capítulo 2: El Bosque Susurrante',
      number: 2,
      summary: 'Los hermanos se adentran en el bosque y tienen su primer encuentro con la magia',
      content: 'El bosque era más denso de lo que recordaban. Aria y Kael habían jugado en sus lindes cuando eran niños, pero nunca se habían aventurado tan profundo.\n\n—Mira esto —dijo Kael, arrodillándose junto a un árbol—. Estas marcas... parecen símbolos.\n\nAria se acercó y pasó sus dedos sobre las tallas en la corteza. En el momento en que las tocó, el medallón en su cuello comenzó a brillar intensamente.\n\n—¿Qué...? —apenas pudo decir antes de que una ráfaga de viento los rodeara.\n\nLas hojas comenzaron a girar a su alrededor, formando patrones imposibles en el aire. Y entonces, para su asombro, las hojas comenzaron a brillar con el mismo resplandor que el medallón.\n\n—Aria, tus manos —señaló Kael con los ojos muy abiertos.\n\nElla bajó la mirada y jadeó. Sus manos estaban rodeadas de una luz suave y dorada, pulsando al ritmo de su corazón.\n\n—No... no entiendo —susurró, pero en el fondo, una parte de ella sí entendía. Esta era la verdad que había estado buscando, la razón por la que siempre se había sentido diferente.\n\n—Eres mágica —dijo Kael con una mezcla de asombro y emoción—. Siempre lo fuiste.\n\nLa luz se desvaneció gradualmente, dejando a Aria temblando. Pero antes de que pudieran procesar lo que había sucedido, escucharon una voz.\n\n—Por fin han venido.\n\nAmbos se giraron bruscamente. Entre los árboles, una figura encapuchada los observaba.\n\n—¿Quién eres? —demandó Aria, adoptando instintivamente una postura protectora frente a su hermano.\n\n—Alguien que ha esperado mucho tiempo por este momento —respondió la figura—. Alguien que conoció a sus padres.\n\nEl mundo pareció detenerse. ¿Sus padres? Los hermanos siempre habían creído que eran huérfanos, abandonados de bebés en la aldea.\n\n—¿Qué sabes de nuestros padres? —preguntó Kael, dando un paso adelante.\n\nLa figura bajó su capucha, revelando el rostro de una mujer anciana con ojos que brillaban con sabiduría antigua.\n\n—Todo —dijo simplemente—. Y ha llegado el momento de que ustedes...',
      wordCount: 400,
      status: 'draft',
      scenes: []
    }
  ],
  scenes: [],
  apiKeys: {
    text: {
      anthropic: [],
      openai: [],
      google: [],
      groq: [],
      together: [],
      huggingface: [],
    },
    image: {
      googleImagen: [],
      dalle: [],
      stabilityai: [],
      replicate: [],
    }
  },
  loreItems: [
    {
      id: 'lore-001',
      title: 'El Medallón de los Antiguos',
      category: 'objects',
      content: 'Un medallón ancestral con propiedades mágicas. Brilla con luz propia y parece responder a la presencia de magia. Se dice que fue creado por los Antiguos, una civilización perdida de magos poderosos.\n\nCaracterísticas:\n- Emite una luz dorada en presencia de magia\n- Se calienta cuando está cerca de otros objetos mágicos\n- Tiene inscripciones en un idioma antiguo\n- Parece estar vinculado al linaje de sus portadores',
      summary: 'Medallón mágico ancestral vinculado al linaje de Aria',
      relatedEntityIds: ['char-001']
    },
    {
      id: 'lore-002',
      title: 'Los Antiguos',
      category: 'history',
      content: 'Una civilización de magos que existió hace miles de años. Dominaban la magia de formas que hoy están olvidadas. Su caída fue súbita y misteriosa, dejando atrás solo ruinas y artefactos poderosos.\n\nLo que se sabe:\n- Eran extremadamente poderosos\n- Vivían en armonía con la naturaleza\n- Desaparecieron de repente hace mil años\n- Dejaron guardianes para proteger su conocimiento\n- Se dice que algunos de sus descendientes aún viven en secreto',
      summary: 'Civilización perdida de magos poderosos',
      relatedEntityIds: []
    }
  ],
  timelineEvents: [
    {
      id: 'event-001',
      title: 'Descubrimiento del medallón',
      dateMode: 'relative',
      description: 'Aria y Kael encuentran un medallón antiguo en el desván de su casa',
      era: 'Tres semanas antes del inicio',
      participants: ['char-001', 'char-002'],
      importance: 'high',
      tags: ['misterio', 'descubrimiento']
    }
  ]
};
