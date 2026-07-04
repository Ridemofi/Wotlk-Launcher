export interface AzerothStoryItem {
  id: number
  title: string
  content: string
  tip: string
}

export const azerothStoryData: AzerothStoryItem[] = [
  {
    id: 1,
    title: 'El principe caido',
    content:
      'Hubo un tiempo en que Arthas Menethil fue visto como la esperanza de Lordaeron. Era principe, paladin y heredero de un reino que confiaba en su fuerza para resistir cualquier amenaza. Pero cuando la Plaga comenzo a devorar aldeas enteras y convertir a los vivos en instrumentos de muerte, su deseo de proteger a su pueblo se transformo poco a poco en obsesion.\n\nPersiguio la oscuridad hasta los confines helados de Rasganorte, convencido de que cada sacrificio era necesario. Alli encontro una espada maldita y, con ella, perdio mucho mas que su humanidad. Desde ese momento, el nombre de Arthas dejo de ser recordado como promesa y empezo a ser pronunciado como advertencia.',
    tip: 'Consejo: no persigas enemigos sin mirar el mapa. Si te alejas demasiado del grupo o entras solo a una zona llena de no-muertos, puedes terminar rodeado antes de poder escapar.'
  },
  {
    id: 2,
    title: 'La sombra de la Plaga',
    content:
      'La Plaga no avanzaba como un ejercito comun. No necesitaba descanso, no conocia el miedo y no lloraba a sus caidos. Cada pueblo destruido podia convertirse en una nueva fuerza al servicio del Rey Exanime, y cada soldado que moria en batalla corria el riesgo de levantarse de nuevo contra quienes antes llamaba aliados.\n\nPor eso la guerra en Rasganorte era distinta a cualquier otra. No bastaba con ganar una batalla: habia que impedir que la muerte misma reclamara el campo. En cada campamento, los vivos entendieron una verdad amarga: contra la Plaga, incluso la victoria podia sentirse como una perdida.',
    tip: 'Consejo: cuando enfrentes muchos enemigos juntos, usa habilidades de area, ralentizaciones, aturdimientos o granadas de ingenieria para controlar el grupo antes de que te superen por cantidad.'
  },
  {
    id: 3,
    title: 'Dalaran sobre Rasganorte',
    content:
      'Dalaran se elevo sobre los cielos de Rasganorte como una joya arcana suspendida en medio de la tormenta. Desde sus torres, los magos del Kirin Tor observaban el continente helado, atentos a cada fluctuacion magica, cada anomalia y cada señal que pudiera revelar los planes del Rey Exanime.\n\nLa ciudad flotante se convirtio en refugio, punto de encuentro y centro de operaciones para heroes de todas partes de Azeroth. Sin embargo, incluso entre sus calles iluminadas por magia, era imposible olvidar que al norte aguardaba Corona de Hielo. Dalaran brillaba en el cielo, pero su luz existia bajo la sombra de una amenaza mucho mas antigua y cruel.',
    tip: 'Consejo: usa Dalaran como base principal. Guarda alli tu piedra de hogar para moverte rapido entre bancos, instructores, vendedores, portales y las zonas importantes de Rasganorte.'
  },
  {
    id: 4,
    title: 'Corona de Hielo',
    content:
      'En lo mas profundo del norte se alza Corona de Hielo, una fortaleza nacida del frio, la muerte y la voluntad del Rey Exanime. Sus torres parecen atravesar las nubes, y sus muros no solo protegen un trono: anuncian al mundo que la muerte tiene un señor.\n\nQuienes miran hacia sus agujas sienten que la fortaleza observa de vuelta. Alli no hay calor, descanso ni misericordia. Solo silencio, viento helado y la certeza de que todo camino en Rasganorte termina mirando hacia ese lugar. Para muchos heroes, llegar a Corona de Hielo no era una mision mas; era cruzar el umbral hacia el corazon de la pesadilla.',
    tip: 'Consejo: antes de entrar a mazmorras o raids dificiles, repara tu equipo, lleva consumibles y revisa tus talentos. Un personaje preparado evita wipes innecesarios.'
  },
  {
    id: 5,
    title: 'La Cruzada Argenta',
    content:
      'Cuando la amenaza de la Plaga se volvio imposible de ignorar, la Cruzada Argenta reunio a quienes aun estaban dispuestos a luchar por los vivos. Paladines, soldados, sacerdotes y aventureros de distintos origenes marcharon bajo un mismo proposito: resistir al Rey Exanime y llevar la guerra hasta su fortaleza.\n\nEn sus campamentos no importaba demasiado si alguien venia de la Alianza o de la Horda. Frente a la muerte, las viejas rivalidades se volvian pequeñas. Las hogueras ardian durante la noche, las armas se bendecian antes del amanecer y cada cruzado sabia que el norte pondria a prueba no solo su fuerza, sino tambien su fe.',
    tip: 'Consejo: mejora tu reputacion con facciones de Rasganorte. Varias ofrecen encantamientos, equipo util y recompensas que ayudan mucho antes de empezar raids.'
  },
  {
    id: 6,
    title: 'El Cementerio de Dragones',
    content:
      'El Cementerio de Dragones guarda memorias que preceden a muchos reinos mortales. Entre huesos colosales y nieve endurecida, yacen restos de criaturas antiguas cuyo poder alguna vez surco los cielos de Azeroth. Pero en Rasganorte, ni siquiera los lugares sagrados estan libres de corrupcion.\n\nLa presencia de la Plaga convirtio aquel territorio en una herida abierta. Donde antes reinaba el silencio solemne, comenzaron a moverse cultores, no-muertos y sombras al servicio de una voluntad distante. Los exploradores que cruzaban la zona hablaban de una sensacion constante: como si la tierra recordara demasiadas muertes y aun esperara muchas mas.',
    tip: 'Consejo: en zonas abiertas con muchos enemigos, evita pelear cerca de patrullas. Retrocede unos metros antes de atacar para no atraer enemigos extra sin querer.'
  },
  {
    id: 7,
    title: 'Susurros en la nieve',
    content:
      'No todos los peligros de Rasganorte atacan con garras o espadas. Algunos llegan en forma de susurros, de pensamientos extraños durante una guardia nocturna, de voces que parecen esconderse entre la ventisca. Muchos soldados afirmaban escuchar su propio nombre en medio del viento, aunque nadie estuviera cerca.\n\nLos oficiales solian culpar al cansancio, al frio o al miedo. Pero los veteranos sabian que en el norte la mente podia ser tan vulnerable como la carne. El Rey Exanime no solo gobernaba ejercitos de muertos; tambien sabia sembrar duda, desesperacion y obediencia en los corazones que aun latian.',
    tip: 'Consejo: presta atencion a debuffs y efectos de control mental, miedo o silencio. Quitar un efecto a tiempo puede salvar al grupo en una mazmorra.'
  },
  {
    id: 8,
    title: 'La marcha hacia el norte',
    content:
      'Desde los puertos helados de la Tundra Boreal hasta los acantilados del Fiordo Aquilonal, los campeones de Azeroth comenzaron su avance hacia el interior de Rasganorte. Algunos llegaron buscando gloria, otros venganza, otros simplemente respondieron al llamado porque sabian lo que ocurriria si la Plaga no era detenida.\n\nCada paso hacia el norte era mas dificil que el anterior. El frio mordia la piel, las rutas cambiaban bajo la nieve y el enemigo parecia surgir de cualquier sombra. Aun asi, los heroes siguieron avanzando. Porque al final de todos los caminos, mas alla de las tormentas y los campos de batalla, los esperaba la aguja de Corona de Hielo.',
    tip: 'Consejo: desbloquea rutas de vuelo mientras subes de nivel. Ahorras mucho tiempo viajando entre misiones, instructores y zonas importantes.'
  },
  {
    id: 9,
    title: 'La espada maldita',
    content:
      'Frostmourne no fue solo un arma. Fue una promesa falsa envuelta en poder. Quienes conocian su nombre hablaban de ella con temor, porque no cortaba unicamente carne y armadura: reclamaba almas. En manos de Arthas, la espada se convirtio en el simbolo de una caida que cambio el destino de Lordaeron y de todo Azeroth.\n\nEl principe creyo que necesitaba aquel poder para vencer a sus enemigos, pero cada victoria lo alejaba mas de si mismo. La hoja no le dio salvacion; le quito la ultima posibilidad de regresar. Desde entonces, su brillo helado quedo unido para siempre a la leyenda del Rey Exanime.',
    tip: 'Consejo: no te fijes solo en el daño del arma. Revisa tambien estadisticas utiles para tu clase, velocidad, fuerza, agilidad, intelecto, poder con hechizos o defensa segun tu rol.'
  },
  {
    id: 10,
    title: 'Antes del asalto final',
    content:
      'Cuando las fuerzas de Azeroth se reunieron frente a la amenaza de Corona de Hielo, el mundo parecio contener la respiracion. No era una simple campaña militar ni una expedicion mas hacia tierras hostiles. Era el cierre de una historia marcada por traicion, perdida y muerte.\n\nLos heroes que llegaron hasta alli habian cruzado bosques congelados, cementerios antiguos, fortalezas enemigas y campos donde la esperanza parecia imposible. Frente a ellos se alzaba el trono del Rey Exanime. Detras quedaban los reinos que juraron proteger. En ese instante, todos entendieron que algunas batallas no se luchan por gloria, sino para impedir que el mundo caiga en silencio.',
    tip: 'Consejo: antes de una raid, lleva comida, frascos, pociones y municion si tu clase la necesita. Tambien revisa que tus glifos, talentos y equipo esten correctos.'
  }
]
