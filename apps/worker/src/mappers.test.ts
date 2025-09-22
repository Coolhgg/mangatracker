import { mapSeries, mapChapter } from "./mappers";

describe("mangadex mappers", () => {
  it("maps series with cover", () => {
    const d = {
      id: "abcd",
      attributes: { title: { en: "Title" }, description: { en: "Desc" } },
      relationships: [{ type: "cover_art", attributes: { fileName: "file.jpg" } }]
    };
    const s = mapSeries(d);
    expect(s).toEqual({ id: "abcd", title: "Title", description: "Desc", coverUrl: expect.stringContaining("/abcd/file.jpg.") });
  });
  it("maps chapter fields", () => {
    const d = { id: "ch1", attributes: { chapter: "1", title: "Start", publishAt: "2020-01-01T00:00:00Z" } };
    const c = mapChapter(d);
    expect(c.id).toBe("ch1");
    expect(c.number).toBe("1");
    expect(c.title).toBe("Start");
    expect(c.publishedAt).toBeInstanceOf(Date);
  });
});
