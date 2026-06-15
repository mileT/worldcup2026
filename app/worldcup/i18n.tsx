'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TEAMS } from './data';

export type Lang = 'en' | 'es' | 'fr' | 'pt' | 'de' | 'it' | 'ja' | 'zh';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

/** All translatable UI strings. Tokens like {n}, {id}, {team} are interpolated. */
export interface Strings {
  subtitle: string;
  tagline: string;
  save: string;
  saving: string;
  reset: string;
  resetConfirm: string;
  groupStage: string;
  groupHint: string; // contains {topTwo} and {thirds}
  topTwo: string;
  thirds: string;
  bestThirds: string; // {n}
  groupLabel: string; // {id}
  dragToSort: string;
  best3rd: string;
  best3rdTitle: string;
  moveUp: string; // {team}
  moveDown: string; // {team}
  clickToAdvance: string;
  knockoutTitle: string;
  knockoutHint: string;
  roundR32: string;
  roundR16: string;
  colQuarters: string;
  roundQF: string;
  roundSF: string;
  roundFinal: string;
  finalDate: string;
  worldChampion: string;
  vs: string;
  championPrompt: string;
  coffeeTitle: string;
  coffeeBody: string;
  coffeeCta: string;
  coffeeLater: string;
  imageError: string;
  selectLanguage: string;
  slotWinner: string; // {g}
  slotRunner: string; // {g}
  slotThird: string; // {groups}
  slotWinnerMatch: string; // {m}
}

export const DICT: Record<Lang, Strings> = {
  en: {
    subtitle: 'Bracket Predictor',
    tagline: 'Sort each group, pick every knockout winner, crown your champion.',
    save: 'Save road map image',
    saving: 'Saving…',
    reset: 'Reset',
    resetConfirm: 'Reset all predictions?',
    groupStage: 'Group Stage',
    groupHint: 'Drag (or use the arrows) to order each group. {topTwo}; mark the {thirds}.',
    topTwo: 'Top two advance',
    thirds: '8 best third-placed teams',
    bestThirds: 'Best thirds: {n}/8 selected',
    groupLabel: 'Group {id}',
    dragToSort: 'drag to sort',
    best3rd: 'BEST 3RD',
    best3rdTitle: 'Toggle: advances as one of the 8 best third-placed teams',
    moveUp: 'Move {team} up',
    moveDown: 'Move {team} down',
    clickToAdvance: 'Click to advance',
    knockoutTitle: 'Knockout Stage — Road to the Final',
    knockoutHint:
      'Click a team to advance it. The final is in the middle. Scroll sideways on small screens.',
    roundR32: 'Round of 32',
    roundR16: 'Round of 16',
    colQuarters: 'Quarters',
    roundQF: 'Quarter-final',
    roundSF: 'Semi-final',
    roundFinal: 'Final',
    finalDate: 'Final · July 19',
    worldChampion: 'World Champion',
    vs: 'vs',
    championPrompt:
      'Pick winners through the bracket below — your champion and their road will appear here.',
    coffeeTitle: 'Your road map is downloading!',
    coffeeBody:
      "Enjoying the World Cup predictor? If you'd like to support it, you can buy me a coffee — it keeps the predictions brewing.",
    coffeeCta: 'Buy me a coffee',
    coffeeLater: 'Maybe later',
    imageError: 'Sorry, the image could not be generated.',
    selectLanguage: 'Select language',
    slotWinner: 'Winner {g}',
    slotRunner: 'Runner-up {g}',
    slotThird: '3rd {groups}',
    slotWinnerMatch: 'Winner M{m}',
  },
  es: {
    subtitle: 'Predictor de Cuadro',
    tagline: 'Ordena cada grupo, elige cada ganador eliminatorio y corona a tu campeón.',
    save: 'Guardar imagen del recorrido',
    saving: 'Guardando…',
    reset: 'Reiniciar',
    resetConfirm: '¿Reiniciar todas las predicciones?',
    groupStage: 'Fase de grupos',
    groupHint: 'Arrastra (o usa las flechas) para ordenar cada grupo. {topTwo}; marca los {thirds}.',
    topTwo: 'Los dos primeros avanzan',
    thirds: '8 mejores terceros',
    bestThirds: 'Mejores terceros: {n}/8 seleccionados',
    groupLabel: 'Grupo {id}',
    dragToSort: 'arrastra para ordenar',
    best3rd: 'MEJOR 3.º',
    best3rdTitle: 'Alternar: avanza como uno de los 8 mejores terceros',
    moveUp: 'Subir {team}',
    moveDown: 'Bajar {team}',
    clickToAdvance: 'Haz clic para avanzar',
    knockoutTitle: 'Fase eliminatoria — Camino a la final',
    knockoutHint:
      'Haz clic en un equipo para avanzarlo. La final está en el centro. Desplázate horizontalmente en pantallas pequeñas.',
    roundR32: 'Dieciseisavos',
    roundR16: 'Octavos',
    colQuarters: 'Cuartos',
    roundQF: 'Cuartos de final',
    roundSF: 'Semifinal',
    roundFinal: 'Final',
    finalDate: 'Final · 19 de julio',
    worldChampion: 'Campeón del Mundo',
    vs: 'vs',
    championPrompt:
      'Elige ganadores en el cuadro de abajo: tu campeón y su camino aparecerán aquí.',
    coffeeTitle: '¡Tu recorrido se está descargando!',
    coffeeBody:
      '¿Disfrutas el predictor del Mundial? Si quieres apoyarlo, puedes invitarme un café — mantiene las predicciones en marcha.',
    coffeeCta: 'Invítame un café',
    coffeeLater: 'Quizás más tarde',
    imageError: 'Lo sentimos, no se pudo generar la imagen.',
    selectLanguage: 'Seleccionar idioma',
    slotWinner: 'Ganador {g}',
    slotRunner: 'Segundo {g}',
    slotThird: '3.º {groups}',
    slotWinnerMatch: 'Ganador M{m}',
  },
  fr: {
    subtitle: 'Pronostics du tableau',
    tagline: 'Classez chaque groupe, choisissez chaque vainqueur et couronnez votre champion.',
    save: 'Enregistrer le parcours',
    saving: 'Enregistrement…',
    reset: 'Réinitialiser',
    resetConfirm: 'Réinitialiser tous les pronostics ?',
    groupStage: 'Phase de groupes',
    groupHint:
      'Glissez (ou utilisez les flèches) pour classer chaque groupe. {topTwo} ; marquez les {thirds}.',
    topTwo: 'Les deux premiers se qualifient',
    thirds: '8 meilleurs troisièmes',
    bestThirds: 'Meilleurs troisièmes : {n}/8 sélectionnés',
    groupLabel: 'Groupe {id}',
    dragToSort: 'glisser pour trier',
    best3rd: 'MEILL. 3E',
    best3rdTitle: 'Basculer : se qualifie parmi les 8 meilleurs troisièmes',
    moveUp: 'Monter {team}',
    moveDown: 'Descendre {team}',
    clickToAdvance: 'Cliquez pour qualifier',
    knockoutTitle: 'Phase à élimination directe — En route vers la finale',
    knockoutHint:
      'Cliquez sur une équipe pour la qualifier. La finale est au centre. Faites défiler horizontalement sur petit écran.',
    roundR32: '16es de finale',
    roundR16: '8es de finale',
    colQuarters: 'Quarts',
    roundQF: 'Quart de finale',
    roundSF: 'Demi-finale',
    roundFinal: 'Finale',
    finalDate: 'Finale · 19 juillet',
    worldChampion: 'Champion du Monde',
    vs: 'c.',
    championPrompt:
      'Choisissez les vainqueurs dans le tableau ci-dessous — votre champion et son parcours apparaîtront ici.',
    coffeeTitle: 'Votre parcours est en cours de téléchargement !',
    coffeeBody:
      'Vous aimez ce simulateur de Coupe du Monde ? Pour le soutenir, offrez-moi un café — ça fait avancer les pronostics.',
    coffeeCta: 'Offrez-moi un café',
    coffeeLater: 'Plus tard',
    imageError: "Désolé, l'image n'a pas pu être générée.",
    selectLanguage: 'Choisir la langue',
    slotWinner: 'Vainqueur {g}',
    slotRunner: 'Deuxième {g}',
    slotThird: '3e {groups}',
    slotWinnerMatch: 'Vainqueur M{m}',
  },
  pt: {
    subtitle: 'Simulador de Chaveamento',
    tagline: 'Ordene cada grupo, escolha cada vencedor do mata-mata e coroe seu campeão.',
    save: 'Salvar imagem do caminho',
    saving: 'Salvando…',
    reset: 'Redefinir',
    resetConfirm: 'Redefinir todas as previsões?',
    groupStage: 'Fase de grupos',
    groupHint: 'Arraste (ou use as setas) para ordenar cada grupo. {topTwo}; marque as {thirds}.',
    topTwo: 'Os dois primeiros avançam',
    thirds: '8 melhores terceiros colocados',
    bestThirds: 'Melhores terceiros: {n}/8 selecionados',
    groupLabel: 'Grupo {id}',
    dragToSort: 'arraste para ordenar',
    best3rd: 'MELHOR 3º',
    best3rdTitle: 'Alternar: avança como um dos 8 melhores terceiros',
    moveUp: 'Subir {team}',
    moveDown: 'Descer {team}',
    clickToAdvance: 'Clique para avançar',
    knockoutTitle: 'Fase eliminatória — Caminho até a final',
    knockoutHint:
      'Clique em uma equipe para avançá-la. A final fica no centro. Role na horizontal em telas pequenas.',
    roundR32: '16 avos de final',
    roundR16: 'Oitavas de final',
    colQuarters: 'Quartas',
    roundQF: 'Quartas de final',
    roundSF: 'Semifinal',
    roundFinal: 'Final',
    finalDate: 'Final · 19 de julho',
    worldChampion: 'Campeão Mundial',
    vs: 'vs',
    championPrompt:
      'Escolha os vencedores no chaveamento abaixo — seu campeão e o caminho dele aparecerão aqui.',
    coffeeTitle: 'Seu caminho está sendo baixado!',
    coffeeBody:
      'Curtindo o simulador da Copa? Se quiser apoiar, você pode me pagar um café — é o que mantém as previsões a todo vapor.',
    coffeeCta: 'Pague-me um café',
    coffeeLater: 'Talvez depois',
    imageError: 'Desculpe, não foi possível gerar a imagem.',
    selectLanguage: 'Selecionar idioma',
    slotWinner: 'Vencedor {g}',
    slotRunner: 'Vice {g}',
    slotThird: '3º {groups}',
    slotWinnerMatch: 'Vencedor M{m}',
  },
  de: {
    subtitle: 'Turnierbaum-Tipp',
    tagline: 'Sortiere jede Gruppe, wähle jeden K.-o.-Sieger und kröne deinen Champion.',
    save: 'Weg als Bild speichern',
    saving: 'Speichern…',
    reset: 'Zurücksetzen',
    resetConfirm: 'Alle Tipps zurücksetzen?',
    groupStage: 'Gruppenphase',
    groupHint: 'Ziehe (oder nutze die Pfeile), um jede Gruppe zu sortieren. {topTwo}; markiere die {thirds}.',
    topTwo: 'Die ersten zwei kommen weiter',
    thirds: '8 besten Gruppendritten',
    bestThirds: 'Beste Dritte: {n}/8 ausgewählt',
    groupLabel: 'Gruppe {id}',
    dragToSort: 'zum Sortieren ziehen',
    best3rd: 'BESTER 3.',
    best3rdTitle: 'Umschalten: kommt als einer der 8 besten Dritten weiter',
    moveUp: '{team} nach oben',
    moveDown: '{team} nach unten',
    clickToAdvance: 'Zum Weiterkommen klicken',
    knockoutTitle: 'K.-o.-Phase — Weg ins Finale',
    knockoutHint:
      'Klicke auf ein Team, um es weiterzubringen. Das Finale ist in der Mitte. Auf kleinen Bildschirmen seitlich scrollen.',
    roundR32: 'Sechzehntelfinale',
    roundR16: 'Achtelfinale',
    colQuarters: 'Viertelf.',
    roundQF: 'Viertelfinale',
    roundSF: 'Halbfinale',
    roundFinal: 'Finale',
    finalDate: 'Finale · 19. Juli',
    worldChampion: 'Weltmeister',
    vs: 'vs',
    championPrompt:
      'Wähle unten im Turnierbaum die Sieger — dein Champion und sein Weg erscheinen hier.',
    coffeeTitle: 'Dein Weg wird heruntergeladen!',
    coffeeBody:
      'Gefällt dir der WM-Tipp? Wenn du ihn unterstützen möchtest, spendiere mir einen Kaffee — er hält die Prognosen am Laufen.',
    coffeeCta: 'Spendier mir einen Kaffee',
    coffeeLater: 'Vielleicht später',
    imageError: 'Entschuldigung, das Bild konnte nicht erstellt werden.',
    selectLanguage: 'Sprache wählen',
    slotWinner: 'Sieger {g}',
    slotRunner: 'Zweiter {g}',
    slotThird: '3. {groups}',
    slotWinnerMatch: 'Sieger M{m}',
  },
  it: {
    subtitle: 'Pronostici Tabellone',
    tagline: 'Ordina ogni girone, scegli ogni vincitore e incorona il tuo campione.',
    save: "Salva l'immagine del percorso",
    saving: 'Salvataggio…',
    reset: 'Reimposta',
    resetConfirm: 'Reimpostare tutti i pronostici?',
    groupStage: 'Fase a gironi',
    groupHint: 'Trascina (o usa le frecce) per ordinare ogni girone. {topTwo}; segna le {thirds}.',
    topTwo: 'Le prime due avanzano',
    thirds: '8 migliori terze',
    bestThirds: 'Migliori terze: {n}/8 selezionate',
    groupLabel: 'Girone {id}',
    dragToSort: 'trascina per ordinare',
    best3rd: 'MIGL. 3ª',
    best3rdTitle: 'Attiva/disattiva: avanza tra le 8 migliori terze',
    moveUp: 'Sposta su {team}',
    moveDown: 'Sposta giù {team}',
    clickToAdvance: 'Clicca per avanzare',
    knockoutTitle: 'Fase a eliminazione — Verso la finale',
    knockoutHint:
      'Clicca su una squadra per farla avanzare. La finale è al centro. Scorri lateralmente su schermi piccoli.',
    roundR32: 'Sedicesimi',
    roundR16: 'Ottavi',
    colQuarters: 'Quarti',
    roundQF: 'Quarti di finale',
    roundSF: 'Semifinale',
    roundFinal: 'Finale',
    finalDate: 'Finale · 19 luglio',
    worldChampion: 'Campione del Mondo',
    vs: 'vs',
    championPrompt:
      'Scegli i vincitori nel tabellone qui sotto — il tuo campione e il suo percorso appariranno qui.',
    coffeeTitle: 'Il tuo percorso è in download!',
    coffeeBody:
      'Ti piace il pronostico dei Mondiali? Se vuoi sostenerlo, offrimi un caffè — tiene vive le previsioni.',
    coffeeCta: 'Offrimi un caffè',
    coffeeLater: 'Forse più tardi',
    imageError: "Spiacenti, impossibile generare l'immagine.",
    selectLanguage: 'Seleziona lingua',
    slotWinner: 'Vincitore {g}',
    slotRunner: 'Seconda {g}',
    slotThird: '3ª {groups}',
    slotWinnerMatch: 'Vincitore M{m}',
  },
  ja: {
    subtitle: 'ブラケット予想',
    tagline: '各グループを並べ替え、勝者を選び、チャンピオンを決めよう。',
    save: 'ロードマップを画像で保存',
    saving: '保存中…',
    reset: 'リセット',
    resetConfirm: 'すべての予想をリセットしますか？',
    groupStage: 'グループステージ',
    groupHint: '各グループをドラッグ（または矢印）で並べ替えます。{topTwo}。{thirds}を選んでください。',
    topTwo: '上位2チームが進出',
    thirds: 'ベスト3位の8チーム',
    bestThirds: 'ベスト3位：{n}/8 選択済み',
    groupLabel: 'グループ {id}',
    dragToSort: 'ドラッグで並べ替え',
    best3rd: 'ベスト3位',
    best3rdTitle: '切り替え：ベスト3位8チームの一つとして進出',
    moveUp: '{team} を上へ',
    moveDown: '{team} を下へ',
    clickToAdvance: 'クリックで進出',
    knockoutTitle: '決勝トーナメント — 決勝への道',
    knockoutHint:
      'チームをクリックして進出させます。決勝は中央です。小さい画面では横にスクロールしてください。',
    roundR32: 'ラウンド32',
    roundR16: 'ラウンド16',
    colQuarters: '準々決勝',
    roundQF: '準々決勝',
    roundSF: '準決勝',
    roundFinal: '決勝',
    finalDate: '決勝 · 7月19日',
    worldChampion: '世界王者',
    vs: '対',
    championPrompt: '下のブラケットで勝者を選ぶと、チャンピオンとその道のりがここに表示されます。',
    coffeeTitle: 'ロードマップをダウンロード中です！',
    coffeeBody:
      'ワールドカップ予想を楽しんでいますか？応援したい方はコーヒーをおごってください。予想づくりの励みになります。',
    coffeeCta: 'コーヒーをおごる',
    coffeeLater: 'あとで',
    imageError: '申し訳ありません。画像を生成できませんでした。',
    selectLanguage: '言語を選択',
    slotWinner: '{g}組1位',
    slotRunner: '{g}組2位',
    slotThird: '3位 {groups}',
    slotWinnerMatch: 'M{m}勝者',
  },
  zh: {
    subtitle: '对阵预测',
    tagline: '排列每个小组，选出每场淘汰赛胜者，加冕你的冠军。',
    save: '保存晋级路线图',
    saving: '保存中…',
    reset: '重置',
    resetConfirm: '重置所有预测吗？',
    groupStage: '小组赛',
    groupHint: '拖动（或使用箭头）排列每个小组。{topTwo}；选出{thirds}。',
    topTwo: '前两名晋级',
    thirds: '8 个最佳第三名球队',
    bestThirds: '最佳第三名：{n}/8 已选',
    groupLabel: '{id} 组',
    dragToSort: '拖动排序',
    best3rd: '最佳第三',
    best3rdTitle: '切换：作为 8 个最佳第三名之一晋级',
    moveUp: '上移 {team}',
    moveDown: '下移 {team}',
    clickToAdvance: '点击晋级',
    knockoutTitle: '淘汰赛 — 通往决赛之路',
    knockoutHint: '点击球队使其晋级。决赛在中间。小屏幕请左右滑动。',
    roundR32: '32 强',
    roundR16: '16 强',
    colQuarters: '八强',
    roundQF: '四分之一决赛',
    roundSF: '半决赛',
    roundFinal: '决赛',
    finalDate: '决赛 · 7月19日',
    worldChampion: '世界冠军',
    vs: '对',
    championPrompt: '在下方对阵图中选出胜者——你的冠军及其晋级之路将显示在这里。',
    coffeeTitle: '你的路线图正在下载！',
    coffeeBody: '喜欢这个世界杯预测器吗？如果想支持，可以请我喝杯咖啡——让预测持续运转。',
    coffeeCta: '请我喝咖啡',
    coffeeLater: '以后再说',
    imageError: '抱歉，无法生成图片。',
    selectLanguage: '选择语言',
    slotWinner: '{g}组第一',
    slotRunner: '{g}组第二',
    slotThird: '第三 {groups}',
    slotWinnerMatch: 'M{m}胜者',
  },
};

/** Localized country names by team id. English falls back to data.ts. */
const TEAM_NAMES: Partial<Record<Lang, Record<string, string>>> = {
  es: {
    MEX: 'México', KOR: 'Corea del Sur', RSA: 'Sudáfrica', CZE: 'Chequia', CAN: 'Canadá',
    SUI: 'Suiza', QAT: 'Catar', BIH: 'Bosnia y Herzegovina', BRA: 'Brasil', MAR: 'Marruecos',
    SCO: 'Escocia', HAI: 'Haití', USA: 'Estados Unidos', AUS: 'Australia', PAR: 'Paraguay',
    TUR: 'Turquía', GER: 'Alemania', ECU: 'Ecuador', CIV: 'Costa de Marfil', CUW: 'Curazao',
    NED: 'Países Bajos', JPN: 'Japón', TUN: 'Túnez', SWE: 'Suecia', BEL: 'Bélgica', IRN: 'Irán',
    EGY: 'Egipto', NZL: 'Nueva Zelanda', ESP: 'España', URU: 'Uruguay', KSA: 'Arabia Saudí',
    CPV: 'Cabo Verde', FRA: 'Francia', SEN: 'Senegal', NOR: 'Noruega', IRQ: 'Irak',
    ARG: 'Argentina', AUT: 'Austria', ALG: 'Argelia', JOR: 'Jordania', POR: 'Portugal',
    COL: 'Colombia', UZB: 'Uzbekistán', COD: 'RD del Congo', ENG: 'Inglaterra', CRO: 'Croacia',
    PAN: 'Panamá', GHA: 'Ghana',
  },
  fr: {
    MEX: 'Mexique', KOR: 'Corée du Sud', RSA: 'Afrique du Sud', CZE: 'Tchéquie', CAN: 'Canada',
    SUI: 'Suisse', QAT: 'Qatar', BIH: 'Bosnie-Herzégovine', BRA: 'Brésil', MAR: 'Maroc',
    SCO: 'Écosse', HAI: 'Haïti', USA: 'États-Unis', AUS: 'Australie', PAR: 'Paraguay',
    TUR: 'Turquie', GER: 'Allemagne', ECU: 'Équateur', CIV: "Côte d'Ivoire", CUW: 'Curaçao',
    NED: 'Pays-Bas', JPN: 'Japon', TUN: 'Tunisie', SWE: 'Suède', BEL: 'Belgique', IRN: 'Iran',
    EGY: 'Égypte', NZL: 'Nouvelle-Zélande', ESP: 'Espagne', URU: 'Uruguay', KSA: 'Arabie saoudite',
    CPV: 'Cap-Vert', FRA: 'France', SEN: 'Sénégal', NOR: 'Norvège', IRQ: 'Irak', ARG: 'Argentine',
    AUT: 'Autriche', ALG: 'Algérie', JOR: 'Jordanie', POR: 'Portugal', COL: 'Colombie',
    UZB: 'Ouzbékistan', COD: 'RD Congo', ENG: 'Angleterre', CRO: 'Croatie', PAN: 'Panama',
    GHA: 'Ghana',
  },
  pt: {
    MEX: 'México', KOR: 'Coreia do Sul', RSA: 'África do Sul', CZE: 'Chéquia', CAN: 'Canadá',
    SUI: 'Suíça', QAT: 'Catar', BIH: 'Bósnia e Herzegovina', BRA: 'Brasil', MAR: 'Marrocos',
    SCO: 'Escócia', HAI: 'Haiti', USA: 'Estados Unidos', AUS: 'Austrália', PAR: 'Paraguai',
    TUR: 'Turquia', GER: 'Alemanha', ECU: 'Equador', CIV: 'Costa do Marfim', CUW: 'Curaçao',
    NED: 'Países Baixos', JPN: 'Japão', TUN: 'Tunísia', SWE: 'Suécia', BEL: 'Bélgica', IRN: 'Irã',
    EGY: 'Egito', NZL: 'Nova Zelândia', ESP: 'Espanha', URU: 'Uruguai', KSA: 'Arábia Saudita',
    CPV: 'Cabo Verde', FRA: 'França', SEN: 'Senegal', NOR: 'Noruega', IRQ: 'Iraque',
    ARG: 'Argentina', AUT: 'Áustria', ALG: 'Argélia', JOR: 'Jordânia', POR: 'Portugal',
    COL: 'Colômbia', UZB: 'Uzbequistão', COD: 'RD Congo', ENG: 'Inglaterra', CRO: 'Croácia',
    PAN: 'Panamá', GHA: 'Gana',
  },
  de: {
    MEX: 'Mexiko', KOR: 'Südkorea', RSA: 'Südafrika', CZE: 'Tschechien', CAN: 'Kanada',
    SUI: 'Schweiz', QAT: 'Katar', BIH: 'Bosnien und Herzegowina', BRA: 'Brasilien', MAR: 'Marokko',
    SCO: 'Schottland', HAI: 'Haiti', USA: 'Vereinigte Staaten', AUS: 'Australien', PAR: 'Paraguay',
    TUR: 'Türkei', GER: 'Deutschland', ECU: 'Ecuador', CIV: 'Elfenbeinküste', CUW: 'Curaçao',
    NED: 'Niederlande', JPN: 'Japan', TUN: 'Tunesien', SWE: 'Schweden', BEL: 'Belgien', IRN: 'Iran',
    EGY: 'Ägypten', NZL: 'Neuseeland', ESP: 'Spanien', URU: 'Uruguay', KSA: 'Saudi-Arabien',
    CPV: 'Kap Verde', FRA: 'Frankreich', SEN: 'Senegal', NOR: 'Norwegen', IRQ: 'Irak',
    ARG: 'Argentinien', AUT: 'Österreich', ALG: 'Algerien', JOR: 'Jordanien', POR: 'Portugal',
    COL: 'Kolumbien', UZB: 'Usbekistan', COD: 'DR Kongo', ENG: 'England', CRO: 'Kroatien',
    PAN: 'Panama', GHA: 'Ghana',
  },
  it: {
    MEX: 'Messico', KOR: 'Corea del Sud', RSA: 'Sudafrica', CZE: 'Cechia', CAN: 'Canada',
    SUI: 'Svizzera', QAT: 'Qatar', BIH: 'Bosnia ed Erzegovina', BRA: 'Brasile', MAR: 'Marocco',
    SCO: 'Scozia', HAI: 'Haiti', USA: 'Stati Uniti', AUS: 'Australia', PAR: 'Paraguay',
    TUR: 'Turchia', GER: 'Germania', ECU: 'Ecuador', CIV: "Costa d'Avorio", CUW: 'Curaçao',
    NED: 'Paesi Bassi', JPN: 'Giappone', TUN: 'Tunisia', SWE: 'Svezia', BEL: 'Belgio', IRN: 'Iran',
    EGY: 'Egitto', NZL: 'Nuova Zelanda', ESP: 'Spagna', URU: 'Uruguay', KSA: 'Arabia Saudita',
    CPV: 'Capo Verde', FRA: 'Francia', SEN: 'Senegal', NOR: 'Norvegia', IRQ: 'Iraq',
    ARG: 'Argentina', AUT: 'Austria', ALG: 'Algeria', JOR: 'Giordania', POR: 'Portogallo',
    COL: 'Colombia', UZB: 'Uzbekistan', COD: 'RD del Congo', ENG: 'Inghilterra', CRO: 'Croazia',
    PAN: 'Panama', GHA: 'Ghana',
  },
  ja: {
    MEX: 'メキシコ', KOR: '韓国', RSA: '南アフリカ', CZE: 'チェコ', CAN: 'カナダ', SUI: 'スイス',
    QAT: 'カタール', BIH: 'ボスニア・ヘルツェゴビナ', BRA: 'ブラジル', MAR: 'モロッコ',
    SCO: 'スコットランド', HAI: 'ハイチ', USA: 'アメリカ', AUS: 'オーストラリア', PAR: 'パラグアイ',
    TUR: 'トルコ', GER: 'ドイツ', ECU: 'エクアドル', CIV: 'コートジボワール', CUW: 'キュラソー',
    NED: 'オランダ', JPN: '日本', TUN: 'チュニジア', SWE: 'スウェーデン', BEL: 'ベルギー',
    IRN: 'イラン', EGY: 'エジプト', NZL: 'ニュージーランド', ESP: 'スペイン', URU: 'ウルグアイ',
    KSA: 'サウジアラビア', CPV: 'カーボベルデ', FRA: 'フランス', SEN: 'セネガル', NOR: 'ノルウェー',
    IRQ: 'イラク', ARG: 'アルゼンチン', AUT: 'オーストリア', ALG: 'アルジェリア', JOR: 'ヨルダン',
    POR: 'ポルトガル', COL: 'コロンビア', UZB: 'ウズベキスタン', COD: 'コンゴ民主共和国',
    ENG: 'イングランド', CRO: 'クロアチア', PAN: 'パナマ', GHA: 'ガーナ',
  },
  zh: {
    MEX: '墨西哥', KOR: '韩国', RSA: '南非', CZE: '捷克', CAN: '加拿大', SUI: '瑞士', QAT: '卡塔尔',
    BIH: '波斯尼亚和黑塞哥维那', BRA: '巴西', MAR: '摩洛哥', SCO: '苏格兰', HAI: '海地',
    USA: '美国', AUS: '澳大利亚', PAR: '巴拉圭', TUR: '土耳其', GER: '德国', ECU: '厄瓜多尔',
    CIV: '科特迪瓦', CUW: '库拉索', NED: '荷兰', JPN: '日本', TUN: '突尼斯', SWE: '瑞典',
    BEL: '比利时', IRN: '伊朗', EGY: '埃及', NZL: '新西兰', ESP: '西班牙', URU: '乌拉圭',
    KSA: '沙特阿拉伯', CPV: '佛得角', FRA: '法国', SEN: '塞内加尔', NOR: '挪威', IRQ: '伊拉克',
    ARG: '阿根廷', AUT: '奥地利', ALG: '阿尔及利亚', JOR: '约旦', POR: '葡萄牙', COL: '哥伦比亚',
    UZB: '乌兹别克斯坦', COD: '刚果民主共和国', ENG: '英格兰', CRO: '克罗地亚', PAN: '巴拿马',
    GHA: '加纳',
  },
};

const LANG_STORAGE_KEY = 'wc2026-lang';

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
  teamName: (id: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLang(value: string): value is Lang {
  return LANGUAGES.some((l) => l.code === value);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && isLang(stored)) {
        setLangState(stored);
        return;
      }
      const nav = navigator.language.slice(0, 2).toLowerCase();
      if (isLang(nav)) setLangState(nav);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const teamName = useCallback(
    (id: string) => TEAM_NAMES[lang]?.[id] ?? TEAMS[id]?.name ?? id,
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: DICT[lang], teamName }),
    [lang, setLang, teamName],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Interpolate {token} placeholders in a string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
