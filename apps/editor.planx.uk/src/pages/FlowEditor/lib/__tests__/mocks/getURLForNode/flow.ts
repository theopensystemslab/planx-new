import type { Store } from "pages/FlowEditor/lib/store";

export const flow: Store.Flow = {
  _root: {
    edges: ["bandQuestion", "moviesPortal"],
  },
  bandQuestion: {
    type: 100,
    data: {
      fn: "band",
      text: "Best band?",
    },
    edges: ["beatlesAnswer", "rollingStonesAnswer"],
  },
  beatlesAnswer: {
    type: 200,
    data: {
      val: "beatles",
      text: "Beatles",
    },
    edges: ["bestAlbumQuestion"],
  },
  bestAlbumQuestion: {
    type: 100,
    data: {
      fn: "beatles.album",
      text: "Best album?",
    },
    edges: ["sgtPepperAnswer", "whiteAlbumAnswer"],
  },
  sgtPepperAnswer: {
    type: 200,
    data: {
      val: "sgtPepper",
      text: "Sgt Pepper",
    },
  },
  whiteAlbumAnswer: {
    type: 200,
    data: {
      val: "whiteAlbum",
      text: "The White Album",
    },
    edges: ["bestSongQuestion"],
  },
  bestSongQuestion: {
    type: 100,
    data: {
      fn: "band.album.whiteAlbum",
      text: "Best song?",
    },
    edges: ["gentlyWeepsAnswer", "helterSkelterAnswer"],
  },
  gentlyWeepsAnswer: {
    type: 200,
    data: {
      val: "gentlyWeeps",
      text: "While my guitar gently weeps",
    },
    edges: ["tellMyWhyTextInput"],
  },
  tellMyWhyTextInput: {
    type: 110,
    data: {
      fn: "best.song.reason",
      title: "Tell me why!",
    },
  },
  helterSkelterAnswer: {
    type: 200,
    data: {
      val: "helterSkelter",
      text: "Helter Skelter",
    },
    edges: ["tellMyWhyTextInput"],
  },
  rollingStonesAnswer: {
    type: 200,
    data: {
      val: "rollingStones",
      text: "Rolling Stones",
    },
  },
  moviesPortal: {
    type: 300,
    data: {
      text: "Movies",
    },
    edges: ["bestDirectorQuestion"],
  },
  bestDirectorQuestion: {
    type: 100,
    data: {
      fn: "director",
      text: "Best director?",
    },
    edges: ["kubrickAnswer", "tarantinoAnswer"],
  },
  kubrickAnswer: {
    type: 200,
    data: {
      val: "kubrick",
      text: "Stanley Kubrick",
    },
  },
  tarantinoAnswer: {
    type: 200,
    data: {
      val: "tarantino",
      text: "Quentin Tarantino",
    },
    edges: ["tarantinoPortal"],
  },
  tarantinoPortal: {
    type: 300,
    data: {
      text: "Tarantino Movies",
    },
    edges: ["tarantinoMovieQuestion"],
  },
  tarantinoMovieQuestion: {
    type: 100,
    data: {
      fn: "movie.tarantino",
      text: "Best Tarantino movie?",
    },
    edges: ["jackieBrownAnswer", "reservoirDogsAnswer"],
  },
  jackieBrownAnswer: {
    type: 200,
    data: {
      val: "jackieBrown",
      text: "Jackie Brown",
    },
  },
  reservoirDogsAnswer: {
    type: 200,
    data: {
      val: "reservoirDogs",
      text: "Reservoir Dogs",
    },
  },
};
