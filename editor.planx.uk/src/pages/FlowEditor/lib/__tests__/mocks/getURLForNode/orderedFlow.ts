import { OrderedFlow } from "@opensystemslab/planx-core/types";

export const orderedFlow: OrderedFlow = [
  {
    id: "bandQuestion",
    parentId: "_root",
    type: 100,
    edges: ["beatlesAnswer", "rollingStonesAnswer"],
    data: {
      fn: "band",
      text: "Best band?",
    },
  },
  {
    id: "beatlesAnswer",
    parentId: "bandQuestion",
    type: 200,
    edges: ["bestAlbumQuestion"],
    data: {
      val: "beatles",
      text: "Beatles",
    },
  },
  {
    id: "bestAlbumQuestion",
    parentId: "beatlesAnswer",
    type: 100,
    edges: ["sgtPepperAnswer", "whiteAlbumAnswer"],
    data: {
      fn: "beatles.album",
      text: "Best album?",
    },
  },
  {
    id: "sgtPepperAnswer",
    parentId: "bestAlbumQuestion",
    type: 200,
    data: {
      val: "sgtPepper",
      text: "Sgt Pepper",
    },
  },
  {
    id: "whiteAlbumAnswer",
    parentId: "bestAlbumQuestion",
    type: 200,
    edges: ["bestSongQuestion"],
    data: {
      val: "whiteAlbum",
      text: "The White Album",
    },
  },
  {
    id: "bestSongQuestion",
    parentId: "whiteAlbumAnswer",
    type: 100,
    edges: ["gentlyWeepsAnswer", "helterSkelterAnswer"],
    data: {
      fn: "band.album.whiteAlbum",
      text: "Best song?",
    },
  },
  {
    id: "gentlyWeepsAnswer",
    parentId: "bestSongQuestion",
    type: 200,
    edges: ["tellMyWhyTextInput"],
    data: {
      val: "gentlyWeeps",
      text: "While my guitar gently weeps",
    },
  },
  {
    id: "tellMyWhyTextInput",
    parentId: "gentlyWeepsAnswer",
    type: 110,
    data: {
      fn: "best.song.reason",
      title: "Tell me why!",
    },
  },
  {
    id: "helterSkelterAnswer",
    parentId: "bestSongQuestion",
    type: 200,
    edges: ["tellMyWhyTextInput"],
    data: {
      val: "helterSkelter",
      text: "Helter Skelter",
    },
  },
  {
    id: "rollingStonesAnswer",
    parentId: "bandQuestion",
    type: 200,
    data: {
      val: "rollingStones",
      text: "Rolling Stones",
    },
  },
  {
    id: "moviesPortal",
    parentId: "_root",
    type: 300,
    edges: ["bestDirectorQuestion"],
    data: {
      text: "Movies",
    },
  },
  {
    id: "bestDirectorQuestion",
    parentId: "moviesPortal",
    type: 100,
    edges: ["kubrickAnswer", "tarantinoAnswer"],
    data: {
      fn: "director",
      text: "Best director?",
    },
  },
  {
    id: "kubrickAnswer",
    parentId: "bestDirectorQuestion",
    type: 200,
    data: {
      val: "kubrick",
      text: "Stanley Kubrick",
    },
  },
  {
    id: "tarantinoAnswer",
    parentId: "bestDirectorQuestion",
    type: 200,
    edges: ["tarantinoPortal"],
    data: {
      val: "tarantino",
      text: "Quentin Tarantino",
    },
  },
  {
    id: "tarantinoPortal",
    parentId: "tarantinoAnswer",
    type: 300,
    edges: ["tarantinoMovieQuestion"],
    data: {
      text: "Tarantino Movies",
    },
  },
  {
    id: "tarantinoMovieQuestion",
    parentId: "tarantinoPortal",
    type: 100,
    edges: ["jackieBrownAnswer", "reservoirDogsAnswer"],
    data: {
      fn: "movie.tarantino",
      text: "Best Tarantino movie?",
    },
  },
  {
    id: "jackieBrownAnswer",
    parentId: "tarantinoMovieQuestion",
    type: 200,
    data: {
      val: "jackieBrown",
      text: "Jackie Brown",
    },
  },
  {
    id: "reservoirDogsAnswer",
    parentId: "tarantinoMovieQuestion",
    type: 200,
    data: {
      val: "reservoirDogs",
      text: "Reservoir Dogs",
    },
  },
];
