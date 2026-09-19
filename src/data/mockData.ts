/**
 * Módulo Central de Dados Temporários e Mocks do SmartTrip
 * Todos os dados mockados do sistema residem EXCLUSIVAMENTE neste módulo.
 */

import {
  UserProfile,
  TimeOff,
  WeatherForecastSummary,
  Trip,
  POIItem,
  WeatherDay,
  TimelineItem,
  SavedTrip,
} from '../types';

export const IMAGES = {
  // Brand Logo
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTfG8rJdpzmANU-zQUZEI6TSyod0bZS1FlQFz8f5b6cqWUfOE82bMZSncHgR9tH1tixCC6zfsv5mR-6nEiKWZI1g5-TKZu2Ka8EYosexOQ7cGSufaBRWNMHXSmvTfsZHTFVqy4xBjMesMqBr2OoyOQh1oMS_GBC2q_KfSSN_-aImEYfmVhB_htTDI0YJ7NEX4_RcBYlP4kT21RrcY9jcpT7Cby8fREHqjLtBu0rAe8TNDTMHMmlM1PUg',
  
  // Camila (User Profile)
  camila: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg2FpsSnnltzvXTpWaboZyWGbe2MvenF43_iyF5IGf0InKOe4rI22OwbjBJVC25z99iyVv9i1t9kLRNzkJtjvB4oSbkACSmygksaTEh39ORNomnlIQv2jHibIZbAbK98pNQzDLecnejdncP2VYisgomCHo8SPdu7L3BOfz_9wc68EXZcRGP2-37-0_03yoreukml0VS1DDBKkS6m7xBIo_p25eR-Q-X-FZP7GHCzGdq5KyhnnoYe5_Ew',
  camilaAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlZKpSU2zLaL9mzCMVx5fFY7O5rwff7VURTvU1lUYHOdy66bscToxb2O7xUE3pRw0V_83wnvMF6gf-iCWcys88WMvttsEPqhSHYZLyXVvxNnu_yAQFknKwjkk68Qszqa9cJ31hbzAFRHJEnWiqhof0v0-VD2bTQQgnb7jjYMsUvZNUYEZR0spIRgp6C_lWOa9iQpPWTYEXurRDP-XWvXZg35yf2JGK99pZxelAimL79VLuoSOvkPeKVA',
  
  // Destinations & Attractions
  rioSunset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHJ8S2bBP2I7a3g3H9_ZisVw9yczK44DH1E9RtZmDFBlD488oXIeKqa8KRuYGaJPFLP8sefs5kXGq5wbVykmXHT1I817Nht693_eTMSpG0KxZz7D2rPk2GpcN7PyKKRnuJsf7i-xeTXTP1jzyXi8gT-0KP6EcVhsAI_4o6uIWNHYv1kQw61D6dPJ4Mx8nYOJyGX6IRBmzTNffHpH7PdynTM7LvHDK0YfI1gA2Yh6gZ2XjJBtGiTt6SRw',
  lisbon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYrUMxgZe-P4bXU_a3W-DmtmltyyZdzawHmiK1DOcO2LamTXIwTVVfaOLHvueI3xj0iKXCjAa_NbvV7VeFWF4oae8EumyoipCuTcp2Ilz4gMjhipgpRCsqS1A8QCP59VTG7va60S1B-7Jddqfwx-OXOIhBcRohk1v0LCfbmC4LS0HB2EKOt52gk9YgLqT5Qs65XZjvsVGggSORS1HIJA5BpVF1NEAVkrCuqJiJYdCRVQW6vLDkBWd0OA',
  santiago: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIdxMNlyeoSY11eaXpwYQi9XcOIs32js8qJJA0BlnBaWeMVbWk1jaEZ990EkYKq0wNmDtLrefgqtRVwGxhHwD3DMhrLofPl39ZzCU4oUKJ7-uQhGgaQ12jZL0WRuUkJLFnUSwWDcRgy9lVagX5VxmVF3A68SywsdH0vTdl5n4PQQe9jP042uzYQiBEfVQiTsmAhIa0ts-QDVkV7xFUyO0y4Mu6MWI54M70c8OudYJlNS4nkhz5DNQoA',
  kyoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhh2PouuZE56u0Gjaktnl5tqkXUdjRu84tLARZJWJxvW-drFnyWxI8GRZJr4S2BahgbnFAftDYQAyNsdPdEMlAHTXd5GzyZOLciw6P6jHlRqB4AnetDqD1XLCx_cZpg7H4S9wndg_McabfV5HP_U5YmCZJPKVs1oQIF-nSxi3XWLOLlb22IbJhTuVW-SfjrggEkfQqJ0qaUYUt84BUP8nXkVuymwrSLtL9H1r3a2hAGrJiiCAKkb3d0A',
  bariloche: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7AjvAYlvbTKzmjPj3xZxAnSJyEP6MVx_MhoTtbebxLtCz784SjqMa_cPJQSWeSwbl2Pb0TwcyLNKUINwAhlaph337cVs39gb2cwhTghHDL5mcrpjgo9OhwBLfxW9JsHpNv85G1jvDQWhIL12BpPFP64d3pTyybUPIurwySGeMrihlxFWDujRr8aBqTZmPuxwh11sMslI9T6V2S6jbrRsmSNhYpSsnhnrtPaSVOdaLKyE5XLL_MGvmBQ',
  paraty: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLsSjlaoXOmgSgCjcdIDF6hhn4NH0YGGLGZkqO6hCJ9Uj3xB2j4zu5x4cV8vbS7kRrqdUUJiYQL5LTaSWFWjrT7rzrZbAgxb-J8IkTu8DcvMljnJTb4IjJVuUbJVjy7Gv--aDfK_kAGrpvVOcIO9KZewuJS3v7v7mGke6Vk3uO8eMdq3eFMOjqSyXlh-8S9luIM2G3t275RPjzl7y2LB7x3yza8ebMU43bpry8T75XjKeO7onFjloIUw',
  
  // Salvador Specific
  salvadorPelourinho: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn3lzTIrxRVETIm-dcVwGhKdeqLMF8Yru0i8kle2IypPE8EWlFf0X51X3swYwKVF57t6yJ1hYU_8S6FvkfcJPOVLSxTdSVUtwcl3Qp3kximL1SeiKuxfnWT1J9E0a6QaQK12AMT_3WYiQH0_HeghrkuJ-aEqdCkCvw-6_hIkI_C1wf3NDH8cka6F4KXDxf3xqZFK-fauHGLzORG0p6AHkmVXNKpBEMh8P0j-5jxQKbGKLmWxmHlZMXSw',
  salvadorIgreja: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHkN0y8L5IMCmCDElcqvHx1Ec75w4J0dnw34UDw6yPlBZsv80wkPOUvcwnRT0qKvKI87S_QmGoB2ovMbi7YNCVXcHObsvn4isiMy2Rat6zomgdUkB_kxssuqCwiSNrkAqwDsMRcC9rCk8Ib4LAVUymuZNsC0OH1DIwWgz9caiBZEUgjBujqku19tP-XUz0Q4KdhhFKEo4oeQrnfZ4-40i305Ik8HqsrFlZt5Fv3Oc3qGOdf0XHmHzLzg',
  salvadorFarol: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAweDQg0HOCPimNiL6S2np7_T00v42YjDet30wzWNdv8IrxmFsC2UYBjQrFFDjPWwpDW67imPcHLyQwoDI7KQcld6egnY2rEP-Su7AMvrwjyYxQ_jSo2VZP-6o8OpmP92SvBUbNut3Uplj9-8mD-VEGOVFEeLsisiyVsOHaGEd1yep1VIGqloxfM4vlrZ_ZHB2GNGQ-KCbrbfwqMRLEnAS2xnWzQfBGbYwCggXrCdwMatYcU8auKOup1w',

  // Mapa de Salvador (via OpenStreetMap Nominatim tile)
  salvadorMap: 'https://staticmap.openstreetmap.de/staticmap.php?center=-12.9714,-38.5014&zoom=13&size=600x240&markers=-12.9714,-38.5014,red-pushpin',

  // Colaboradores / Reviews
  lucas: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBjuFrk6yBEVA2uTNbkJSplAq0Bys7s4jD3H5JJQPBjJiN-xlPHbElVH0YWfKlb18gPg1yXdYxaAknOzQHWHqzd9Oim_W_VxTpK3Y4H4UNrthPXqQx2eJG2-F1gJqLOJMEbGJVEhMc4tXAuSp8FZCGQJ0cHmqAO6EGJ8qHRpLJpBp5Y5gERW5xTB2EqV6DpH6qMlD8yJSQrdCHX21Z6HnuH9jXsQKVW5LMHB4h0pWKP1RnJRzITiXEg',
  mariana: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrX2x1g9bSM_J1hFkJMBb3YFz5_7Q3PqkHcuYiS0XoHMWB_GvTB3EhT3m5cHgLs7nFo2gDqQ4NhPDtfZY1kBiSEpoBfajO3Y6PUkWKHQULGOHvbLYHyYJjIcq0kDmSpAJuNYqjU9SIQC6PcTaIcnJqrqJK2v-9M_4L0GH8o3wRBJVlsq5YkWS7aePV9XCHwJYpKT_KW26KQHB4OqVE0BpNT6W6rRVQKPU5GgSjE5qM2mFmGVbxuCfA',
};

// 1. Usuário Mockado da SPEC
export const MOCK_USER: UserProfile = {
  name: 'Camila Silva',
  email: 'camila.viajante@smarttrip.com',
  avatar: IMAGES.camila,
  isPro: true,
  savedTripsCount: 4,
  preferences: {
    travelStyle: 'moderate',
    budget: 'moderate',
    preferredInterests: ['Gastronomia típica', 'Centro Histórico & Cultura', 'Praias & Natureza'],
    restrictions: ['Vegetariano'],
    currency: 'BRL',
  },
  createdAt: '2026-01-15',
};

export const INITIAL_USER = MOCK_USER;

// 2. Períodos de Folga da SPEC (RF-006, RF-007)
export const MOCK_TIME_OFFS: TimeOff[] = [
  {
    id: 'to-01',
    userId: 'user-01',
    title: 'Feriado Tiradentes',
    startDate: '2026-04-18',
    endDate: '2026-04-21',
    durationDays: 4,
    type: 'long_weekend',
    notes: 'Ponte de feriado nacional prolongado.',
  },
  {
    id: 'to-02',
    userId: 'user-01',
    title: 'Férias de Inverno',
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    durationDays: 11,
    type: 'vacation',
    notes: 'Período principal de descanso anual.',
  },
  {
    id: 'to-03',
    userId: 'user-01',
    title: 'Recesso de Fim de Ano',
    startDate: '2026-12-24',
    endDate: '2026-12-28',
    durationDays: 5,
    type: 'holiday',
    notes: 'Recesso festivo de Natal.',
  },
];

// 3. Previsão Meteorológica da SPEC (RF-011)
export const MOCK_WEATHER: WeatherForecastSummary = {
  destination: 'Salvador, Bahia, Brasil',
  averageTemp: 28,
  conditionSummary: 'Ensolarado com brisa marítima suave e chance reduzida de chuva rápida.',
  rainProbability: 20,
  days: [
    { dayName: 'Ter', dateStr: '20 Out', minTemp: 23, maxTemp: 28, rainProbability: 10, condition: 'sunny', icon: 'sun' },
    { dayName: 'Qua', dateStr: '21 Out', minTemp: 24, maxTemp: 29, rainProbability: 15, condition: 'partly_cloudy', icon: 'cloud-sun' },
    { dayName: 'Qui', dateStr: '22 Out', minTemp: 22, maxTemp: 26, rainProbability: 60, condition: 'rain', icon: 'cloud-rain', alert: 'Chuva passageira pela manhã. Sugerimos priorizar museus climatizados.' },
    { dayName: 'Sex', dateStr: '23 Out', minTemp: 24, maxTemp: 30, rainProbability: 10, condition: 'sunny', icon: 'sun' },
  ],
};

export const WEATHER_FORECAST: WeatherDay[] = [
  { dayName: 'Ter', dateStr: '20 Out', temp: 28, condition: 'sunny', icon: 'wb_sunny' },
  { dayName: 'Qua', dateStr: '21 Out', temp: 29, condition: 'partly_cloudy', icon: 'partly_cloudy_day' },
  { dayName: 'Qui', dateStr: '22 Out', temp: 26, condition: 'rain', icon: 'rainy', alert: 'Chuva prevista. Museus alocados para ambiente interno.' },
  { dayName: 'Sex', dateStr: '23 Out', temp: 30, condition: 'sunny', icon: 'sunny' },
];

// 4. Pontos de Interesse (POIs) para /explore
export const MOCK_POIS: POIItem[] = [
  {
    id: 'poi-1',
    name: 'Pelourinho & Igreja São Francisco',
    category: 'Cultura & História',
    description: 'Arquitetura barroca colonial, casarões coloridos e ladeiras de pedras.',
    imageUrl: IMAGES.salvadorIgreja,
    rating: 4.9,
    selected: true,
  },
  {
    id: 'poi-2',
    name: 'Farol da Barra & Pôr do Sol',
    category: 'Paisagem & Praia',
    description: 'O mais famoso pôr do sol da Bahia com gramado à beira-mar e água de coco.',
    imageUrl: IMAGES.salvadorFarol,
    rating: 4.8,
    selected: true,
  },
  {
    id: 'poi-3',
    name: 'Mercado Modelo & Elevador Lacerda',
    category: 'Panorâmica & Artesanato',
    description: 'Conexão entre a Cidade Alta e a Cidade Baixa com vista para a baía.',
    imageUrl: IMAGES.salvadorPelourinho,
    rating: 4.7,
    selected: false,
  },
];

// 5. Viagem Detalhada para Curadoria Humana em /trips/[id] (RF-015 a RF-021)
export const MOCK_TRIP_DETAILS: Trip = {
  id: 'salvador-2026',
  userId: 'user-01',
  destination: {
    name: 'Salvador, Bahia, Brasil',
    latitude: -12.9714,
    longitude: -38.5014,
    country: 'Brasil',
  },
  period: {
    startDate: '2026-10-20',
    endDate: '2026-10-23',
    totalDays: 4,
  },
  config: {
    pace: 'moderate',
    budget: 'moderate',
    interests: ['Gastronomia típica', 'Cultura & Museus', 'Praias'],
    restrictions: ['Vegetariano'],
  },
  weatherForecast: MOCK_WEATHER,
  status: 'saved',
  itinerary: [
    {
      dayNumber: 1,
      date: '2026-10-20',
      theme: 'Chegada e Boas-Vindas à Baía de Todos-os-Santos',
      weatherHint: 'Tarde ensolarada (28°C), ideal para passeios leves à beira-mar.',
      shifts: {
        morning: [
          {
            id: 'act-101',
            title: 'Check-in no Hotel e Recepção',
            description: 'Instalação confortável no hotel em Rio Vermelho e descanso da viagem.',
            category: 'leisure',
            suggestedTime: '10:00',
            estimatedDuration: '1h30min',
            estimatedCost: 'Grátis',
            locationName: 'Rio Vermelho',
            tips: 'Aproveite para solicitar mapas locais na recepção.',
          },
        ],
        afternoon: [
          {
            id: 'act-102',
            title: 'Almoço no Restaurante Casa de Tereza',
            description: 'Moqueca de palmito e banana-da-terra em ambiente artístico aconchegante.',
            category: 'food',
            suggestedTime: '12:30',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 75 por pessoa',
            locationName: 'Rua Odilon Santos',
            tips: 'Excelente opção com opções vegetarianas autênticas.',
          },
          {
            id: 'act-103',
            title: 'Caminhada no Farol da Barra',
            description: 'Visita ao forte histórico e contemplação da orla atlântica.',
            category: 'nature',
            suggestedTime: '16:00',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 15 (museu náutico)',
            locationName: 'Largo do Farol da Barra',
            tips: 'Chegue às 17h15 para pegar o ápice das cores do pôr do sol.',
          },
        ],
        night: [
          {
            id: 'act-104',
            title: 'Acarajé & Abará da Cira no Rio Vermelho',
            description: 'Degustação do quitute tradicional com vatapá e vinagrete fresco na praça boêmia.',
            category: 'food',
            suggestedTime: '19:30',
            estimatedDuration: '1h30min',
            estimatedCost: 'R$ 25 por pessoa',
            locationName: 'Largo de Santana',
            tips: 'Peça o acarajé "médio" se não for muito habituado a pimenta forte.',
          },
        ],
      },
    },
    {
      dayNumber: 2,
      date: '2026-10-21',
      theme: 'Coração Histórico e Raízes Coloniais no Pelourinho',
      weatherHint: 'Céu parcialmente nublado (29°C), perfeito para caminhada pelas ladeiras.',
      shifts: {
        morning: [
          {
            id: 'act-201',
            title: 'Igreja e Convento de São Francisco',
            description: 'Passeio guiado pela obra-prima do barroco dourado brasileiro e azulejaria portuguesa.',
            category: 'culture',
            suggestedTime: '09:00',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 10 entrada',
            locationName: 'Largo do Cruzeiro de São Francisco',
            tips: 'Foco nos detalhes talhados em jacarandá e cedro.',
          },
        ],
        afternoon: [
          {
            id: 'act-202',
            title: 'Almoço Cultural no Senac Pelourinho',
            description: 'Buffet com 40 tipos de pratos típicos baianos e doces tradicionais de compota.',
            category: 'food',
            suggestedTime: '12:00',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 68 por pessoa',
            locationName: 'Praça José de Alencar, 13',
            tips: 'As alunas de gastronomia explicam a origem dos pratos.',
          },
          {
            id: 'act-203',
            title: 'Elevador Lacerda e Feira do Mercado Modelo',
            description: 'Descida panorâmica da Cidade Alta para a Cidade Baixa com vista da baía.',
            category: 'culture',
            suggestedTime: '15:00',
            estimatedDuration: '2h30min',
            estimatedCost: 'R$ 0,15 (elevador)',
            locationName: 'Praça Thomé de Souza',
            tips: 'Artesanatos em palha e instrumentos musicais típicos.',
          },
        ],
        night: [
          {
            id: 'act-204',
            title: 'Apresentação do Balé Folclórico da Bahia',
            description: 'Espetáculo de danças afro-brasileiras, capoeira e orixás no Teatro Miguel Santana.',
            category: 'culture',
            suggestedTime: '20:00',
            estimatedDuration: '1h30min',
            estimatedCost: 'R$ 60 por pessoa',
            locationName: 'Rua Maciel de Cima, 19',
            tips: 'Compre ingresso com 1 dia de antecedência.',
          },
        ],
      },
    },
    {
      dayNumber: 3,
      date: '2026-10-22',
      theme: 'Península de Itapagipe e Sagrada Colina do Bonfim',
      weatherHint: 'Possibilidade de garoa matinal (26°C), tarde aberta.',
      shifts: {
        morning: [
          {
            id: 'act-301',
            title: 'Basílica do Senhor do Bonfim',
            description: 'Tradição das fitinhas coloridas no gradil, bênção e arquitetura neoclássica.',
            category: 'culture',
            suggestedTime: '09:30',
            estimatedDuration: '1h30min',
            estimatedCost: 'Grátis',
            locationName: 'Colina Sagrada',
            tips: 'Amarre a fitinha no gradil com três nós e faça três pedidos.',
          },
        ],
        afternoon: [
          {
            id: 'act-302',
            title: 'Sorveteria da Ribeira & Orla',
            description: 'Pausa refrescante na tradicional sorveteria fundada em 1931 com mais de 60 sabores de frutas.',
            category: 'food',
            suggestedTime: '13:00',
            estimatedDuration: '1h30min',
            estimatedCost: 'R$ 20 por pessoa',
            locationName: 'Praça General Osório, 87',
            tips: 'Experimente os sabores de Biribá, Mangaba ou Tapioca.',
          },
          {
            id: 'act-303',
            title: 'Ponta do Humaitá e Forte de Mont-Serrat',
            description: 'Contemplação serena da baía com vista privilegiada de Salvador e do mar calmo.',
            category: 'nature',
            suggestedTime: '15:30',
            estimatedDuration: '2h00min',
            estimatedCost: 'Grátis',
            locationName: 'Monte Serrat',
            tips: 'Lugar perfeito para fotos de arquitetura militar do século XVI.',
          },
        ],
        night: [
          {
            id: 'act-304',
            title: 'Jantar Romântico no Santo Antônio Além do Carmo',
            description: 'Bairro charmoso de casinhas antigas com cafés e bistrôs intimistas com varanda.',
            category: 'food',
            suggestedTime: '19:30',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 80 por pessoa',
            locationName: 'Rua Direita de Santo Antônio',
            tips: 'Mesas da varanda possuem vista espetacular para a baía.',
          },
        ],
      },
    },
    {
      dayNumber: 4,
      date: '2026-10-23',
      theme: 'Praias Tropicais e Despedida Ensolarada',
      weatherHint: 'Dia pleno de sol (30°C), perfeito para praia e banho de mar.',
      shifts: {
        morning: [
          {
            id: 'act-401',
            title: 'Manhã na Praia de Stella Maris',
            description: 'Piscinas naturais formadas nos corais durante a maré baixa com águas mornas.',
            category: 'nature',
            suggestedTime: '08:30',
            estimatedDuration: '3h00min',
            estimatedCost: 'Consumo no quiosque',
            locationName: 'Praia de Stella Maris',
            tips: 'Consulte a tábua de marés para aproveitar as piscinas naturais.',
          },
        ],
        afternoon: [
          {
            id: 'act-402',
            title: 'Almoço de Frutos do Mar em Itapuã',
            description: 'Peixe frito crocante e moqueca à beira-mar imortalizada por Vinicius de Moraes.',
            category: 'food',
            suggestedTime: '12:30',
            estimatedDuration: '2h00min',
            estimatedCost: 'R$ 70 por pessoa',
            locationName: 'Rua da Música',
            tips: 'Tire uma foto na estátua de Dorival Caymmi na praia.',
          },
          {
            id: 'act-403',
            title: 'Compras Finais de Lembranças e Artesanato',
            description: 'Cocadas artesanais, temperos e souvenirs na feira regional.',
            category: 'leisure',
            suggestedTime: '15:30',
            estimatedDuration: '1h30min',
            estimatedCost: 'Variável',
            locationName: 'Aeroporto / Orla',
            tips: 'Embale os doces bem vedados para a viagem de volta.',
          },
        ],
        night: [
          {
            id: 'act-404',
            title: 'Translado e Embarque',
            description: 'Retorno para o aeroporto e embarque com memórias inesquecíveis da Bahia.',
            category: 'transport',
            suggestedTime: '18:30',
            estimatedDuration: '1h30min',
            estimatedCost: 'Uber / Táxi',
            locationName: 'Aeroporto Internacional de Salvador',
            tips: 'Chegue com pelo menos 2h de antecedência para voos domésticos.',
          },
        ],
      },
    },
  ],
  createdAt: '2026-02-01',
  updatedAt: '2026-02-01',
};

// 6. Lista de Viagens Salvas da SPEC (para /trips e /dashboard)
export const MOCK_SAVED_TRIPS: Trip[] = [
  MOCK_TRIP_DETAILS,
  {
    id: 'rio-2026',
    userId: 'user-01',
    destination: {
      name: 'Rio de Janeiro, RJ, Brasil',
      latitude: -22.9068,
      longitude: -43.1729,
      country: 'Brasil',
    },
    period: {
      startDate: '2026-11-12',
      endDate: '2026-11-16',
      totalDays: 5,
    },
    config: {
      pace: 'intense',
      budget: 'moderate',
      interests: ['Praias', 'Natureza', 'Trilhas'],
      restrictions: [],
    },
    weatherForecast: {
      destination: 'Rio de Janeiro',
      averageTemp: 27,
      conditionSummary: 'Sol brilhante com pancadas térmicas de verão.',
      rainProbability: 25,
      days: [],
    },
    status: 'saved',
    itinerary: [],
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
  },
  {
    id: 'gramado-2026',
    userId: 'user-01',
    destination: {
      name: 'Gramado & Canela, RS, Brasil',
      latitude: -29.3744,
      longitude: -50.8764,
      country: 'Brasil',
    },
    period: {
      startDate: '2026-06-04',
      endDate: '2026-06-08',
      totalDays: 4,
    },
    config: {
      pace: 'relaxed',
      budget: 'luxury',
      interests: ['Gastronomia', 'Vinho', 'Natureza'],
      restrictions: [],
    },
    status: 'completed',
    itinerary: [],
    createdAt: '2025-11-10',
    updatedAt: '2025-11-10',
  },
];

// 7. Dados Legados Mantidos para Compatibilidade Visual
export const SALVADOR_TIMELINE_DAY2: TimelineItem[] = [
  {
    id: 't1',
    time: '09h',
    title: 'Centro Histórico & Igreja São Francisco',
    subtitle: 'Passeio a pé pelas ladeiras coloniais de pedras pé-de-moleque e visita à suntuosa igreja barroca folheada a ouro.',
    badge: 'Patrimônio Histórico',
    category: 'Cultura',
    location: '1.8 km hotel',
    tip: 'Melhor até 11h',
    imageUrl: IMAGES.salvadorIgreja,
  },
  {
    id: 't2',
    time: '12h',
    title: 'Restaurante Senac Pelourinho',
    subtitle: 'Moqueca tradicional, vatapá autêntico e buffet completo de sobremesas típicas baianas.',
    badge: 'Gastronomia Baiana',
    category: 'Almoço',
    rating: 4.8,
    price: 'Média R$ 65 / pessoa',
    tip: 'Reserva sugerida',
    location: 'Pelourinho',
  },
  {
    id: 't3',
    time: '15h',
    title: 'Elevador Lacerda & Mercado Modelo',
    subtitle: 'Descida com vista para a Baía de Todos-os-Santos seguida de feira de artesanato regional e berimbaus.',
    badge: 'Panorâmica & Compras',
    category: '~2h duração',
    tip: 'Dica de Foto: Suba no mirante lateral da Estação Superior para enquadrar a baía e os saveiros.',
    location: 'Cidade Baixa',
  },
  {
    id: 't4',
    time: '17h',
    title: 'Farol da Barra com Brisa Marítima',
    subtitle: 'Cerimônia natural aplaudida por locais e visitantes no gramado à beira-mar com água de coco gelada.',
    badge: 'Pôr do Sol Ícone',
    category: '14 min do Pelourinho',
    tip: 'Chegue 20 min antes (17h10) para encontrar lugar no gramado.',
    imageUrl: IMAGES.salvadorFarol,
    location: 'Praia da Barra',
  },
];

export const SAVED_TRIPS: SavedTrip[] = [
  {
    id: 'rio',
    title: 'Rio de Janeiro',
    location: 'Brasil',
    duration: '12 a 16 de Novembro • 5 dias',
    imageUrl: IMAGES.rioSunset,
    isUpcoming: true,
    progress: 85,
    spotsCount: 14,
    budgetTotal: 2450,
    pendingTasks: 3,
  },
  {
    id: 'lisboa',
    title: 'Lisboa Histórica',
    location: 'Portugal',
    duration: '7 Dias',
    imageUrl: IMAGES.lisbon,
    tag: 'Médio (€ 120/dia) • ★ 4.9',
  },
  {
    id: 'santiago',
    title: 'Santiago & Vinhedos',
    location: 'Chile',
    duration: '4 Dias',
    imageUrl: IMAGES.santiago,
    tag: 'Econômico • ★ 4.8',
  },
  {
    id: 'kyoto',
    title: 'Tóquio & Kyoto',
    location: 'Japão',
    duration: '10 Dias',
    imageUrl: IMAGES.kyoto,
    tag: 'Premium • ★ 5.0',
  },
];

export const TRENDING_DESTINATIONS = [
  {
    id: 'bariloche',
    title: 'Bariloche, Argentina',
    temp: '❄️ 14°C',
    desc: 'Circuito Chico, chocolates artesanais e lagos glaciais.',
    discount: 'Voos em Baixa (-22%)',
    imageUrl: IMAGES.bariloche,
  },
  {
    id: 'paraty',
    title: 'Paraty & Ilha Grande',
    temp: '☀️ 29°C',
    desc: 'Passeios de escuna, cachoeiras e charme colonial histórico.',
    discount: 'Ideal p/ Casal',
    imageUrl: IMAGES.paraty,
  },
];
