import { useStore } from "../store";
import { orderedFlow } from "./mocks/getURLForNode/orderedFlow";

const { getState, setState } = useStore;
const { getURLForNode } = getState();

beforeAll(() =>
  setState({ orderedFlow, teamSlug: "testTeam", flowSlug: "testFlow" }),
);

describe("constructing URLs for nodes", () => {
  test("a question node on the root", () => {
    const url = getURLForNode("bandQuestion");
    expect(url).toEqual(
      "/testTeam/testFlow/nodes/_root/nodes/bandQuestion/edit",
    );
  });

  test("an answer node, of a question on the root", () => {
    const url = getURLForNode("beatlesAnswer");
    expect(url).toEqual(
      "/testTeam/testFlow/nodes/_root/nodes/bandQuestion/edit",
    );
  });

  test("a question node, deeply branched", () => {
    const url = getURLForNode("bestSongQuestion");
    expect(url).toEqual(
      "/testTeam/testFlow/nodes/whiteAlbumAnswer/nodes/bestSongQuestion/edit",
    );
  });

  test("an answer node, of a deeply branched question", () => {
    const url = getURLForNode("helterSkelterAnswer");
    expect(url).toEqual(
      "/testTeam/testFlow/nodes/whiteAlbumAnswer/nodes/bestSongQuestion/edit",
    );
  });

  test("a question node, within an internal portal", () => {
    const url = getURLForNode("bestDirectorQuestion");
    expect(url).toEqual(
      "/testTeam/testFlow,moviesPortal/nodes/moviesPortal/nodes/bestDirectorQuestion/edit",
    );
  });

  test("an answer node, within an internal portal", () => {
    const url = getURLForNode("tarantinoAnswer");
    expect(url).toEqual(
      "/testTeam/testFlow,moviesPortal/nodes/moviesPortal/nodes/bestDirectorQuestion/edit",
    );
  });

  test("a question node, deeply within internal portals", () => {
    const url = getURLForNode("tarantinoMovieQuestion");
    expect(url).toEqual(
      "/testTeam/testFlow,moviesPortal,tarantinoPortal/nodes/tarantinoPortal/nodes/tarantinoMovieQuestion/edit",
    );
  });

  test("an answer node, deeply within internal portals", () => {
    const url = getURLForNode("reservoirDogsAnswer");
    expect(url).toEqual(
      "/testTeam/testFlow,moviesPortal,tarantinoPortal/nodes/tarantinoPortal/nodes/tarantinoMovieQuestion/edit",
    );
  });

  test("a cloned node", () => {
    const url = getURLForNode("tellMyWhyTextInput");
    expect(url).toEqual(
      "/testTeam/testFlow/nodes/gentlyWeepsAnswer/nodes/tellMyWhyTextInput/edit",
    );
  });
});
